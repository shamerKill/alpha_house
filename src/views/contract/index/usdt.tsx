import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, StyleSheet, Image, Text, Animated, SafeAreaView, TouchableNativeFeedback as StaticTouchableNativeFeedback, Image as StaticImage,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import {
  TouchableNativeFeedback, ScrollView, PanGestureHandlerGestureEvent, PanGestureHandler, TextInput,
} from 'react-native-gesture-handler';
import { showMessage } from 'react-native-flash-message';
import Socket, { marketSocket, SocketClass } from '../../../data/fetch/socket';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';
import {
  themeWhite, defaultThemeColor, defaultThemeBgColor, themeBlack, themeMoreBlue, getThemeOpacity, themeGray, themeGreen, themeRed, themeTextGray,
} from '../../../config/theme';
import { useGoToWithLogin } from '../../../tools/routeTools';
import { modalOutBg } from '../../../components/modal/outBg';
import {
  numberToFormatString, fiexedNumber, towNumAdd, towNumCut, NumberTools,
} from '../../../tools/number';
import showSelector from '../../../components/modal/selector';
import storage from '../../../data/database';
import showComAlert from '../../../components/modal/alert';
import ajax from '../../../data/fetch';
import { TypePositionData, TypeGeneralEntrustemnt, TypeStopOrder } from './type';
import ComFormButton from '../../../components/form/button';
import getSymbolBond from './bondData';

const routeName = 'Contract';

// 滑块组件
const ComSliderView: FC<{
  fixedValueRatio: number;
  setFixedValueRatio: React.Dispatch<React.SetStateAction<number>>;
}> = ({
  fixedValueRatio,
  setFixedValueRatio,
}) => {
  // 获取滑块线组件
  const sliderViewWidth = useRef(0);
  const sliderTimer = useRef(0);

  const [ratioValue, setRatioValue] = useState(fixedValueRatio);
  const addEvent = {
    // 点击滑块移动
    sliderMove: (e: PanGestureHandlerGestureEvent['nativeEvent']) => {
      const toX = e.absoluteX - 12;
      let ratio = toX / sliderViewWidth.current;
      if (ratio > 1) ratio = 1;
      if (ratio < 0) ratio = 0;
      ratio = Math.round(ratio * 100);
      if (ratio !== ratioValue) {
        addEvent.backSliderHadler(ratio);
      }
    },
    // 处理滑块向上级传递数据
    backSliderHadler: (ratio: number) => {
      setRatioValue(ratio);
      clearTimeout(sliderTimer.current);
      sliderTimer.current = Number(setTimeout(() => {
        setFixedValueRatio(ratio);
      }, 100));
    },
  };

  useEffect(() => {
    if (ratioValue !== fixedValueRatio) {
      setRatioValue(fixedValueRatio);
    }
  }, [fixedValueRatio]);
  return (
    <View>
      {/* 所占百分比 */}
      <Text style={style.priceValueRatioText}>
        {ratioValue}%
      </Text>
      {/* 百分比操作区 */}
      <View style={style.ratioDoView}>
        <View
          style={style.ratioDoViewLine}
          onLayout={e => { sliderViewWidth.current = e.nativeEvent.layout.width; }}>
          {/* 选中内色条 */}
          <View style={[
            style.ratioDoViewInLine,
            {
              width: `${ratioValue}%`,
            },
          ]} />
          {/* 百分比点 */}
          {
            [0, 1, 2, 3, 4].map(item => (
              <View
                key={item}
                style={[
                  style.ratioDoViewPoint,
                  {
                    left: `${item * 25}%`,
                    backgroundColor: (ratioValue / 25) > item ? defaultThemeColor : getThemeOpacity(themeGray, 0.3),
                  },
                ]} />
            ))
          }
        </View>
        <PanGestureHandler
          onGestureEvent={e => addEvent.sliderMove(e.nativeEvent)}>
          <View style={[
            style.ratioDoIconView,
            {
              left: `${ratioValue}%`,
            },
          ]}>
            <Image
              style={style.ratioDoIconImage}
              resizeMode="contain"
              source={require('../../../assets/images/icons/contract_progress_box.png')} />
          </View>
        </PanGestureHandler>
      </View>
      {/* 百分比选择区 */}
      <View style={style.ratioBtnsView}>
        {
          [25, 50, 75, 100].map(item => (
            <StaticTouchableNativeFeedback key={item} onPress={() => addEvent.backSliderHadler(item)}>
              <View style={[
                style.ratioBtnView,
                item === ratioValue && style.ratioBtnViewSelect,
              ]}>
                <Text style={[
                  style.ratioBtnText,
                  item === ratioValue && style.ratioBtnTextSelect,
                ]}>
                  {item}%
                </Text>
              </View>
            </StaticTouchableNativeFeedback>
          ))
        }
      </View>
    </View>
  );
};

// 买卖列表类型
type TypeSellBuyList = {
  price: string;
  value: number;
};
// 右侧数据显示
const ContractRightValueView: FC<{
  defalutPrice: string;
  coinType: string;
  changeValue: (data: string) => void;
}> = ({ defalutPrice, coinType, changeValue }) => {
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  // 买列表
  const [buyData, setBuyData] = useState<(TypeSellBuyList&{ratio?:string})[]>([]);
  // 卖
  const [sellData, setSellData] = useState<(TypeSellBuyList&{ratio?:string})[]>([]);
  // 最新价格
  const [newPrice, setNewPrice] = useState(defalutPrice);
  const [prevNewPrice, setPrevNewPrice] = useState('--');
  // 指数价
  const [markPrice, setMarkPrice] = useState('--');
  // 涨1还是跌0
  const [direction, setDirection] = useState<0|1>(0);

  // 更改右侧显示最新数据
  ContractRightValueView.prototype.setNewPrice = (price: string) => {
    setNewPrice(price);
  };
  // 更改右侧指数价
  ContractRightValueView.prototype.setNewRiskPrice = (price: string) => {
    setMarkPrice(price);
  };

  const addEvent = {
    setData: (data: TypeSellBuyList[]) => {
      const maxValue = Math.max(...data.map(item => item.value));
      const useData = data.map(item => {
        const result = {
          ...item,
          ratio: `${(item.value / maxValue) * 100}%`,
        };
        return result;
      });
      return useData;
    },
    // 获取数据
    getValueData: (data: string) => {
      changeValue(data);
    },
  };

  // 判断涨跌
  useEffect(() => {
    if (parseFloat(prevNewPrice) > parseFloat(newPrice)) setDirection(0);
    else setDirection(1);
    setPrevNewPrice(newPrice);
  }, [newPrice]);

  useEffect(() => {
    if (!coinType) return;
    setBuyData([
      { price: '', value: 0 },
      { price: '', value: 0 },
      { price: '', value: 0 },
      { price: '', value: 0 },
      { price: '', value: 0 },
      { price: '', value: 0 },
    ]);
    setSellData([
      { price: '', value: 0 },
      { price: '', value: 0 },
      { price: '', value: 0 },
      { price: '', value: 0 },
      { price: '', value: 0 },
      { price: '', value: 0 },
    ]);
    // 获取深度
    const tickerImg = `gold.market.${coinType.replace('/', '')}.depth`;
    const socketListener = (message: any) => {
      if (message?.buy && message?.sell) {
        if (message.buy.length < 6 || message.sell.length < 6) return;
        const buyDataMem = [...message.sell].splice(0, 6).reverse().map((item: any) => ({
          price: item[0],
          value: item[1],
        }));
        const sellDataMem = [...message.buy].splice(0, 6).map((item: any) => ({
          price: item[0],
          value: item[1],
        }));
        const allData = addEvent.setData([...buyDataMem, ...sellDataMem]);
        setBuyData(allData.splice(0, 6));
        setSellData(allData);
      }
    };
    if (routePage === routeName) {
      marketSocket.getSocket().then(ws => {
        socket.current = ws;
        ws.addListener(socketListener, tickerImg);
        ws.send(tickerImg, 'req');
        ws.send(tickerImg, 'sub');
        subSocket.current = false;
      }).catch(err => {
        console.log(err);
      });
    } else if (socket.current) {
      if (!subSocket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(socketListener);
      }
    }
    // eslint-disable-next-line consistent-return
    return () => {
      if (!subSocket.current && socket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(socketListener);
      }
    };
  }, [routePage, coinType]);
  return (
    <View>
      <View style={style.contentListView}>
        {
          buyData.map((item, index) => (
            <TouchableNativeFeedback
              key={index}
              onPress={() => addEvent.getValueData(item.price)}>
              <View key={index} style={style.contentListViewLi}>
                <Text style={[
                  style.contextListTitleLeft,
                  { color: themeRed },
                ]}>
                  {item.price}
                </Text>
                <Text
                  style={style.contentListTitleRight}>
                  {item.value ? numberToFormatString(item.value) : ''}
                </Text>
                <View style={[
                  style.contentListBg,
                  { backgroundColor: themeRed, width: item.ratio },
                ]} />
              </View>
            </TouchableNativeFeedback>
          ))
        }
      </View>
      <View style={style.contentIndexView}>
        <Text style={style.contentIndexTitle}>
          <Text style={[
            style.contentIndexPrice,
            { color: [themeRed, themeRed][direction] },
          ]}>
            {newPrice}
          </Text>
          {/* &#8776;&yen;{((parseFloat(newPrice) || 0) * USDTToRMB).toFixed(2)} */}
        </Text>
        <Text style={style.contentIndexDesc}>最新指数&nbsp;{markPrice}</Text>
      </View>
      <View style={style.contentListView}>
        {
          sellData.map((item, index) => (
            <TouchableNativeFeedback
              key={index}
              onPress={() => addEvent.getValueData(item.price)}>
              <View style={style.contentListViewLi}>
                <Text style={[
                  style.contextListTitleLeft,
                  { color: themeGreen },
                ]}>
                  {item.price}
                </Text>
                <Text
                  style={style.contentListTitleRight}>
                  {item.value ? numberToFormatString(item.value) : ''}
                </Text>
                <View style={[
                  style.contentListBg,
                  { backgroundColor: themeGreen, width: item.ratio },
                ]} />
              </View>
            </TouchableNativeFeedback>
          ))
        }
      </View>
    </View>
  );
};


// 左侧列表
export const ContractHeadLeftView: FC<{
  coinType: string;
  changeCoin: (id: string) => void;
  defaultLeftList: {symbol: string; ratio: string; price: string;}[];
}> = ({
  coinType,
  changeCoin,
  defaultLeftList,
}) => {
  const [leftList, setLeftList] = useState<typeof defaultLeftList>(defaultLeftList);
  const animatedValue = useRef(new Animated.Value(-400));
  const isShow = useRef(true);
  const addEvent = {
    changeCoinType: (id: string) => {
      changeCoin(id);
      modalOutBg.outBgsetShow(false);
      isShow.current = false;
    },
  };

  // 更改左侧列表数据
  ContractHeadLeftView.prototype.setLeftList = (list: typeof leftList) => {
    if (isShow.current) setLeftList(list);
  };

  useEffect(() => {
    Animated.timing(
      animatedValue.current, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      },
    ).start();
  }, []);
  return (
    <Animated.View style={[
      style.leftListView,
      {
        transform: [{
          translateX: animatedValue.current,
        }],
      },
    ]}>
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={style.leftListTitle}>{coinType}</Text>
        <ScrollView style={{ flex: 1 }}>
          {
            leftList?.map(item => {
              const ratioNum = parseFloat(item.ratio);
              let color = themeGray;
              if (ratioNum > 0) color = themeGreen;
              if (ratioNum < 0) color = themeRed;
              return (
                <StaticTouchableNativeFeedback key={item.symbol} onPress={() => addEvent.changeCoinType(item.symbol)}>
                  <View style={style.leftListLine}>
                    <Text style={style.leftListName}>{item.symbol}</Text>
                    <Text style={[
                      style.leftListPrice,
                      { color },
                    ]}>
                      {item.price}
                    </Text>
                    <Text style={[
                      style.leftListRatio,
                      { color },
                    ]}>
                      {item.ratio}
                    </Text>
                  </View>
                </StaticTouchableNativeFeedback>
              );
            })
          }
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};

