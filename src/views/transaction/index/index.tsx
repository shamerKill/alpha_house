import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, StyleSheet, Image, Text, Animated, SafeAreaView, TouchableNativeFeedback as StaticTouchableNativeFeedback,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import {
  TouchableNativeFeedback, ScrollView, PanGestureHandlerGestureEvent, PanGestureHandler, TextInput,
} from 'react-native-gesture-handler';
import { showMessage } from 'react-native-flash-message';
import Socket, { SocketClass, CoinToCoinSocket } from '../../../data/fetch/socket';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';
import {
  themeWhite, defaultThemeColor, defaultThemeBgColor, themeBlack, themeMoreBlue, getThemeOpacity, themeGray, themeGreen, themeRed, themeTextGray,
} from '../../../config/theme';
import { useGoToWithLogin } from '../../../tools/routeTools';
import { modalOutBg } from '../../../components/modal/outBg';
import { numberToFormatString, fiexedNumber } from '../../../tools/number';
import showComAlert from '../../../components/modal/alert';
import ajax from '../../../data/fetch';
import { TypePositionData } from './type';
import ComLayoutHead from '../../../components/layout/head';

const routeName = 'Transaction';

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
  // 最新指数价格
  const [newPrice, setNewPrice] = useState(defalutPrice);
  const [prevNewPrice, setPrevNewPrice] = useState('--');
  // 涨1还是跌0
  const [direction, setDirection] = useState<0|1>(0);

  // 更改右侧显示指数数据
  ContractRightValueView.prototype.setNewPrice = (price: string) => {
    setNewPrice(price);
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
    const tickerImg = `cash.market.${coinType.replace('/', '')}.depth`;
    const socketListener = (message: any) => {
      if (message?.buy && message?.sell) {
        if (message.buy.length < 6 || message.sell.length < 6) return;
        const buyDataMem = [...message.sell].splice(0, 6).reverse().map((item: any) => ({
          price: `${parseFloat(item[0])}`,
          value: item[1],
        }));
        const sellDataMem = [...message.buy].splice(0, 6).map((item: any) => ({
          price: `${parseFloat(item[0])}`,
          value: item[1],
        }));
        const allData = addEvent.setData([...buyDataMem, ...sellDataMem]);
        setBuyData(allData.splice(0, 6));
        setSellData(allData);
      }
    };
    if (routePage === routeName) {
      CoinToCoinSocket.getSocket().then(ws => {
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
          {/* &#8776;&yen;{((parseFloat(newPrice) || 0) * USDTToRMB)} */}
        </Text>
        <Text style={style.contentIndexDesc}>最新指数&nbsp;{newPrice}</Text>
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
}> = ({ data }) => {
  const navigation = useNavigation();
  // const isLoading = useRef(false);

  const addEvent = {
    // 计算颜色
    getColor: (num: string) => {
      return parseFloat(num) < 0 ? themeRed : themeGreen;
    },
    // 止盈止损弹窗
    stopAlert: () => {
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
            },
          },
        });
      });
    },
    // 止盈
    stopWin: async () => {
      await addEvent.stopAlert();
      navigation.navigate('ContractOrderClose', { id: data.id });
    },
    // 止损
    stopLow: async () => {
      await addEvent.stopAlert();
      navigation.navigate('ContractOrderClose', { id: data.id });
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
        </Text>
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
          {/* <Text style={[
            style.listCenterValue,
            { color: addEvent.getColor(profitValue) },
          ]}>
            {profitValue}
          </Text>
          <Text style={style.listCenterDesc}>未实现盈亏</Text> */}
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          {/* <Text style={[
            style.listCenterValue,
            { color: addEvent.getColor(profitValue) },
          ]}>
            {profitRatio}
          </Text>
          <Text style={style.listCenterDesc}>收益率</Text> */}
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
          {/* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;占用保证金&nbsp;{stateUseBond}USDT */}
        </Text>
        <Text style={[
          style.listInfoText,
          { width: '33%' },
        ]}>
          {/* 预估强平价&nbsp;{data.willBoomPrice} */}
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
        {/* <TouchableNativeFeedback onPress={() => addEvent.stopWin()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>止盈</Text>
          </View>
        </TouchableNativeFeedback>
        <View style={style.listBtnsLine} />
        <TouchableNativeFeedback onPress={() => addEvent.stopLow()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>止损</Text>
          </View>
        </TouchableNativeFeedback> */}
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
const ComContractIndexListGeneral: FC<{data: TypePositionData;}> = ({ data }) => {
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
          {['开空', '开多', '平多', '平空'][data.type]}
          &nbsp;&nbsp;
          {data.coinType}
          &nbsp;&nbsp;
        </Text>
        <Text style={style.listTopTime}>{data.time}</Text>
      </View>
      {/* 中部 */}
      <View style={style.listCenter}>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerLeft,
        ]}>
          {/* <Text style={style.listCenterValue}>{data.willNumber}</Text> */}
          <Text style={style.listCenterDesc}>委托量</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerCenter,
        ]}>
          <Text style={[style.listCenterValue]}>
            {/* {data.willPrice} */}
          </Text>
          <Text style={style.listCenterDesc}>委托价格</Text>
        </View>
        <View style={[
          style.listCenterInner,
          style.listCenterInnerRight,
        ]}>
          <Text style={[style.listCenterValue]}>
            {/* {data.haveNumber} */}
          </Text>
          <Text style={style.listCenterDesc}>已成交</Text>
        </View>
      </View>
      {/* 详情 */}
      <View style={style.listInfo}>
        {/* <Text style={style.listInfoText}>可撤&nbsp;{data.backValue}</Text> */}
        {/* <Text style={style.listInfoText}>状态&nbsp;{['未成交', '部分成交'][data.state]}</Text> */}
        {/* <Text style={style.listInfoText}>止盈触发价&nbsp;{data.winStartPrice}</Text>
        <Text style={style.listInfoText}>止盈执行价&nbsp;{data.winDoPrice}</Text>
        <Text style={style.listInfoText}>止损触发价&nbsp;{data.lowStartPrice}</Text>
        <Text style={style.listInfoText}>止损执行价&nbsp;{data.lowDoPrice}</Text> */}
      </View>
      {/* 按钮 */}
      <View style={style.listBtns}>
        <TouchableNativeFeedback onPress={() => addEvent.backOrder()}>
          <View style={style.listBtn}>
            <Text style={style.listBtnText}>撤销</Text>
          </View>
        </TouchableNativeFeedback>
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