// 持仓列表视图
const ComContractIndexListPosition: FC<{
  data: TypePositionData,
  riskPrice: string,
}> = ({ data, riskPrice }) => {
  // 获取是否有止盈止损的提示框
  const showStopAlert = useRef(true);

  useEffect(() => {
    storage.get<string>('showStopAlert').then(alertType => {
      if (alertType === 'ok') {
        showStopAlert.current = false;
      } else {
        showStopAlert.current = true;
      }
    }).catch(() => {
      showStopAlert.current = true;
    });
  }, []);

  const navigation = useNavigation();

  const isLoading = useRef(false);

  const addEvent = {
    // 计算颜色
    getColor: (num: string) => {
      return parseFloat(num) < 0 ? themeRed : themeGreen;
    },
    // 止盈止损弹窗
    stopAlert: () => {
      if (!showStopAlert.current) {
        return new Promise(resolve => resolve());
      }
      return new Promise(resolve => {
        const close = showComAlert({
          title: '温馨提示',
          desc: '止盈止损触发后将按照设定的方式和价格向市场进行委托，成交价格受市场深度影响。满足触发条件时将立即触发，请在知晓风险的情况下使用。',
          success: {
            text: '知道了',
            onPress: () => {
              close();
              resolve();
            },
          },
          close: {
            text: '不再提示',
            onPress: () => {
              close();
              resolve();
              storage.save('showStopAlert', 'ok');
            },
          },
        });
      });
    },
    // 止盈
    stopWin: async () => {
      await addEvent.stopAlert();
      navigation.navigate('ContractOrderClose', {
        id: data.id,
        coinType: data.coinType,
        type: data.type,
        willType: 1,
        openPrice: data.price,
        value: data.allValue,
      });
    },
    // 止损
    stopLow: async () => {
      await addEvent.stopAlert();
      navigation.navigate('ContractOrderClose', {
        id: data.id,
        coinType: data.coinType,
        type: data.type,
        willType: 0,
        openPrice: data.price,
        value: data.allValue,
      });
    },
    // 平仓
    closeOrder: () => {
      const close = showComAlert({
        desc: `是否进行委托${['平空', '平多'][data.type]}${data.allValue}${data.coinType.replace('/USDT', '')}?`,
        success: {
          text: '平仓',
          onPress: () => {
            close();
            addEvent.submitCloseOrder();
          },
        },
        close: {
          text: '取消',
          onPress: () => close(),
        },
      });
    },
    // 执行平仓
    submitCloseOrder: () => {
      isLoading.current = true;
      const fm: {[key: string]: any} = {};
      fm.price = 10;
      fm.num = data.allValue;
      fm.lever = Number(data.leverType);
      fm.symbol = data.coinType.replace('USDT', '');
      fm.side = ['BUY', 'SELL'][data.type];
      fm.price_type = 2;
      fm.postition_side = ['SHORT', 'LONG'][data.type];
      ajax.post('/contract/api/v1/bian/Order', fm).then(res => {
        if (res.status === 200) {
          showMessage({
            position: 'bottom',
            message: '委托提交成功',
            type: 'success',
          });
        } else {
          showMessage({
            position: 'bottom',
            message: res.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        isLoading.current = false;
      });
    },
  };

  return (
    <View style={style.listView}>
      {/* 头部 */}
      <View style={style.listTop}>
        <Text style={[
          style.listTitle,
          {
            color: [themeRed, themeGreen][data.type],
          },
        ]}>
          {data.type === 0 ? '开空' : '开多'}
          &nbsp;&nbsp;
          {data.coinType}
          &nbsp;&nbsp;
          {data.leverType}X
        </Text>
        <ComFormButton
          style={{
            height: 24,
            padding: 0,
          }}
          containerStyle={{
            width: 100,
          }}
          fontStyle={{
            fontSize: 12,
          }}
          gray={parseFloat(data.profitRatio) <= 0}
          title="持仓收益分享"
          onPress={() => {
            navigation.navigate('ContractLogsShare', {
              symbol: data.coinType, // 币种
              type: data.type, // 开空/开多
              openPrice: data.price, // 持仓均价
              closePrice: fiexedNumber(riskPrice, 4), // 当前价格
              ratio: data.profitRatio, // 收益率
            });
          }} />
      </View>
      {/* 中部 */}
      <View style={style.listCenter}>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerLeft,
        ]}>
          <Text style={style.listCenterValue}>{data.price}</Text>
          <Text style={style.listCenterDesc}>持仓均价</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerCenter,
        ]}>
          <Text style={[
            style.listCenterValue,
            { color: addEvent.getColor(data.profitRatio) },
          ]}>
            {data.profitValue}
          </Text>
          <Text style={style.listCenterDesc}>未实现盈亏</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          <Text style={[
            style.listCenterValue,
            { color: addEvent.getColor(data.profitRatio) },
          ]}>
            {data.profitRatio}
          </Text>
          <Text style={style.listCenterDesc}>收益率</Text>
        </View>
      </View>
      {/* 详情 */}
      <View style={style.listInfo}>
        <Text style={[
          style.listInfoText,
          { width: '33%' },
        ]}>
          总仓&nbsp;{data.allValue}{data.coinType.replace('/USDT', '')}
        </Text>
        <Text style={[
          style.listInfoText,
          { width: '66%', textAlign: 'left' },
        ]}>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;占用保证金&nbsp;{fiexedNumber(data.useBond, 4)}USDT
        </Text>
        <Text style={[
          style.listInfoText,
          { width: '33%' },
        ]}>
          预估强平价&nbsp;{data.willBoomPrice}
        </Text>
        <Text style={[
          style.listInfoText,
          { width: '66%', textAlign: 'left' },
        ]}>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;开仓时间&nbsp;{data.time}
        </Text>
      </View>
      {/* 按钮 */}
      <View style={style.listBtns}>
        <StaticTouchableNativeFeedback onPress={() => addEvent.stopWin()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>止盈</Text>
          </View>
        </StaticTouchableNativeFeedback>
        <View style={style.listBtnsLine} />
        <StaticTouchableNativeFeedback onPress={() => addEvent.stopLow()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>止损</Text>
          </View>
        </StaticTouchableNativeFeedback>
        <View style={style.listBtnsLine} />
        <StaticTouchableNativeFeedback onPress={() => addEvent.closeOrder()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>平仓</Text>
          </View>
        </StaticTouchableNativeFeedback>
      </View>
    </View>
  );
};
// 普通委托
const ComContractIndexListGeneral: FC<{data: TypeGeneralEntrustemnt;}> = ({ data }) => {
  const loading = useRef(false);
  const navigation = useNavigation();
  const addEvent = {
    // 撤销订单
    backOrder: () => {
      if (loading.current) {
        showMessage({
          position: 'bottom',
          message: '您有委托正在撤销中，请等待',
          type: 'warning',
        });
        return;
      }
      const close = showComAlert({
        desc: '确定撤销此委托单么？',
        success: {
          text: '确定',
          onPress: () => {
            addEvent.submitBackOrder();
            close();
          },
        },
        close: {
          text: '取消',
          onPress: () => {
            close();
          },
        },
      });
    },
    submitBackOrder: () => {
      loading.current = true;
      ajax.get(`/contract/api/v1/bian/revoke_order?orderId=${data.id}&symbol=${data.coinType.replace('USDT', '')}`).then(res => {
        if (res.status === 200) {
          showMessage({
            position: 'bottom',
            message: '撤销成功',
            type: 'success',
          });
        } else {
          showMessage({
            position: 'bottom',
            message: res.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        loading.current = false;
      });
    },
    // 预设止盈止损
    willStopOrder: () => {
      const close = showComAlert({
        title: '温馨提示',
        desc: (<Text style={{ lineHeight: 20 }}>预设止盈止损并非实际存在的止盈止损单，需委托成交后才可发起。因行情变动剧烈，预设单不保证预设一定生效。下单委托成交后，默认将按照您的实际成交数量全部挂上止盈止损单。如您撤销挂单委托，预设止盈止损单将同时失效。</Text>),
        success: {
          text: '知道了',
          onPress: () => {
            close();
            navigation.navigate('ContractWillClose', { id: data.id });
          },
        },
        close: {
          text: '不再提示',
          onPress: () => {
            close();
            navigation.navigate('ContractWillClose', { id: data.id });
          },
        },
      });
    },
  };
  return (
    <View style={style.listView}>
      {/* 头部 */}
      <View style={style.listTop}>
        <Text style={[
          style.listTitle,
          {
            color: [themeRed, themeGreen, themeRed, themeGreen][data.type],
          },
        ]}>
          {['开空', '开多', '平空', '平多'][data.type]}
          &nbsp;&nbsp;
          {data.coinType}
          &nbsp;&nbsp;
          {data.leverType}X
        </Text>
        <Text style={style.listTopTime}>{data.time}</Text>
      </View>
      {/* 中部 */}
      <View style={style.listCenter}>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerLeft,
        ]}>
          <Text style={style.listCenterValue}>{data.willNumber}</Text>
          <Text style={style.listCenterDesc}>委托量</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerCenter,
        ]}>
          <Text style={[style.listCenterValue]}>
            {data.willPrice}
          </Text>
          <Text style={style.listCenterDesc}>委托价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          <Text style={[style.listCenterValue]}>
            {data.haveNumber}
          </Text>
          <Text style={style.listCenterDesc}>已成交</Text>
        </View>
      </View>
      {/* 详情 */}
      <View style={style.listInfo}>
        <Text style={style.listInfoText}>可撤&nbsp;{data.backValue}</Text>
        <Text style={style.listInfoText}>状态&nbsp;{['未成交', '部分成交'][data.state]}</Text>
        {/* <Text style={style.listInfoText}>止盈触发价&nbsp;{data.winStartPrice}</Text>
        <Text style={style.listInfoText}>止盈执行价&nbsp;{data.winDoPrice}</Text>
        <Text style={style.listInfoText}>止损触发价&nbsp;{data.lowStartPrice}</Text>
        <Text style={style.listInfoText}>止损执行价&nbsp;{data.lowDoPrice}</Text> */}
      </View>
      {/* 按钮 */}
      <View style={style.listBtns}>
        <StaticTouchableNativeFeedback onPress={() => addEvent.backOrder()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>撤销</Text>
          </View>
        </StaticTouchableNativeFeedback>
        <View style={style.listBtnsLine} />
        {/* <TouchableNativeFeedback onPress={() => addEvent.willStopOrder()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>预设止盈止损</Text>
          </View>
        </TouchableNativeFeedback> */}
      </View>
    </View>
  );
};
// 止盈止损
const ComContractIndexListOrder: FC<{data: TypeStopOrder, spliceOrder: () => void;}> = ({ data, spliceOrder }) => {
  const [loading, setLoading] = useState(false);

  const addEvent = {
    // 撤销订单
    backOrder: () => {
      if (loading) return;
      // 提示
      const close = showComAlert({
        title: '订单撤销',
        desc: `是否撤销当前${['止盈', '止损'][data.type]}订单?`,
        success: {
          text: '确定',
          onPress: () => {
            addEvent.submit(close);
          },
        },
        close: {
          text: '取消',
          onPress: () => {
            close();
          },
        },
      });
    },
    // 提交
    submit: (close: () => void) => {
      setLoading(true);
      ajax.get(`/contract/api/v2/order/revokeProfitLoss?id=${data.id}`).then(res => {
        if (res.status === 200) {
          showMessage({
            position: 'bottom',
            type: 'success',
            message: res.message,
          });
          spliceOrder();
        } else {
          showMessage({
            position: 'bottom',
            type: 'warning',
            message: res.message,
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        close();
        setLoading(false);
      });
    },
  };

  return (
    <View style={style.listView}>
      {/* 头部 */}
      <View style={[style.listTop, { justifyContent: 'flex-start' }]}>
        <Text style={[
          style.listTitle,
          {
            color: [themeRed, themeGreen][data.type],
          },
        ]}>
          {data.type === 0 ? '开空' : '开多'}
          &nbsp;&nbsp;
          {data.coinType}
          &nbsp;&nbsp;
          {data.leverType}X
        </Text>
        <Text style={style.listTitleDesc}>{['未触发', '触发'][data.state]}</Text>
      </View>
      {/* 中部 */}
      <View style={style.listCenter}>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerLeft,
        ]}>
          <Text style={style.listCenterValue}>{data.startPrice}</Text>
          <Text style={style.listCenterDesc}>触发价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerCenter,
        ]}>
          <Text style={[style.listCenterValue]}>
            {data.doPrice}
          </Text>
          <Text style={style.listCenterDesc}>执行价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          <Text style={[style.listCenterValue, { color: [themeRed, themeGreen][data.stopType] }]}>
            {['止损', '止盈'][data.stopType]}
          </Text>
          <Text style={style.listCenterDesc}>盈损</Text>
        </View>
      </View>
      {/* 详情 */}
      <View style={style.listInfo}>
        <Text style={style.listInfoText}>方式&nbsp;{['限价', '市价'][data.doPriceType]}</Text>
        <Text style={style.listInfoText}>状态&nbsp;{['未触发', '已触发'][data.state]}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>委托时间&nbsp;{data.sendTime}</Text>
        <Text style={[style.listInfoText, { width: '100%' }]}>触发时间&nbsp;{data.doTime}</Text>
      </View>
      {/* 按钮 */}
      <View style={style.listBtns}>
        {/* <TouchableNativeFeedback>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>修改</Text>
          </View>
        </TouchableNativeFeedback>
        <View style={style.listBtnsLine} /> */}
        <StaticTouchableNativeFeedback onPress={() => addEvent.backOrder()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>撤销</Text>
          </View>
        </StaticTouchableNativeFeedback>
      </View>
    </View>
  );
};

type TypeAllCoinInfo = {
  symbol: string; // 币种名称
  newPirce: string; // 最新价格
  riskPrice: string; // 指数价格
  ratio: string; // 涨幅
  lever: string; // 杠杆倍数
  openMinValue: string; // 最小开仓数量
  // 可开杠杆倍数
  leverList: {
    lever: string; // 可开杠杆倍数，
    selfRatio: number; // 杠杆保证金率
  }[];
  // 止盈止损单
  stopOrders: TypeStopOrder[];
};
type TypeCoinInfoList = {
  coinInfo: TypeAllCoinInfo[];
  // 持仓单
  positionOrders: TypePositionData[];
  // 委托单
  entrustOrders: TypeGeneralEntrustemnt[];
};

const ContractUSDTScreen: FC = () => {
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const navigation = useNavigation();
  const goToWithLogin = useGoToWithLogin();
  const [userIsLogin] = useGetDispatch<InState['userState']['userIsLogin']>('userState', 'userIsLogin');
  const [userInfo] = useGetDispatch<InState['userState']['userInfo']>('userState', 'userInfo');
  let { params: routeParams } = useRoute<RouteProp<{constract: { contractType: 0|1|2; coinType: string; }}, 'constract'>>();
  if (!routeParams) routeParams = { contractType: 0, coinType: '' };
  // 币种类型
  const [coinType, setCoinType] = useState(routeParams.coinType.replace(/\/+/g, ''));
  const coinTypeRef = useRef(coinType);

  useEffect(() => {
    setCoinType(routeParams.coinType.replace(/\/+/g, ''));
  }, [routeParams]);

  // 账户信息
  // 没有用户数据
  const [noUserInfo, setNoUserInfo] = useState(true);
  // 可用资产
  const [canUseAssets, setCanUseAssets] = useState('');
  // 当前全部资产
  const [userAllAssets, setUserAllAssets] = useState('');
  // 占用保证金
  const [useBondAssets, setUseBondAssets] = useState(0);
  const userAllAssetsRef = useRef(userAllAssets);
  useEffect(() => {
    userAllAssetsRef.current = userAllAssets;
  }, [userAllAssets]);
  // 风险度
  const [riskLever, setRiskLever] = useState('');

  // 显示状态
  // 是否显示更多弹窗
  const [showMoreAlert, setShowMoreAlert] = useState(false);
  // 开仓0还是平仓1
  const [doType, setDoType] = useState<0|1>(0);
  // 是否以市价执行
  const [isMarketPrice, setMarketPrice] = useState(false);
  // 限价委托价格
  const [fixedPrice, setFixedPrice] = useState('');
  // 限价委托数量
  const [fixedValue, setFixedValue] = useState('');
  // 限价委托数量是否获取了焦点
  const [fixedFocus, setFixedFocus] = useState(false);
  // 数量百分比
  const [fixedValueRatio, setFixedValueRatio] = useState(0);
  // 底部记录选项卡
  const [logSelectTab, setLogSelectTab] = useState(0);
  const logSelectTabRef = useRef(logSelectTab);
  useEffect(() => {
    logSelectTabRef.current = logSelectTab;
  }, [logSelectTab]);
  // 占用保证金
  const [occupyBond, setOccupyBond] = useState('0');
  // 可开仓数
  const [canOpenValue, setCanOpenValue] = useState('0');


  // 各种币种数据
  const [coinListInfo, setCoinListInfo] = useState<TypeCoinInfoList>({
    coinInfo: [],
    positionOrders: [],
    entrustOrders: [],
  });
  const coinListInfoRef = useRef(coinListInfo);
  useEffect(() => {
    coinListInfoRef.current = coinListInfo;
  }, [coinListInfo]);
  const defaultCoinListInfo = useRef<TypeAllCoinInfo>({
    symbol: '', // 币种信息
    newPirce: '', // 指数价格
    riskPrice: '', // 指数价格
    ratio: '', // 涨幅
    lever: '', // 杠杆倍数
    openMinValue: '', // 最小开仓数量
    leverList: [],
    stopOrders: [],
  });

  // 当前币种数据
  const [nowCoinInfo, setNowCoinInfo] = useState<TypeAllCoinInfo>({ ...defaultCoinListInfo.current });

  // 委托请求loading
  const [loading, setLoading] = useState(false);

  // 下面的筛选tab列表头
  const [tabTitleLength, setTabTitleLength] = useState(['持仓', '普通委托', '止盈止损']);

  const addEvent = {
    // 获取当前用户信息
    fetchUserInfo: () => {
      if (!userIsLogin) {
        setCoinListInfo(state => (
          {
            ...state,
            entrustOrders: [],
            positionOrders: [],
          }
        ));
        return;
      }
      ajax.get('/contract/api/v1/bian/gold_accounts').then(data => {
        if (data.status === 200 && data.data.asset) {
          const res = data.data;
          // 有用户数据
          setNoUserInfo(false);
          // 可用资产
          setUserAllAssets(`${res.asset.crossWalletBalance}`);
          setCanUseAssets(`${res.asset.availableBalance}`);
          // 更改币种杠杆信息
          setCoinListInfo(state => ({
            ...state,
            coinInfo: state.coinInfo.map(coin => ({
              ...coin,
              lever: res.positions.filter((pos: any) => pos.symbol === coin.symbol)[0].leverage,
              leverList: addEvent.getCoinLeverInfo(coin.symbol),
              openMinValue: res.minimumOrder[coin.symbol.replace('USDT', '')],
            })),
          }));
        }
        // 获取持仓/普通委托数据
        addEvent.fetchPostionsOrders();
        addEvent.fetchEntrustOrders();
      }).catch(err => {
        console.log(err);
      });
    },
    // 获取持仓数据
    fetchPostionsOrders: () => {
      ajax.get('/contract/api/v1/bian/holdhourse_log').then(data => {
        let result: TypePositionData[] = [];
        if (data.status === 200) {
          result = data?.data?.list?.map((item: any) => {
            const itemCoinRisk = data?.data?.risk.filter((risk: any) => risk.symbol === `${item.symbol}USDT`);
            let nowPrice = '';
            coinListInfoRef.current.coinInfo.forEach(coin => {
              if (coin.symbol === `${item.symbol}USDT`) nowPrice = coin.newPirce;
            });
            const useBond = getSymbolBond(item.symbol, (parseFloat(item.surplus_coin_num) * parseFloat(nowPrice)));
            const willUseBond = (parseFloat(nowPrice) * parseFloat(item.surplus_coin_num)) / (parseFloat(item?.lever) || 1);
            return {
              id: item.id,
              type: Number(item.type === '1') as TypePositionData['type'],
              coinType: `${item.symbol}USDT`,
              leverType: itemCoinRisk[0].leverage,
              price: item.price,
              profitValue: fiexedNumber(itemCoinRisk[Number(item.type === '2')].unrealizedProfit, 4),
              profitRatio: `${new NumberTools(parseFloat(itemCoinRisk[Number(item.type === '2')].unrealizedProfit)).divides(willUseBond / 100, 2).get()}%`,
              allValue: item.surplus_coin_num,
              useBond: useBond.toString(),
              willUseBond,
              willBoomPrice: '--',
              time: item.create_time,
            };
          }) || [];
        }
        // 赋值数据
        setCoinListInfo(state => {
          // 更改持仓数据
          return {
            ...state,
            positionOrders: result,
          };
        });
      }).catch(err => {
        console.log(err);
      });
    },
    // 获取普通委托数据
    fetchEntrustOrders: () => {
      ajax.get('/contract/api/v1/bian/entrust_log').then(data => {
        let result: TypeGeneralEntrustemnt[] = [];
        if (data.status === 200) {
          result = data?.data?.map((item: any) => {
            let leverType = '';
            coinListInfoRef.current.coinInfo.forEach(coin => {
              if (coin.symbol === `${item.symbol}USDT`) leverType = coin.lever;
            });
            return {
              id: item.binance_id,
              // eslint-disable-next-line no-nested-ternary
              type: item.type === '1' ? (item.sell_buy === '1' ? 1 : 3) : (item.sell_buy === '1' ? 2 : 0),
              coinType: `${item.symbol}USDT`,
              leverType,
              willNumber: item.coin_num,
              willPrice: item.price,
              haveNumber: item.deal_coin_num,
              backValue: parseFloat((item.coin_num - item.deal_coin_num).toFixed(3)),
              state: Number(item.status === '8'),
              time: item.create_time,
              willUseBond: '',
            };
          }) || [];
        }
        // 赋值数据
        setCoinListInfo(state => (
          {
            ...state,
            entrustOrders: result,
          }
        ));
      }).catch(err => {
        console.log(err);
      });
    },
    // 获取止盈止损数据
    fetchStopOrders: (nowCoinType: string) => {
      ajax.get(`/contract/api/v2/order/profitLossOnline?symbol=${nowCoinType.replace('USDT', '')}`).then(data => {
        let result: TypeStopOrder[] = [];
        if (data.status === 200 && data.data) {
          result = data.data.map((item: any) => {
            let leverType = '';
            coinListInfoRef.current.coinInfo.forEach(coin => {
              if (coin.symbol === `${item.symbol}USDT`) leverType = coin.lever;
            });
            return {
              id: item.id,
              type: item.direction === '平多' ? 1 : 0,
              coinType: nowCoinType,
              leverType,
              startPrice: item.price,
              doPrice: item.price_action,
              stopType: item.type === '止盈' ? 1 : 0,
              doPriceType: 0,
              state: 0,
              sendTime: item.create_time,
              doTime: '--',
            };
          });
        }
        // 赋值数据
        setCoinListInfo(state => (
          {
            ...state,
            coinInfo: state.coinInfo.map(item => {
              const res = { ...item };
              if (res.symbol === nowCoinType) {
                res.stopOrders = result;
              }
              return res;
            }),
          }
        ));
      }).catch(err => {
        console.log(err);
      });
    },
    // 币种显示类型
    showCointTypeText: (coin: string) => {
      return coin.replace('USDT', '/USDT');
    },
    // 切换币种页面
    toGoCoinPage: (coin: string) => {
      setCoinType(coin);
      coinTypeRef.current = coin;
      navigation.navigate(routeName, {
        ...routeParams,
        coinType: coin,
      });
    },
    // 根数最新价格处理币种价格和涨幅数据
    setCoinInfo: (res: {price: string; ratio: string; symbol: string;}[]) => {
      // 如果当前没有币种数据，切换页面
      if (coinTypeRef.current === '') {
        addEvent.toGoCoinPage(res[0].symbol);
      }
      setCoinListInfo((state) => {
        if (state.coinInfo.length === 0) {
          return {
            ...state,
            coinInfo: res.map(item => ({
              ...defaultCoinListInfo.current,
              symbol: item.symbol,
              newPirce: item.price,
              ratio: item.ratio,
            })),
          };
        }
        return {
          ...state,
          coinInfo: state.coinInfo.map((item, index) => ({
            ...item,
            symbol: res[index].symbol,
            newPirce: res[index].price,
            ratio: res[index].ratio,
          })),
        };
      });
    },
    // 处理指数价
    setRiskCoinInfo: (res: {[key: string]: string}) => {
      setCoinListInfo((state) => {
        if (state.coinInfo.length === 0) {
          return state;
        }
        return {
          ...state,
          coinInfo: state.coinInfo.map((item) => {
            const result = { ...item };
            result.riskPrice = res[item.symbol];
            return result;
          }),
        };
      });
    },
    // 将币种数据转化为左侧列表可用数据
    allCoinListToLeftCoinList: (allCoin: typeof coinListInfo['coinInfo']) => {
      return allCoin.map(item => ({
        price: item.newPirce,
        ratio: item.ratio,
        symbol: item.symbol,
      }));
    },
    // 显示左侧内容
    showLeftChange: () => {
      modalOutBg.outBgsetChildren(<ContractHeadLeftView
        changeCoin={(coin) => addEvent.toGoCoinPage(coin)}
        coinType={coinType}
        defaultLeftList={addEvent.allCoinListToLeftCoinList(coinListInfo.coinInfo)} />);
      modalOutBg.outBgsetShow(true);
      modalOutBg.outBgCanClose(true);
    },
    // 获取当前币种的杠杆倍率
    getCoinLeverInfo: (coin: string) => {
      if (coin === 'BTCUSDT') {
        return [
          { lever: '10', selfRatio: 0.1 },
          { lever: '20', selfRatio: 0.05 },
          { lever: '50', selfRatio: 0.02 },
          { lever: '100', selfRatio: 0.01 },
        ].reverse();
      }
      if (coin === 'BCHUSDT') {
        return [
          { lever: '10', selfRatio: 0.1 },
          { lever: '20', selfRatio: 0.05 },
        ].reverse();
      }
      return [
        { lever: '10', selfRatio: 0.1 },
        { lever: '25', selfRatio: 0.04 },
        { lever: '50', selfRatio: 0.02 },
        { lever: '75', selfRatio: 0.013 },
      ].reverse();
    },
    // 杠杆倍数更改
    changeLeverType: () => {
      if (noUserInfo) {
        showMessage({
          position: 'bottom',
          message: '暂无合约资产，无法更改杠杆倍数',
          type: 'info',
        });
        return;
      }
      const close = showSelector({
        data: addEvent.getCoinLeverInfo(coinType).map(item => ({
          data: item.lever,
          before: '杠杆 ',
          after: 'X',
        })),
        selected: nowCoinInfo.lever,
        onPress: (value) => {
          if (typeof value !== 'string') {
            ajax.post('/contract/api/v1/bian/update_lever', {
              symbol: coinType.replace('USDT', ''),
              lever: Number(value.data),
            }).then(data => {
              if (data.status === 200) {
                setCoinListInfo(state => ({
                  ...state,
                  coinInfo: state.coinInfo.map(item => {
                    const result = { ...item };
                    if (result.symbol === coinType) {
                      result.lever = value.data;
                    }
                    result.stopOrders = result.stopOrders.map(stopOrder => ({
                      ...stopOrder,
                      leverType: value.data,
                    }));
                    return result;
                  }),
                  positionOrders: state.positionOrders.map(order => {
                    const result = { ...order };
                    if (result.coinType === coinType) {
                      result.leverType = value.data;
                    }
                    return result;
                  }),
                  entrustOrders: state.entrustOrders.map(order => {
                    const result = { ...order };
                    if (result.coinType === coinType) {
                      result.leverType = value.data;
                    }
                    return result;
                  }),
                }));
                showMessage({
                  position: 'bottom',
                  message: '杠杆更改成功',
                  type: 'success',
                });
              } else {
                showMessage({
                  position: 'bottom',
                  message: data.message,
                  type: 'warning',
                });
              }
            }).catch(err => {
              console.log(err);
            }).finally(() => {
              close();
            });
          }
          close();
        },
      });
    },
    // 点击市价按钮,市价限价切换
    onMarketPrice: async () => {
      let changeMarketType = false;
      setMarketPrice(state => {
        changeMarketType = !state;
        return changeMarketType;
      });
      // 如果是市价转成限价，返回
      if (!changeMarketType) return;
      let storageNotShow = false;
      try {
        storageNotShow = await storage.get('marketChangeNotShowTip');
      } catch (err) {
        console.log(err);
      }
      if (storageNotShow) return;
      const close = showComAlert({
        title: '温馨提示',
        desc: (
          <View>
            <Text>市价:</Text>
            <Text style={{ color: getThemeOpacity(themeBlack, 0.6) }}>按当时市场价格即刻成交的指令。您在下达这种指令时无需指明具体的价位，而是要求以当时市场上可执行的最好价格达成交易，可能会产生较大的风险，请悉知。</Text>
          </View>
        ),
        close: {
          text: '不再提示',
          onPress: () => {
            storage.save('marketChangeNotShowTip', 'yes');
            close();
          },
        },
        success: {
          text: '知道了',
          onPress: () => {
            close();
          },
        },
      });
    },
    // 数量获取焦点时如果带有百分号，清空
    fixedValueFocus: () => {
      setFixedFocus(true);
      if (/%+/.test(fixedValue)) {
        setFixedValueRatio(0);
      }
      if (fixedValue === '0') {
        setFixedValue('');
      }
    },
    fixedValueBlur: () => {
      setFixedFocus(false);
    },
    // 订单提交弹窗0开多，1开空，2平多，3平空
    submitVerfiy: (type: 0|1|2|3) => {
      if (!userIsLogin) {
        const close = showComAlert({
          title: '尚未登录',
          desc: '是否前往登录?',
          success: {
            text: '登录',
            onPress: () => {
              navigation.navigate('Login');
              close();
            },
          },
          close: {
            text: '取消',
            onPress: () => {
              close();
            },
          },
        });
        return;
      }
      if (noUserInfo) {
        showMessage({
          position: 'bottom',
          type: 'warning',
          message: '尚未充值',
        });
        return;
      }
      if (loading) return;
      const splitNum = (`${nowCoinInfo.openMinValue}`.split('.')[1] || '').length;
      let changeValue = fixedValue;
      let message = '';
      // 判断是否是限价，价格是否合理
      if (!isMarketPrice && Math.abs((parseFloat(fixedPrice) || 0) / parseFloat(nowCoinInfo.newPirce) - 1) > 0.3) message = '限价委托和当前指数价不能相差超过30%';
      // 判断开仓数量小数点后数据是否正确
      if ((changeValue.split('.')?.[1] || '').length > splitNum) message = '开仓数量小数位有误';
      if (changeValue === '0') message = '开仓数量有误';
      // 开仓判断仓位数量
      if (doType === 0) {
        if (parseFloat(changeValue) > parseFloat(canOpenValue)) message = '开仓数量有误';
      } else {
        // 平仓仓位判断
        // 如果是百分比
        // eslint-disable-next-line no-lonely-if
        if (/%/.test(changeValue)) {
          const positionOrders = coinListInfo.positionOrders.filter(order => order.coinType === nowCoinInfo.symbol);
          let positionBuyNum = 0;
          let positionSellNum = 0;
          positionOrders.forEach(order => {
            if (order.type === 0) {
              positionSellNum = towNumAdd(positionSellNum, order.allValue);
            } else {
              positionBuyNum = towNumAdd(positionBuyNum, order.allValue);
            }
          });
          if (type === 2) {
            if (changeValue === '100%') {
              changeValue = `${positionBuyNum}`;
            } else {
              changeValue = ((parseFloat(changeValue) * positionBuyNum) / 100).toFixed(splitNum);
            }
          } else {
            // eslint-disable-next-line no-lonely-if
            if (changeValue === '100%') {
              changeValue = `${positionSellNum}`;
            } else {
              changeValue = ((parseFloat(changeValue) * positionSellNum) / 100).toFixed(splitNum);
            }
          }
        }
      }
      // 如果是开仓判断数量是否正确
      if (type === 0 || type === 1) {
        // 判断开仓数量是否大于可开仓数量
        if (parseFloat(changeValue) > parseFloat(canOpenValue)) message = '开仓数量超过可开仓数量';
      } else if (changeValue === '') {
        // 如果没有平仓数量
        message = '请输入正确的数量';
      } else {
        // 如果是平仓数量是否正确
      }
      // 如果有message提示
      if (message !== '') {
        showMessage({
          position: 'bottom',
          type: 'warning',
          message,
        });
        return;
      }
      // 订单提示
      addEvent.submitAlert(type, changeValue).then(data => {
        if (data) addEvent.submitOrder(type, changeValue);
      });
    },
    // 订单提示
    submitAlert: (type: 0|1|2|3, changeValue: string): Promise<boolean> => {
      const showTextArr = [
        // 开多
        [themeGreen, '买入多单', '开仓'],
        [themeRed, '买入空单', '开仓'],
        [themeRed, '卖出多单', '平仓'],
        [themeGreen, '卖出空单', '平仓'],
      ];
      return new Promise(resolve => {
        const close = showComAlert({
          title: ['开多', '开空', '平多', '平空'][type],
          desc: (
            <Text>
              确定以
              <Text style={{ color: defaultThemeColor }}>{isMarketPrice ? '市价' : `限价${fixedPrice}USDT`}</Text>
              <Text style={{ color: showTextArr[type][0] }}>{showTextArr[type][1]}</Text>
              ，{showTextArr[type][2]}{changeValue}？
            </Text>
          ),
          success: {
            text: '确定',
            onPress: () => {
              close();
              resolve(true);
            },
          },
          close: {
            text: '取消',
            onPress: () => {
              close();
              resolve(false);
            },
          },
        });
      });
    },
    // 提交订单0开多，1开空，2平多，3平空
    submitOrder: (type: 0|1|2|3, changeValue: string) => {
      const fm: {[key: string]: any} = {};
      // price 价格
      // price_type 市价2限价1
      // num 数量
      // lever 杠杆倍数
      // symbol 币种
      // side 买卖'SELL', 'BUY'
      // postition_side 方向'SHORT', 'LONG'
      if (isMarketPrice) {
        fm.price = 1;
      } else {
        fm.price = parseFloat(fixedPrice);
      }
      fm.price_type = Number(isMarketPrice) + 1;
      fm.num = parseFloat(changeValue);
      fm.lever = parseFloat(nowCoinInfo.lever);
      fm.symbol = nowCoinInfo.symbol.replace('USDT', '');
      if (type === 0) {
        fm.side = 'BUY';
        fm.postition_side = 'LONG';
      } else if (type === 1) {
        fm.side = 'SELL';
        fm.postition_side = 'SHORT';
      } else if (type === 2) {
        fm.side = 'SELL';
        fm.postition_side = 'LONG';
      } else if (type === 3) {
        fm.side = 'BUY';
        fm.postition_side = 'SHORT';
      }
      setLoading(true);
      ajax.post('/contract/api/v1/bian/Order', fm).then(data => {
        if (data.status === 200) {
          showMessage({
            position: 'bottom',
            message: '委托提交成功',
            type: 'success',
          });
        } else {
          showMessage({
            position: 'bottom',
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        setLoading(false);
      });
    },
    // 获取维持保证金率/维持保证金速算额
    getFollowRatio: (coin: string, orderNum: number): number[] => {
      if (coin === 'BTCUSDT') {
        if (orderNum < 50000) return [(0.4 / 100), 0];
        if (orderNum < 250000) return [(0.5 / 100), 50];
        if (orderNum < 1000000) return [(1 / 100), 1300];
        if (orderNum < 5000000) return [(2.5 / 100), 16300];
        if (orderNum < 20000000) return [(5 / 100), 141300];
        if (orderNum < 50000000) return [(10 / 100), 1141300];
        if (orderNum < 100000000) return [(12.5 / 100), 2391300];
        if (orderNum < 200000000) return [(15 / 100), 4891300];
        return [(25 / 100), 24891300];
      }
      if (orderNum < 10000) return [(0.65 / 100), 0];
      if (orderNum < 50000) return [(1 / 100), 35];
      if (orderNum < 250000) return [(2 / 100), 535];
      if (orderNum < 1000000) return [(5 / 100), 8035];
      if (orderNum < 2000000) return [(10 / 100), 58035];
      if (orderNum < 5000000) return [(12.5 / 100), 108035];
      if (orderNum < 10000000) return [(15 / 100), 233035];
      return [(25 / 100), 1233035];
    },
    // 获取当前币种多单1/空单0数量
    getNowCoinPositionValue: (coin: string, type: 0|1) => {
      const nowOrders = coinListInfo.positionOrders.filter(item => item.coinType === coin).filter(order => order.type === type);
      if (nowOrders.length === 0) return 0;
      return nowOrders[0].allValue;
    },
    // 获取当前币已占用保证金
    getNowCoinPositionUseBond: (coin: string) => {
      const nowOrders = coinListInfo.positionOrders.filter(item => item.coinType === coin);
      let nowOrderBond = 0;
      if (nowOrders.length === 0) return nowOrderBond;
      nowOrders.forEach(order => { nowOrderBond += parseFloat(order.useBond); });
      return fiexedNumber(nowOrderBond, 4);
    },
    // 计算强平价
    // 计算预估强平价方式
    // https://www.binancezh.com/cn/support/faq/b3c689c1f50a44cabb3a84e663b81d93-如何计算永续合约的强平价格
    computBoomPrice: () => {
      const { positionOrders, coinInfo } = coinListInfoRef.current;
      // 计算公式
      // 可用资产
      const assets = parseFloat(userAllAssetsRef.current);
      if (Number.isNaN(assets)) return;
      // 获取合约所有保证金和未实现盈亏
      const otherBound: {margin: number, symbol: string}[] = [];
      // 合约未实现盈亏
      const otherWillChange: {unrealized: number, symbol: string}[] = [];
      positionOrders.forEach(item => {
        otherBound.push({
          symbol: item.coinType,
          margin: parseFloat(item.useBond),
        });
        otherWillChange.push({
          symbol: item.coinType,
          unrealized: parseFloat(item.profitValue),
        });
      });
      const resultPositionOrders = positionOrders.map(order => {
        const res = { ...order };
        // 在此计算-------------
        // --------------------
        const coinNewPirce = coinInfo.filter(item => item.symbol === order.coinType)[0]?.newPirce || '0';
        const [inRatio, inValue] = addEvent.getFollowRatio(order.coinType, parseFloat(order.allValue) * parseFloat(coinNewPirce)); // 获取费率和速算额
        // 分子
        let otherBoundValue = 0;
        otherBound.filter(item => item.symbol !== order.coinType).forEach(item => { otherBoundValue += item.margin; });
        let otherWillChangeValue = 0;
        otherWillChange.filter(item => item.symbol !== order.coinType).forEach(item => { otherWillChangeValue += item.unrealized; });
        const resultMolecule = assets // 资产余额
          - otherBoundValue // 保证金
          + otherWillChangeValue // 未实现盈亏
          + inValue // 保证金速算额
          + (
            (order.type === 0 ? 1 : -1) // 开多-或开空+
            * parseFloat(order.allValue) // 持仓数量
            * parseFloat(order.price) // 开仓价
          );
        // 分母
        const resultDenominator = (parseFloat(order.allValue) * inRatio) // 双向费率计算
          + ((order.type === 0 ? 1 : -1) * parseFloat(order.allValue)); // 仓位大小
        const boomResult = resultMolecule / resultDenominator;
        if (boomResult < 0) {
          res.willBoomPrice = '--';
        } else {
          res.willBoomPrice = boomResult.toFixed(2);
        }
        // ----------
        // ----------强平价
        return res;
      });
      setCoinListInfo(state => ({
        ...state,
        positionOrders: resultPositionOrders,
      }));
    },
  };

  // 进入页面获取数据
  // 获取最新价格
  // 获取指数价格
  const stopScoket = useRef(false);
  useEffect(() => {
    let newPriceSocketRef: SocketClass|null = null;
    const newPirceMark = 'gold.market.ALL.ticker';
    // 获取指数价
    const tickerImgMark = 'gold.market.all.markPrice';
    const newPirceMarkListener = (message: any) => {
      const resultData: {
        [key: string]: {
          [key: string]: string;
        };
      } = message.Tick;
      const result: {price: string; ratio: string; symbol: string;}[] = [];
      // 处理价格
      Object.values(resultData || {}).forEach(item => {
        const close = parseFloat(item.close);
        const open = parseFloat(item.open);
        const range = Math.floor(((close - open) / open) * 10000) / 100;
        result.push({
          symbol: item.symbol,
          price: item.close,
          ratio: `${range}%`,
        });
      });
      addEvent.setCoinInfo(result);
    };
    const tickerSocketListenerMark = (message: any) => {
      addEvent.setRiskCoinInfo(message.data);
    };
    if (routePage === routeName) {
      stopScoket.current = true;
      marketSocket.getSocket().then(ws => {
        newPriceSocketRef = ws;
        ws.addListener(newPirceMarkListener, newPirceMark);
        ws.send(newPirceMark, 'req');
        ws.send(newPirceMark, 'sub');
        ws.addListener(tickerSocketListenerMark, tickerImgMark);
        ws.send(tickerImgMark, 'req');
        ws.send(tickerImgMark, 'sub');
      }).catch(err => {
        console.log(err);
      });
    }
    return () => {
      if (stopScoket.current) {
        stopScoket.current = false;
        newPriceSocketRef?.send(newPirceMark, 'unsub');
        newPriceSocketRef?.removeListener(newPirceMarkListener);
        newPriceSocketRef?.send(tickerImgMark, 'unsub');
        newPriceSocketRef?.removeListener(tickerSocketListenerMark);
      }
    };
  }, [routePage]);

  // 获取到币种之后请求数据
  const prveCoinListInfoData = useRef(0);
  useEffect(() => {
    if (prveCoinListInfoData.current !== 0 || coinListInfo.coinInfo.length === 0) {
      return;
    }
    prveCoinListInfoData.current = coinListInfo.coinInfo.length;
    addEvent.fetchStopOrders(coinType);
  }, [coinListInfo, coinType]);
  // 更改左侧数据显示
  useEffect(() => {
    ContractHeadLeftView?.prototype?.setLeftList?.(
      addEvent.allCoinListToLeftCoinList(coinListInfo.coinInfo)
    );
  }, [coinListInfo]);

  // 更改当前币种数据信息
  useEffect(() => {
    if (coinType === '' || coinListInfo.coinInfo.length === 0) return;
    const nowCoin = coinListInfo.coinInfo.filter(item => item.symbol === coinType);
    if (nowCoin.length === 0) return;
    setNowCoinInfo(nowCoin[0]);
    // 更改最新指数价
    ContractRightValueView.prototype.setNewPrice(nowCoin[0].newPirce);
    ContractRightValueView.prototype.setNewRiskPrice(nowCoin[0].riskPrice);
  }, [coinType, coinListInfo.coinInfo]);

  // 第一次获取币种列表之后获取数据
  const fristGetFetch = useRef(true);
  useEffect(() => {
    if (routePage !== routeName) {
      fristGetFetch.current = true;
      return;
    }
    if (coinListInfo.coinInfo.length === 0) return;
    if (!fristGetFetch.current) return;
    fristGetFetch.current = false;
    addEvent.fetchUserInfo();
  }, [coinListInfo.coinInfo, routePage]);

  // 根据当前币种信息更改数据
  useEffect(() => {
    if (logSelectTab === 2) {
      addEvent.fetchStopOrders(coinType);
    }
  }, [coinType, logSelectTab]);

  // 根据币种/开仓平仓更改，进行数据初始化
  useEffect(() => {
    setFixedPrice('');
    setFixedValue('');
    setFixedValueRatio(0);
  }, [coinType, doType]);

  // 占用保证金/可开仓数计算
  useEffect(() => {
    let price = parseFloat(fixedPrice);
    const value = parseFloat(fixedValue);
    const lever = parseFloat(nowCoinInfo.lever);
    const splitNum = (`${nowCoinInfo.openMinValue}`.split('.')[1] || '').length;
    if (isMarketPrice) price = parseFloat(nowCoinInfo.newPirce);
    if (
      !(price > 0) || !(lever > 0) || nowCoinInfo.leverList.length === 0
    ) {
      setOccupyBond('--');
      setCanOpenValue('--');
      return;
    }
    // 计算可开仓数
    const canOpenVolumn = ((parseFloat(canUseAssets) / price) * Number(lever)) * 0.95;
    setCanOpenValue(`${fiexedNumber(canOpenVolumn, splitNum)}`);
    if (!(value > 0)) return;
    // 获取杠杆保证金率
    let safeRatio = -1;
    nowCoinInfo.leverList.forEach(item => {
      if (Number(nowCoinInfo.lever) === Number(item.lever) && safeRatio === -1) {
        safeRatio = item.selfRatio;
      }
    });
    nowCoinInfo.leverList.forEach(item => {
      if (Number(nowCoinInfo.lever) < Number(item.lever) && safeRatio === -1) {
        safeRatio = item.selfRatio;
      }
    });
    if (safeRatio === -1) return;
    // 占用保证金数 价格*币数*资金占用率比例
    const safeValue = getSymbolBond(nowCoinInfo.symbol.replace('USDT', ''), (price * value));
    setOccupyBond(safeValue.toString());
  }, [fixedPrice, fixedValue, nowCoinInfo.lever, nowCoinInfo.leverList, nowCoinInfo.openMinValue, canUseAssets, isMarketPrice, nowCoinInfo.newPirce]);

  // 根据滚动条计算开仓数量
  const canOpenValueRef = useRef(canOpenValue);
  useEffect(() => {
    canOpenValueRef.current = canOpenValue;
  }, [canOpenValue]);
  useEffect(() => {
    if (fixedFocus) return;
    if (doType === 1) {
      if (fixedValueRatio !== 0) setFixedValue(`${fixedValueRatio}%`);
      else setFixedValue('');
      return;
    }
    // 市价情况下，为0
    if (isMarketPrice) {
      setFixedValue('');
    }
    const splitNum = (`${nowCoinInfo.openMinValue}`.split('.')[1] || '').length;
    const value = (parseFloat(canOpenValueRef.current) * fixedValueRatio) / 100;
    if (fixedValueRatio === 100 && parseFloat(canOpenValueRef.current) > 0) {
      setFixedValue(canOpenValueRef.current);
      return;
    }
    if (Number.isNaN(value)) {
      setFixedValue('');
    } else {
      setFixedValue(`${parseFloat(value.toFixed(splitNum))}`);
    }
  }, [fixedValueRatio, nowCoinInfo.openMinValue, doType]);

  // 监听订单更改
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  // 保留socket返回数据，处理数据问题高
  const socketAccountData = useRef<{
    did: number[],
  }>({
    did: [],
  });
  useEffect(() => {
    if (!userInfo.token) return;
    const tickerImgStart = 'gold.market.ALL.account';
    const tickerImg = `${tickerImgStart}.${userInfo.token}`;
    const socketListener = (message: any) => {
      if (socketAccountData.current.did.includes(message.ts)) return;
      socketAccountData.current.did.push(message.ts);
      console.log(JSON.stringify(message, null, 2));
      if (message.data.type === '1') { // 创建委托
        const res = message.data.entrust;
        setCoinListInfo(state => {
          const entrustResult = [...state.entrustOrders];
          let leverType = '';
          coinListInfoRef.current.coinInfo.forEach(coin => {
            if (coin.symbol === `${res.symbol}USDT`) leverType = coin.lever;
          });
          // 判断订单中是否已经存在
          const dataIndex = state.entrustOrders.map(order => order.id).indexOf(res.binance_id);
          const addData: TypeGeneralEntrustemnt = {
            id: res.binance_id,
            // eslint-disable-next-line no-nested-ternary
            type: res.type === '1' ? (res.sell_buy === '1' ? 1 : 3) : (res.sell_buy === '1' ? 2 : 0),
            coinType: `${res.symbol}USDT`,
            leverType,
            willNumber: res.coin_num,
            willPrice: res.price,
            haveNumber: res.deal_coin_num,
            backValue: parseFloat((res.coin_num - res.deal_coin_num).toFixed(3)),
            state: Number(res.status === '8') as 0|1,
            time: res.create_time,
            willUseBond: getSymbolBond(res.symbol, (parseFloat(res.coin_num) * parseFloat(res.price))).toString(),
          };
          if (dataIndex === -1) {
            entrustResult.push(addData);
          } else {
            entrustResult.splice(dataIndex, 1, addData);
          }
          return {
            ...state,
            entrustOrders: entrustResult,
          };
        });
      } else if (message.data.type === '2' || message.data.type === '4' || message.data.type === '5') { // 创建持仓/平仓
        // 修改委托
        const resEntrust = message.data.entrust;
        const resHold = message.data.hold;
        let leverType = '';
        coinListInfoRef.current.coinInfo.forEach(coin => {
          if (coin.symbol === `${resEntrust.symbol}USDT`) leverType = coin.lever;
        });
        setCoinListInfo(state => {
          // 委托
          const entrust = [...state.entrustOrders];
          const changeEntrustOrder: TypeGeneralEntrustemnt = {
            id: resEntrust.binance_id,
            // eslint-disable-next-line no-nested-ternary
            type: resEntrust.type === '1' ? (resEntrust.sell_buy === '1' ? 1 : 3) : (resEntrust.sell_buy === '1' ? 2 : 0),
            coinType: `${resEntrust.symbol}USDT`,
            leverType,
            willNumber: resEntrust.coin_num,
            willPrice: resEntrust.price,
            haveNumber: resEntrust.deal_coin_num,
            backValue: fiexedNumber(towNumCut(resEntrust.coin_num, resEntrust.deal_coin_num), 4),
            state: Number(resEntrust.status === '8') as 0|1,
            time: resEntrust.create_time,
            willUseBond: '',
          };
          let replaceIndex = -1;
          entrust.forEach((item, index) => {
            if (resEntrust.binance_id === item.id) {
              replaceIndex = index;
            }
          });
          if ((resEntrust.coin_num - resEntrust.deal_coin_num) === 0) {
            entrust.splice(replaceIndex, 1);
          } else {
            entrust.splice(replaceIndex, 1, changeEntrustOrder);
          }
          // 持仓
          const position = [...state.positionOrders];
          let replaceIndexPos = -1;
          position.forEach((item, index) => {
            if (resHold.id === item.id) {
              replaceIndexPos = index;
            }
          });
          const changePositionOrder: TypePositionData = {
            id: resHold.id,
            type: Number(resHold.type === '1') as TypePositionData['type'],
            coinType: `${resHold.symbol}USDT`,
            leverType,
            price: `${fiexedNumber(resHold.price, 4)}`,
            profitValue: '--',
            profitRatio: '--',
            allValue: `${fiexedNumber(towNumCut(resHold.coin_num, resHold.deal_coin_num), 4)}`,
            useBond: '--',
            willBoomPrice: '--',
            time: resHold.create_time,
          };
          if (replaceIndexPos === -1) {
            position.unshift(changePositionOrder);
          } else if ((resHold.coin_num - resHold.deal_coin_num) === 0) {
            position.splice(replaceIndexPos, 1);
          } else {
            position.splice(replaceIndexPos, 1, changePositionOrder);
          }
          return {
            ...state,
            entrustOrders: entrust,
            positionOrders: position,
          };
        });
      } else if (message.data.type === '3') { // 撤销委托
        const res = message.data.entrust;
        setCoinListInfo(state => {
          const entrustResult = [...state.entrustOrders];
          let replaceIndex = -1;
          entrustResult.forEach((item, index) => {
            if (res.binance_id === item.id) {
              replaceIndex = index;
            }
          });
          entrustResult.splice(replaceIndex, 1);
          return {
            ...state,
            entrustOrders: entrustResult,
          };
        });
      }
    };
    let Timer = setTimeout(() => {}, 1);
    if (routePage === routeName) {
      // 如果有用户信息，监听
      Timer = setInterval(() => {
        if (noUserInfo === false) {
          clearTimeout(Timer);
          // 获取USDT合约
          marketSocket.getSocket().then(ws => {
            socket.current = ws;
            ws.addListener(socketListener, tickerImgStart);
            ws.send(tickerImg, 'sub');
            subSocket.current = false;
          }).catch(err => {
            console.log(err);
          });
        }
      }, 100);
    } else if (socket.current) {
      clearTimeout(Timer);
      if (!subSocket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(tickerImgStart);
      }
    }
  }, [routePage, noUserInfo]);

  // 计算持仓占用保证金/持仓未实现盈亏/持仓收益率/普通委托预计占用保证金
  useEffect(() => {
    // 计算占用保证金/持仓未实现盈亏/持仓收益率/普通委托预计占用保证金
    setCoinListInfo(state => {
      const stateResult = { ...state };
      stateResult.positionOrders = stateResult.positionOrders.map(order => {
        const nowCoin = coinListInfo.coinInfo.filter(coin => coin.symbol === order.coinType)[0];
        // 获取杠杆保证金率
        let safeRatio = -1;
        nowCoin.leverList.forEach(item => {
          if (Number(order.leverType) === Number(item.lever) && safeRatio === -1) {
            safeRatio = item.selfRatio;
          }
        });
        nowCoin.leverList.forEach(item => {
          if (Number(order.leverType) < Number(item.lever) && safeRatio === -1) {
            safeRatio = item.selfRatio;
          }
        });
        // 计算占用保证金
        // const safeValue = getSymbolBond(nowCoin.symbol.replace('USDT', ''), (parseFloat(order.allValue) * parseFloat(nowCoin.riskPrice)));
        const safeValue = (parseFloat(nowCoin.newPirce) * parseFloat(order.allValue)) / parseFloat(nowCoin.lever);
        // 计算未实现盈亏
        let profitResult = '';
        let profitRatio = 0; // 收益率
        if (order.type === 0) {
          // 空单
          const profitValue = (parseFloat(order.price) - parseFloat(nowCoin.riskPrice)) * parseFloat(order.allValue);
          profitResult = `${fiexedNumber(profitValue, 4)}`;
          // 计算收益率
          profitRatio = Math.floor(parseFloat((profitValue / safeValue).toFixed(4)) * 10000) / 100;
        } else if (order.type === 1) {
          // 多单
          const profitValue = (parseFloat(nowCoin.riskPrice) - parseFloat(order.price)) * parseFloat(order.allValue);
          profitResult = `${fiexedNumber(profitValue, 4)}`;
          // 计算收益率
          profitRatio = Math.floor(parseFloat((profitValue / safeValue).toFixed(4)) * 10000) / 100;
        }
        return {
          ...order,
          useBond: `${safeValue}`,
          profitValue: profitResult,
          profitRatio: `${profitRatio}%`,
        };
      });
      stateResult.entrustOrders = stateResult.entrustOrders.map(order => {
        const nowCoin = coinListInfo.coinInfo.filter(coin => coin.symbol === order.coinType)[0];
        // 获取杠杆保证金率
        let safeRatio = -1;
        nowCoin.leverList.forEach(item => {
          if (Number(order.leverType) === Number(item.lever) && safeRatio === -1) {
            safeRatio = item.selfRatio;
          }
        });
        nowCoin.leverList.forEach(item => {
          if (Number(order.leverType) < Number(item.lever) && safeRatio === -1) {
            safeRatio = item.selfRatio;
          }
        });
        // 计算占用保证金
        const safeValue = getSymbolBond(nowCoin.symbol.replace('USDT', ''), (order.backValue * parseFloat(order.willPrice)));
        return {
          ...order,
          willUseBond: `${safeValue}`,
        };
      });
      return stateResult;
    });
  }, [coinListInfo.coinInfo]);


  // 计算可用资产/资金使用率
  useEffect(() => {
    // 获取所有持仓数据的保证金
    // 计算未实现盈亏
    let floatChange = 0;
    // 计算占用保证金总和
    let positionsOrderRisk = 0;
    coinListInfo.positionOrders.map(item => {
      floatChange += parseFloat(item.profitValue);
      return parseFloat(item.useBond);
    }).forEach(item => { positionsOrderRisk += item; });
    let entrOrderRisk = 0;
    coinListInfo.entrustOrders.map(item => parseFloat(item.willUseBond)).forEach(item => { entrOrderRisk += item; });
    const assetsValue = parseFloat(userAllAssets) - (positionsOrderRisk + entrOrderRisk) + floatChange || parseFloat(userAllAssets);
    setCanUseAssets(`${assetsValue}`);
    setUseBondAssets(new NumberTools(positionsOrderRisk).divides(1, 4).get());
  }, [coinListInfo, userAllAssets]);

  // 计算风险度
  useEffect(() => {
    // 所有未实现盈亏
    let allNoChange = 0;
    // 计算维持保证金
    const fixedValueArray = coinListInfo.positionOrders.map(item => {
      allNoChange += parseFloat(item.profitValue);
      const { riskPrice } = coinListInfo.coinInfo.filter(coin => coin.symbol === item.coinType)[0];
      return parseFloat(item.allValue) * parseFloat(riskPrice) * addEvent.getFollowRatio(item.coinType, parseFloat(item.allValue))[0];
    });
    if (fixedValueArray.length) {
      const ratio = Math.floor((fixedValueArray.reduce((a, b) => (Number(a) + Number(b))) / (parseFloat(userAllAssets) - allNoChange)) * 10000) / 100;
      setRiskLever(`${ratio || 0}%`);
    } else {
      setRiskLever('0%');
    }
  }, [coinListInfo.positionOrders, userAllAssets, coinListInfo.coinInfo]);

  // 更改tab信息
  useEffect(() => {
    setTabTitleLength(state => (state.map((item, index) => {
      if (index === 0) return `持仓(${coinListInfo.positionOrders.length})`;
      if (index === 1) return `普通委托(${coinListInfo.entrustOrders.length})`;
      return item;
    })));
  }, [coinListInfo.positionOrders, coinListInfo.entrustOrders]);

  // 定时计算预估强平价
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        addEvent.computBoomPrice();
      } catch (err) {
        console.log(err);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <View style={style.pageView}>
      {/* 头部 */}
      <View style={[style.headView]}>
        <TouchableNativeFeedback onPress={() => addEvent.showLeftChange()}>
          <View style={style.headLeftView}>
            <Image
              style={style.headLeftIcon}
              resizeMode="contain"
              source={require('../../../assets/images/icons/contract_show_left.png')} />
            <Text style={style.headLeftText}>
              {addEvent.showCointTypeText(coinType)}
            </Text>
          </View>
        </TouchableNativeFeedback>
        <View style={style.headRightView}>
          <TouchableNativeFeedback onPress={() => goToWithLogin('MarketKline', { name: coinType })}>
            <View style={style.headRightIconView}>
              <Image
                style={style.headRgihtIcon}
                resizeMode="contain"
                source={require('../../../assets/images/icons/contract_kline.png')} />
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={() => setShowMoreAlert(state => !state)}>
            <View style={style.headRightIconView}>
              <Image
                style={style.headRgihtIcon}
                resizeMode="contain"
                source={require('../../../assets/images/icons/contract_more.png')} />
            </View>
          </TouchableNativeFeedback>
        </View>
        {
          showMoreAlert && (
            <View style={style.moreView}>
              <TouchableNativeFeedback onPress={() => {
                setShowMoreAlert(false);
                goToWithLogin('transfer');
              }}>
                <View style={style.moreViewList}>
                  <Image
                    style={style.moreViewIcon}
                    resizeMode="contain"
                    source={require('../../../assets/images/icons/contract_input.png')} />
                  <Text style={style.moreViewText}>资金转入</Text>
                </View>
              </TouchableNativeFeedback>
              <View style={style.moreViewTop} />
            </View>
          )
        }
      </View>
      {/* 个人信息 */}
      <View style={style.topInfoView}>
        {
          userIsLogin && !noUserInfo && (
            <>
              <Text style={style.topInfoViewText}>
                <Text>资产:可用/当前&nbsp;&nbsp;</Text>
                <Text style={style.topInfoViewInfo}>
                  {fiexedNumber(canUseAssets, 2)}/{fiexedNumber(userAllAssets, 2)}
                </Text>
              </Text>
              <Text style={[style.topInfoViewText, style.topInfoViewRight]}>
                <Text>风险度:&nbsp;&nbsp;</Text>
                <Text style={style.topInfoViewInfo}>{riskLever}</Text>
              </Text>
              <Text style={style.topInfoViewText}>
                <Text>占用保证金&nbsp;&nbsp;</Text>
                <Text style={style.topInfoViewInfo}>
                  {useBondAssets}
                </Text>
              </Text>
              <Text style={[style.topInfoViewText, style.topInfoViewRight]}>
                <Text>资金杠杆:&nbsp;&nbsp;</Text>
                <Text style={style.topInfoViewInfo}>{nowCoinInfo.lever}</Text>
              </Text>
            </>
          )
        }
        {
          userIsLogin && noUserInfo && (
            <Text style={style.topInfoViewText}>暂无合约资产</Text>
          )
        }
        {
          !userIsLogin && (
            <Text>未登录</Text>
          )
        }
      </View>
      {/* 主内容区 */}
      <View style={style.content}>
        {/* 左侧操作区 */}
        <View style={style.contentLeft}>
          {/* 开仓平仓按钮 */}
          <View style={style.typeChangeBtnsView}>
            {
              ['开仓', '平仓'].map((item, index) => (
                <StaticTouchableNativeFeedback
                  key={index}
                  background={StaticTouchableNativeFeedback.Ripple('transparent')}
                  onPress={() => setDoType(index as typeof doType)}>
                  <View
                    style={[
                      style.typeChangeBtn,
                      index === doType && style.typeChangeBtnSelect,
                    ]}>
                    <Text style={[
                      style.typeChangeBtnText,
                      index === doType && style.typeChangeBtnSelectText,
                    ]}>
                      {item}
                    </Text>
                    <View style={[
                      style.typeChangeBtnBg,
                      index === 0 && style.typeChangeBtnLeftBg,
                    ]}>
                      <Image
                        resizeMode="stretch"
                        style={style.typeChangeBtnBgImage}
                        source={[
                          require('../../../assets/images/pic/contract_btn_no_bg.png'),
                          require('../../../assets/images/pic/contract_btn_bg.png'),
                        ][Number(index === doType)]} />
                    </View>
                  </View>
                </StaticTouchableNativeFeedback>
              ))
            }
          </View>
          {/* 委托类型/杠杆倍数 */}
          <View style={style.moreTypeChange}>
            <StaticTouchableNativeFeedback onPress={() => {}}>
              <View style={style.moreTypeChangePress}>
                <Text style={style.moreTypeChangeText}>
                  限价委托
                </Text>
                <Image
                  resizeMode="contain"
                  style={style.moreTypeChangeIcon}
                  source={require('../../../assets/images/icons/down.png')} />
              </View>
            </StaticTouchableNativeFeedback>
            {
              doType === 0 && (
                <StaticTouchableNativeFeedback onPress={() => addEvent.changeLeverType()}>
                  <View style={style.moreTypeChangePress}>
                    <Text style={style.moreTypeChangeText}>杠杆&nbsp;{nowCoinInfo.lever}X</Text>
                    <Image
                      resizeMode="contain"
                      style={style.moreTypeChangeIcon}
                      source={require('../../../assets/images/icons/down.png')} />
                  </View>
                </StaticTouchableNativeFeedback>
              )
            }
          </View>
          {/* 价格操作区 */}
          <View>
            <View>
              {/* 价格 */}
              <View style={style.priceSetView}>
                <View style={style.priceSetViewLeft}>
                  {
                    isMarketPrice
                      ? (
                        <Text style={{ color: themeGray }}>以市价执行</Text>
                      )
                      : (
                        <TextInput
                          keyboardType="numeric"
                          style={style.priceSetInputInput}
                          value={fixedPrice}
                          onChange={e => setFixedPrice(e.nativeEvent.text)}
                          placeholder="价格" />
                      )
                  }
                  {
                    !isMarketPrice && <Text style={style.priceSetInputText}>USDT</Text>
                  }
                </View>
                <StaticTouchableNativeFeedback onPress={() => addEvent.onMarketPrice()}>
                  <View style={style.priceSetViewRight}>
                    <Text style={[
                      style.priceSetViewRightText,
                      {
                        color: isMarketPrice ? defaultThemeColor : themeBlack,
                      },
                    ]}>
                      {isMarketPrice ? '市价' : '限价'}
                    </Text>
                  </View>
                </StaticTouchableNativeFeedback>
              </View>
              {/* 数量 */}
              <View style={style.priceSetValue}>
                <TextInput
                  keyboardType="number-pad"
                  style={style.priceSetInputInput}
                  value={fixedValue}
                  onChange={e => setFixedValue(e.nativeEvent.text)}
                  onFocus={() => addEvent.fixedValueFocus()}
                  onBlur={() => addEvent.fixedValueBlur()}
                  placeholder={`最小${doType === 0 ? '开仓' : '平仓'}数量: ${nowCoinInfo.openMinValue}`} />
              </View>
              {/* 滚动条 */}
              <ComSliderView
                fixedValueRatio={fixedValueRatio}
                setFixedValueRatio={setFixedValueRatio} />
              {/* 更多信息 */}
              <View style={style.ratioThenTextView}>
                {
                  !isMarketPrice && (
                    <>
                      <Text style={style.ratioThenText}>
                        {
                          doType === 0
                            ? '预占用保证金'
                            : '已占用保证金'
                        }
                      </Text>
                      <Text style={style.ratioThenText}>
                        {
                          doType === 0
                            ? occupyBond
                            : addEvent.getNowCoinPositionUseBond(coinType)
                        }
                      </Text>
                    </>
                  )
                }
              </View>
              <View style={style.ratioThenTextView}>
                {
                  doType === 0 && !isMarketPrice && (
                    <>
                      <Text style={style.ratioThenText}>可开仓数</Text>
                      <Text style={style.ratioThenText}>{canOpenValue}</Text>
                    </>
                  )
                }
                {
                  doType === 0 && isMarketPrice && (
                    <>
                      <Text style={style.ratioThenText}>预计可开仓数量</Text>
                      <Text style={style.ratioThenText}>{canOpenValue}</Text>
                    </>
                  )
                }
                {
                  doType === 1 && (
                    <>
                      <Text style={style.ratioThenText}>可平仓数</Text>
                      <Text style={style.ratioThenText}>
                        多单:{addEvent.getNowCoinPositionValue(coinType, 1)}
                        &nbsp;&nbsp;
                        空单:{addEvent.getNowCoinPositionValue(coinType, 0)}
                      </Text>
                    </>
                  )
                }
              </View>
            </View>
          </View>
          {/* 操作按钮 */}
          <View style={style.doFuncBtnsView}>
            <TouchableNativeFeedback onPress={() => {
              if (doType === 0) addEvent.submitVerfiy(0);
              else addEvent.submitVerfiy(2);
            }}>
              <View style={[
                style.doFuncBtnView,
                { backgroundColor: [themeGreen, themeRed][doType] },
              ]}>
                {
                  doType === 0
                    ? (
                      <>
                        <Text style={style.doFuncBtnText}>开仓买多</Text>
                        <Text style={style.doFuncBtnDesc}>看涨</Text>
                      </>
                    )
                    : (
                      <Text style={style.doFuncBtnText}>平多</Text>
                    )
                }
              </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback onPress={() => {
              if (doType === 0) addEvent.submitVerfiy(1);
              else addEvent.submitVerfiy(3);
            }}>
              <View style={[
                style.doFuncBtnView,
                { backgroundColor: [themeRed, themeGreen][doType] },
              ]}>
                {
                  doType === 0
                    ? (
                      <>
                        <Text style={style.doFuncBtnText}>开仓买空</Text>
                        <Text style={style.doFuncBtnDesc}>看跌</Text>
                      </>
                    )
                    : (
                      <Text style={style.doFuncBtnText}>平空</Text>
                    )
                }
              </View>
            </TouchableNativeFeedback>
          </View>
        </View>
        {/* 数据列表区 */}
        <View style={style.contentRight}>
          {/* 标题 */}
          <View style={style.contentRightTitleView}>
            <Text style={style.contentRightTitleLeft}>价格(USDT)</Text>
            <Text style={style.contentRightTitleRight}>委托数({coinType.replace('USDT', '')})</Text>
          </View>
          {/* 数据 */}
          <ContractRightValueView
            defalutPrice={nowCoinInfo.newPirce}
            coinType={coinType}
            changeValue={price => setFixedPrice(price)} />
        </View>
      </View>
      {/* 分隔符 */}
      <View style={style.comLineStyle} />
      <View>
        {/* 选项卡 */}
        <View style={style.tabView}>
          <View style={style.tabViewLeft}>
            {
              tabTitleLength.map((item, index) => (
                <TouchableNativeFeedback
                  key={index}
                  onPress={() => setLogSelectTab(index)}>
                  <View style={style.tabViewBtn}>
                    <Text style={[
                      style.tabViewBtnText,
                      logSelectTab === index && { color: themeBlack, fontWeight: 'bold' },
                    ]}>
                      {item}
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              ))
            }
          </View>
          <TouchableNativeFeedback onPress={() => goToWithLogin('ContractLogs', { coin: coinType })}>
            <View style={style.tabViewRight}>
              <StaticImage
                resizeMode="contain"
                style={style.tabViewRightImage}
                source={require('../../../assets/images/icons/contract_list_log.png')} />
              <Text style={style.tabViewRightText}>全部</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
        {/* 列表 */}
        {
          logSelectTab === 0
          && (
            coinListInfo.positionOrders.map((item) => (
              <ComContractIndexListPosition
                key={item.id}
                data={item}
                riskPrice={coinListInfo.coinInfo.filter(coin => coin.symbol === item.coinType)[0].riskPrice} />
            ))
          )
        }
        {/* 普通委托 */}
        {
          logSelectTab === 1
          && (
            coinListInfo.entrustOrders.map(item => (
              <ComContractIndexListGeneral
                key={item.id}
                data={item} />
            ))
          )
        }
        {/* 止盈止损 */}
        {
          logSelectTab === 2
          && (
            nowCoinInfo.stopOrders.map((item, index) => (
              <ComContractIndexListOrder
                key={`${item.id}${index}`}
                data={item}
                spliceOrder={() => {
                  setCoinListInfo(state => {
                    let result = [...state.coinInfo];
                    result = result.map(coin => {
                      const newCoin = { ...coin };
                      if (newCoin.symbol === coinType) {
                        newCoin.stopOrders.splice(index, 1);
                      }
                      return newCoin;
                    });
                    return {
                      ...state,
                      coinInfo: result,
                    };
                  });
                }} />
            ))
          )
        }
      </View>
    </View>
  );
};


const style = StyleSheet.create({
  pageView: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  headView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
    paddingBottom: 80,
  },
  headLeftView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: -10,
  },
  headLeftIcon: {
    width: 24,
    height: 24,
  },
  headLeftText: {
    paddingLeft: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  headRightView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headRightIconView: {
    padding: 20,
    marginRight: -10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headRgihtIcon: {
    width: 24,
    height: 24,
  },
  // 左侧列表
  leftListView: {
    backgroundColor: themeWhite,
    flex: 1,
    alignSelf: 'flex-start',
    width: '80%',
    paddingTop: 30,
  },
  leftListTitle: {
    color: defaultThemeColor,
    fontWeight: 'bold',
    fontSize: 20,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
  },
  leftListLine: {
    paddingLeft: 10,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
    flexDirection: 'row',
  },
  leftListName: {
    fontWeight: 'bold',
    flex: 2,
    color: themeBlack,
  },
  leftListPrice: {
    fontWeight: 'bold',
    flex: 1,
  },
  leftListRatio: {
    fontWeight: 'bold',
    flex: 1,
  },
  // 更多内容
  moreView: {
    backgroundColor: themeMoreBlue,
    position: 'absolute',
    top: 50,
    right: 10,
    padding: 10,
    borderRadius: 3,
    zIndex: 3,
  },
  moreViewLine: {
    height: 1,
    backgroundColor: getThemeOpacity(defaultThemeBgColor, 0.1),
  },
  moreViewList: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  moreViewIcon: {
    width: 20,
    height: 20,
  },
  moreViewText: {
    lineHeight: 30,
    color: themeGray,
    paddingLeft: 10,
    fontSize: 16,
  },
  moreViewTop: {
    position: 'absolute',
    zIndex: -1,
    top: -20,
    right: 10,
    width: 0,
    height: 0,
    borderWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: themeMoreBlue,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  topInfoView: {
    backgroundColor: defaultThemeBgColor,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -80,
  },
  topInfoViewText: {
    width: '70%',
    lineHeight: 24,
    color: themeGray,
    fontSize: 12,
  },
  topInfoViewRight: {
    width: '30%',
  },
  topInfoViewInfo: {
    fontWeight: 'bold',
    color: themeBlack,
  },
  // 主内容区
  content: {
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
  },
  // 左侧操作区
  contentLeft: {
    flex: 3,
    paddingRight: 20,
  },
  // 开仓平仓按钮
  typeChangeBtnsView: {
    flexDirection: 'row',
    borderRadius: 2,
    marginLeft: -10,
  },
  typeChangeBtn: {
    flex: 1,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  typeChangeBtnBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: -1,
  },
  typeChangeBtnLeftBg: {
    transform: [
      { rotateY: '180deg' },
      { rotateX: '180deg' },
    ],
    marginRight: -20,
    left: 10,
  },
  typeChangeBtnBgImage: {
    width: '100%',
    height: '100%',
  },
  typeChangeBtnSelect: {
  },
  typeChangeBtnText: {
    color: themeGray,
    fontSize: 15,
  },
  typeChangeBtnSelectText: {
    color: themeWhite,
  },
  // 委托类型/杠杆倍数
  moreTypeChange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moreTypeChangePress: {
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  moreTypeChangeText: {
    color: themeTextGray,
    paddingRight: 5,
  },
  moreTypeChangeIcon: {
    width: 14,
    height: 14,
    opacity: 0.5,
  },
  // 限价委托
  // 价格
  priceSetView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceSetViewLeft: {
    borderWidth: 1,
    borderColor: defaultThemeBgColor,
    flex: 3,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    height: 40,
  },
  priceSetInputInput: {
    height: 40,
    padding: 0,
    flex: 1,
  },
  priceSetInputText: {
    paddingLeft: 10,
    paddingRight: 5,
  },
  priceSetViewRight: {
    borderWidth: 1,
    borderColor: defaultThemeBgColor,
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
  },
  priceSetViewRightText: {
    fontSize: 15,
  },
  // 数量
  priceSetValue: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: defaultThemeBgColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
  },
  priceValueRatioText: {
    textAlign: 'right',
    paddingTop: 5,
    paddingBottom: 5,
    color: themeGray,
  },
  // 百分比操作区
  ratioDoView: {
    paddingRight: 2,
    marginTop: 10,
    marginBottom: 10,
  },
  ratioDoViewLine: {
    height: 2,
    backgroundColor: getThemeOpacity(themeGray, 0.3),
    position: 'relative',
  },
  ratioDoViewInLine: {
    height: 2,
    backgroundColor: defaultThemeColor,
  },
  ratioDoViewPoint: {
    position: 'absolute',
    zIndex: -1,
    top: -2,
    height: 6,
    width: 2,
  },
  ratioDoIconView: {
    position: 'absolute',
    top: -14,
    height: 30,
    width: 30,
    padding: 5,
    marginLeft: -10,
  },
  ratioDoIconImage: {
    width: '100%',
    height: '100%',
  },
  // 百分比选择区
  ratioBtnsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 5,
    paddingBottom: 5,
  },
  ratioBtnView: {
    width: '23%',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: defaultThemeBgColor,
  },
  ratioBtnViewSelect: {
    backgroundColor: getThemeOpacity(defaultThemeColor, 0.3),
  },
  ratioBtnText: {
    color: themeGray,
  },
  ratioBtnTextSelect: {
    color: defaultThemeColor,
  },
  // 占用保证金/可开手数文字
  ratioThenTextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 16,
  },
  ratioThenText: {
    fontSize: 12,
    color: themeGray,
  },
  // 计划委托
  // 触发价格
  // 预估占用
  willUseView: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  willUseViewText: {
    fontSize: 12,
    color: themeGray,
  },
  // 操作按钮
  doFuncBtnsView: {
    paddingTop: 5,
    height: 80,
    justifyContent: 'space-between',
  },
  doFuncBtnView: {
    position: 'relative',
    height: 36,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doFuncBtnText: {
    color: themeWhite,
    fontSize: 16,
  },
  doFuncBtnDesc: {
    position: 'absolute',
    top: '50%',
    right: 5,
    height: 20,
    lineHeight: 20,
    marginTop: -10,
    color: getThemeOpacity(themeWhite, 0.6),
  },
  // 右侧数据列表区
  contentRight: {
    flex: 2,
  },
  contentListView: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  contentListViewLi: {
    flexDirection: 'row',
    marginTop: 2,
    marginBottom: 2,
    position: 'relative',
    height: 20,
    alignItems: 'center',
  },
  contextListTitleLeft: {
    flex: 1,
    fontSize: 12,
  },
  contentListTitleRight: {
    fontSize: 12,
    color: themeGray,
  },
  contentListBg: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    zIndex: -1,
    opacity: 0.2,
  },
  // 指数数据
  contentIndexView: {
    alignItems: 'center',
  },
  contentIndexTitle: {
    fontSize: 10,
  },
  contentIndexPrice: {
    fontSize: 12,
  },
  contentIndexDesc: {
    fontSize: 10,
    color: themeGray,
  },
  // 标题
  contentRightTitleView: {
    flexDirection: 'row',
  },
  contentRightTitleLeft: {
    flex: 1,
    color: themeGray,
    fontSize: 10,
  },
  contentRightTitleRight: {
    color: themeGray,
    fontSize: 10,
  },
  comLineStyle: {
    backgroundColor: defaultThemeBgColor,
    height: 10,
    marginLeft: -10,
    marginRight: -10,
  },
  tabView: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    height: 44,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
  },
  tabViewLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  tabViewBtn: {
    height: 44,
    padding: 8,
    justifyContent: 'center',
  },
  tabViewBtnText: {
    color: getThemeOpacity(themeBlack, 0.5),
  },
  tabViewRight: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  tabViewRightImage: {
    width: 14,
    height: 14,
  },
  tabViewRightText: {
    color: themeGray,
    paddingLeft: 5,
  },
  // 列表视图
  listView: {
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 10,
    borderBottomColor: defaultThemeBgColor,
    backgroundColor: themeWhite,
  },
  listTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
    alignItems: 'center',
  },
  listTopRight: {
    padding: 10,
    marginRight: -10,
  },
  listTopRightText: {
    color: defaultThemeColor,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 10,
  },
  listTitleDesc: {
    fontSize: 12,
    fontWeight: '400',
    color: defaultThemeColor,
    backgroundColor: getThemeOpacity(defaultThemeColor, 0.2),
    borderRadius: 2,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 15,
    paddingRight: 15,
    marginLeft: 10,
  },
  listTopTime: {
    fontSize: 12,
    color: themeGray,
  },
  listCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
  },
  listCenterInner: {
    flex: 1,
  },
  listCenterInnerLeft: {},
  listCenterInnerCenter: {
    alignItems: 'center',
  },
  listCenterInnerRight: {
    alignItems: 'flex-end',
  },
  listCenterValue: {
    fontWeight: 'bold',
    paddingBottom: 3,
  },
  listCenterDesc: {
    fontSize: 12,
    color: themeGray,
  },
  listInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 5,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
  },
  listInfoText: {
    width: '50%',
    paddingBottom: 5,
    fontSize: 11,
    color: getThemeOpacity(themeBlack, 0.6),
  },
  listBtns: {
    flexDirection: 'row',
    width: '100%',
  },
  listBtnsLine: {
    height: 20,
    width: 1,
    backgroundColor: defaultThemeBgColor,
    marginTop: 10,
  },
  listBtn: {
    height: 40,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listBtnText: {
    color: defaultThemeColor,
  },
});

export default ContractUSDTScreen;