type TypeAllCoinInfo = {
  symbol: string; // 币种信息
  newPirce: string; // 指数价格
  ratio: string; // 涨幅
  haveCoin: string; // 持币数量
  // 当前委托单
  positionOrders: TypePositionData[];
  // 历史委托单
  entrustOrders: TypePositionData[];
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

  // 显示状态
  // 是否显示更多弹窗
  const [showMoreAlert, setShowMoreAlert] = useState(false);
  // 是否以市价执行
  const [isMarketPrice, setMarketPrice] = useState(false);
  // 限价委托价格
  const [fixedPrice, setFixedPrice] = useState('');
  // 限价委托数量
  const [fixedValue, setFixedValue] = useState('');
  // 数量百分比
  const [fixedValueRatio, setFixedValueRatio] = useState(0);
  // 底部记录选项卡
  const [logSelectTab, setLogSelectTab] = useState(0);
  const logSelectTabRef = useRef(logSelectTab);
  useEffect(() => {
    logSelectTabRef.current = logSelectTab;
  }, [logSelectTab]);


  // 各种币种数据
  const [coinListInfo, setCoinListInfo] = useState<TypeAllCoinInfo[]>([]);
  const defaultCoinListInfo = useRef<TypeAllCoinInfo>({
    symbol: '', // 币种信息
    newPirce: '', // 指数价格
    ratio: '', // 涨幅
    haveCoin: '', // 持币数量
    positionOrders: [],
    entrustOrders: [],
  });

  // 当前币种数据
  const [nowCoinInfo, setNowCoinInfo] = useState<TypeAllCoinInfo>({ ...defaultCoinListInfo.current });

  // 委托请求loading
  // const [loading, setLoading] = useState(false);

  // 获取用户信息判断
  const getUserInfoMem = useRef(0);

  const addEvent = {
    // 获取当前用户信息
    fetchUserInfo: () => {
      if (!userIsLogin) return;
      getUserInfoMem.current += 1;
      const memData = getUserInfoMem.current;
      ajax.get('/contract/api/v1/bian/gold_accounts').then(data => {
        if (data.status === 200 && data.data.asset && memData === getUserInfoMem.current) {
          const res = data.data;
          // 有用户数据
          setNoUserInfo(false);
          // 可用资产
          setCanUseAssets(`${fiexedNumber(res.asset.availableBalance, 2)}`);
          // 当前资产
          setUserAllAssets(`${fiexedNumber(res.asset.crossWalletBalance, 2)}`);
          // 更改币种信息
        }
      }).catch(err => {
        console.log(err);
      });
    },
    // 获取当前委托数据
    fetchPostionsOrders: (nowCoinType: string) => {
      console.log(nowCoinType);
    },
    // 获取历史委托数据
    fetchEntrustOrders: (nowCoinType: string) => {
      console.log(nowCoinType);
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
    // 根数指数价格处理币种价格和涨幅数据
    setCoinInfo: (res: {price: string; ratio: string; symbol: string;}[]) => {
      // 如果当前没有币种数据，切换页面
      if (coinTypeRef.current === '') {
        addEvent.toGoCoinPage(res[0].symbol);
      }
      setCoinListInfo((state) => {
        if (state.length === 0) {
          return res.map(item => ({
            ...defaultCoinListInfo.current,
            symbol: item.symbol,
            newPirce: item.price,
            ratio: item.ratio,
          }));
        }
        return state.map((item, index) => ({
          ...item,
          symbol: res[index].symbol,
          newPirce: res[index].price,
          ratio: res[index].ratio,
        }));
      });
    },
    // 将币种数据转化为左侧列表可用数据
    allCoinListToLeftCoinList: (allCoin: typeof coinListInfo) => {
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
        defaultLeftList={addEvent.allCoinListToLeftCoinList(coinListInfo)} />);
      modalOutBg.outBgsetShow(true);
      modalOutBg.outBgCanClose(true);
    },
    // 点击市价按钮,市价限价切换
    onMarketPrice: async () => {
      console.log(123);
      setMarketPrice(state => {
        return !state;
      });
    },
    // 数量获取焦点时如果带有百分号，清空
    fixedValueFocus: () => {
      if (/%+/.test(fixedValue)) {
        setFixedValueRatio(0);
      }
      if (fixedValue === '0') {
        setFixedValue('');
      }
    },
    // 订单提交弹窗0开多，1开空，2平多，3平空
    submitVerfiy: (type: 0|1|2|3) => {
      showMessage({
        position: 'bottom',
        type: 'info',
        message: '功能开发中，敬请期待',
      });
      // if (!userIsLogin) {
      //   showMessage({
      //     position: 'bottom',
      //     type: 'warning',
      //     message: '尚未登录',
      //   });
      //   return;
      // }
      // if (noUserInfo) {
      //   showMessage({
      //     position: 'bottom',
      //     type: 'warning',
      //     message: '尚未充值',
      //   });
      //   return;
      // }
      // // 订单提示
      // const changeValue = fixedValue;
      // addEvent.submitAlert(type, changeValue).then(data => {
      //   if (data) addEvent.submitOrder(type, changeValue);
      // });
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
      console.log('提交订单', type, changeValue);
    },
  };

  // 进入页面获取数据
  // 获取指数价格
  const stopScoket = useRef(false);
  useEffect(() => {
    let newPriceSocketRef: SocketClass|null = null;
    const newPirceMark = 'cash.market.ALL.ticker';
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
          price: `${parseFloat(item.close)}`,
          ratio: `${range}%`,
        });
      });
      addEvent.setCoinInfo(result);
    };
    if (routePage === routeName) {
      stopScoket.current = true;
      // 页面切换的时候更新数据
      fristGetFetch.current = true;
      CoinToCoinSocket.getSocket().then(ws => {
        newPriceSocketRef = ws;
        ws.addListener(newPirceMarkListener, newPirceMark);
        ws.send(newPirceMark, 'req');
        ws.send(newPirceMark, 'sub');
      }).catch(err => {
        console.log(err);
      });
    }
    return () => {
      if (stopScoket.current) {
        stopScoket.current = false;
        newPriceSocketRef?.send(newPirceMark, 'unsub');
        newPriceSocketRef?.removeListener(newPirceMarkListener);
      }
    };
  }, [routePage]);

  // 更改左侧数据显示
  useEffect(() => {
    ContractHeadLeftView?.prototype?.setLeftList?.(
      addEvent.allCoinListToLeftCoinList(coinListInfo)
    );
  }, [coinListInfo]);

  // 更改当前币种数据信息
  useEffect(() => {
    if (coinType === '' || coinListInfo.length === 0) return;
    const nowCoin = coinListInfo.filter(item => item.symbol === coinType);
    if (nowCoin.length === 0) return;
    setNowCoinInfo(nowCoin[0]);
    // 更改最新指数价
    ContractRightValueView.prototype.setNewPrice(nowCoin[0].newPirce);
  }, [coinType, coinListInfo]);

  // 第一次获取币种列表之后获取数据
  const fristGetFetch = useRef(true);
  useEffect(() => {
    if (coinListInfo.length === 0) return;
    if (!fristGetFetch.current) return;
    fristGetFetch.current = false;
    addEvent.fetchUserInfo();
  }, [coinListInfo]);

  // 根据当前币种信息更改数据
  useEffect(() => {
    if (userAllAssets === '') return;
    if (logSelectTab === 0) {
      addEvent.fetchPostionsOrders(coinTypeRef.current);
    } else if (logSelectTab === 1) {
      addEvent.fetchEntrustOrders(coinTypeRef.current);
    }
  }, [coinType, logSelectTab, userAllAssets]);

  // 根据币种/开仓平仓更改，进行数据初始化
  useEffect(() => {
    setFixedPrice('');
    setFixedValue('');
    setFixedValueRatio(0);
  }, [coinType]);

  // 监听订单更改
  // TODO: 需要更改成现货的订单
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  useEffect(() => {
    if (!userInfo.token) return;
    const tickerImg = `gold.market.ALL.account.${userInfo.token}`;
    const socketListener = () => {
      if (logSelectTabRef.current === 0) addEvent.fetchPostionsOrders(coinTypeRef.current);
      else if (logSelectTabRef.current === 1) addEvent.fetchEntrustOrders(coinTypeRef.current);
      addEvent.fetchUserInfo();
      // if (data.tick.type === 1) {
      //   // 创建委托
      // } else if (data.tick.type === 2) {
      //   // 成交委托
      // } else if (data.tick.type === 3) {
      //   // 撤销委托
      // } else if (data.tick.type === 4) {
      //   // 平仓
      // } else if (data.tick.type === 5) {
      //   // 爆仓平仓
      // }
    };
    if (routePage === routeName) {
      // 获取USDT合约
      // marketSocket.getSocket().then(ws => {
      //   socket.current = ws;
      //   ws.addListener(socketListener, tickerImg);
      //   ws.send(tickerImg, 'sub');
      //   subSocket.current = false;
      // }).catch(err => {
      //   console.log(err);
      // });
    } else if (socket.current) {
      if (subSocket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(tickerImg);
      }
    }
  }, [routePage]);


  return (
    <ComLayoutHead
      close
      overScroll
      scrollStyle={{ backgroundColor: themeWhite }}>
      <View style={style.pageView}>
        {/* 头部 */}
        <View style={style.headView}>
          <TouchableNativeFeedback onPress={() => addEvent.showLeftChange()}>
            <View style={style.headLeftView}>
              <Image
                style={style.headLeftIcon}
                resizeMode="contain"
                source={require('../../../assets/images/icons/contract_show_left.png')} />
              <Text style={style.headLeftText}>
                {addEvent.showCointTypeText(coinType)}现货
              </Text>
            </View>
          </TouchableNativeFeedback>
          <View style={style.headRightView}>
            <TouchableNativeFeedback onPress={() => goToWithLogin('TranscationKline', { name: coinType })}>
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
                  <Text style={style.topInfoViewInfo}>暂无</Text>
                  {/* <Text style={style.topInfoViewInfo}>{canUseAssets}/{userAllAssets}</Text> */}
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
                  <StaticTouchableNativeFeedback onPress={() => {
                    console.log(222);
                    addEvent.onMarketPrice();
                  }}>
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
                    placeholder="交易数量(USDT)" />
                </View>
                {/* 滚动条 */}
                <ComSliderView
                  fixedValueRatio={fixedValueRatio}
                  setFixedValueRatio={setFixedValueRatio} />
                {/* 更多信息 */}
                <View style={style.ratioThenTextView}>
                  <Text style={style.ratioThenText}>持有USDT</Text>
                  <Text style={style.ratioThenText}>{}</Text>
                </View>
                <View style={style.ratioThenTextView}>
                  <Text style={style.ratioThenText}>持有{coinType.replace('USDT', '')}</Text>
                  <Text style={style.ratioThenText}>{}</Text>
                </View>
              </View>
            </View>
            {/* 操作按钮 */}
            <View style={style.doFuncBtnsView}>
              <TouchableNativeFeedback onPress={() => addEvent.submitVerfiy(0)}>
                <View style={[
                  style.doFuncBtnView,
                  { backgroundColor: themeGreen },
                ]}>
                  <Text style={style.doFuncBtnText}>买入</Text>
                </View>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback onPress={() => addEvent.submitVerfiy(1)}>
                <View style={[
                  style.doFuncBtnView,
                  { backgroundColor: themeRed },
                ]}>
                  <Text style={style.doFuncBtnText}>卖出</Text>
                </View>
              </TouchableNativeFeedback>
            </View>
          </View>
          {/* 数据列表区 */}
          <View style={style.contentRight}>
            {/* 标题 */}
            <View style={style.contentRightTitleView}>
              <Text style={style.contentRightTitleLeft}>价格</Text>
              <Text style={style.contentRightTitleRight}>委托数</Text>
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
                ['当前委托', '历史委托'].map((item, index) => (
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
          </View>
          {/* 列表 */}
          {
            logSelectTab === 0
            && (
              nowCoinInfo.positionOrders.map(item => (
                <ComContractIndexListPosition
                  key={item.id}
                  data={item} />
              ))
            )
          }
          {/* 普通委托 */}
          {
            logSelectTab === 1
            && (
              nowCoinInfo.entrustOrders.map(item => (
                <ComContractIndexListGeneral
                  key={item.id}
                  data={item} />
              ))
            )
          }
        </View>
      </View>
    </ComLayoutHead>
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
    height: 20,
    marginTop: 4,
    marginBottom: 4,
  },
  ratioThenText: {
    fontSize: 14,
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
    marginTop: 10,
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
