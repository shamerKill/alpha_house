import React, {
  FC, useState, useRef, useEffect,
} from 'react';
import {
  View, TouchableNativeFeedback as StaticTouchableNativeFeedback, Image, Text, Animated, StyleSheet, SafeAreaView, TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ScrollView, PanGestureHandler, PanGestureHandlerGestureEvent, TouchableNativeFeedback,
} from 'react-native-gesture-handler';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../components/layout/head';
import {
  themeWhite, themeGray, themeGreen, themeRed, themeMoreBlue, getThemeOpacity, defaultThemeBgColor, defaultThemeColor, themeBlack, themeTextGray,
} from '../../config/theme';
import { TypeLeftOutList } from '../contract/index/type';
import { modalOutBg } from '../../components/modal/outBg';
import { numberToFormatString } from '../../tools/number';
import ComLine from '../../components/line';
import ComTranscationView from './logs';
import ajax from '../../data/fetch';
import showSelector from '../../components/modal/selector';
import useGetDispatch from '../../data/redux/dispatch';
import { InState } from '../../data/redux/state';
import showPayPass from '../../components/modal/paypass';
import showComAlert from '../../components/modal/alert';
import Socket, { CoinToCoinSocket } from '../../data/fetch/socket';


// 买卖列表类型
type TypeSellBuyList = {
  price: string;
  value: number;
};

// 滑块组件
const ComSliderView: FC<{
  fixedValueRatio: number;
  setFixedValueRatio: React.Dispatch<React.SetStateAction<number>>;
  hideFixedValue: boolean;
}> = ({
  fixedValueRatio,
  setFixedValueRatio,
  hideFixedValue,
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
      }, 200));
    },
  };

  useEffect(() => {
    setRatioValue(fixedValueRatio);
  }, [fixedValueRatio]);

  return (
    <View>
      {/* 所占百分比 */}
      <Text style={style.priceValueRatioText}>
        {
          hideFixedValue ? ' ' : `${ratioValue}%`
        }
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
              source={require('../../assets/images/icons/contract_progress_box.png')} />
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

// 右侧数据显示
const ContractRightValueView: FC<{USDTToRMB: number, getPrice: React.MutableRefObject<string>}> = ({ USDTToRMB, getPrice }) => {
  // 买列表
  const [buyData, setBuyData] = useState<(TypeSellBuyList&{ratio?:string})[]>([]);
  // 卖
  const [sellData, setSellData] = useState<(TypeSellBuyList&{ratio?:string})[]>([]);
  // 最新指数价格
  const [newPrice, setNewPrice] = useState('--');
  // 涨1还是跌0
  const [direction, setDirection] = useState<0|1>(0);
  // 买入

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
  };

  useEffect(() => {
    const result = getPrice;
    result.current = newPrice;
  }, [newPrice]);
  useEffect(() => {
    // 跟新数据
    const timer = setInterval(() => {
      setDirection(Math.round(Math.random()) as typeof direction);
      setBuyData(addEvent.setData([
        { price: '9647.96', value: Math.round(Math.random() * 10000) + 1 },
        { price: '9646.96', value: Math.round(Math.random() * 10000) + 1 },
        { price: '9645.96', value: Math.round(Math.random() * 10000) + 1 },
        { price: '9644.96', value: Math.round(Math.random() * 10000) + 1 },
        { price: '9643.96', value: Math.round(Math.random() * 10000) + 1 },
        { price: '9642.96', value: Math.round(Math.random() * 10000) + 1 },
      ]));
      setSellData(addEvent.setData([
        { price: '9647.96', value: Math.round(Math.random() * 10000) + 1 },
        { price: '9646.96', value: Math.round(Math.random() * 10000) + 1 },
        { price: '9645.96', value: Math.round(Math.random() * 10000) + 1 },
        { price: '9644.96', value: Math.round(Math.random() * 10000) + 1 },
        { price: '9643.96', value: Math.round(Math.random() * 10000) + 1 },
        { price: '9642.96', value: Math.round(Math.random() * 10000) + 1 },
      ]));
      setNewPrice((9642 + Math.random() * 10).toFixed(2));
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return (
    <View>
      <View style={style.contentListView}>
        {
          buyData.map((item, index) => (
            <View key={index} style={style.contentListViewLi}>
              <Text style={[
                style.contextListTitleLeft,
                { color: themeGreen },
              ]}>
                {item.price}
              </Text>
              <Text
                style={style.contentListTitleRight}>
                {numberToFormatString(item.value)}
              </Text>
              <View style={[
                style.contentListBg,
                { backgroundColor: themeGreen, width: item.ratio },
              ]} />
            </View>
          ))
        }
      </View>
      <View style={style.contentIndexView}>
        <Text style={style.contentIndexTitle}>
          <Text style={[
            style.contentIndexPrice,
            { color: [themeGreen, themeRed][direction] },
          ]}>
            {newPrice}
          </Text>
          &#8776;&yen;{((parseFloat(newPrice) || 0) * USDTToRMB).toFixed(2)}
        </Text>
        <Text style={style.contentIndexDesc}>最新指数&nbsp;{newPrice}</Text>
      </View>
      <View style={style.contentListView}>
        {
          sellData.map((item, index) => (
            <View key={index} style={style.contentListViewLi}>
              <Text style={[
                style.contextListTitleLeft,
                { color: themeRed },
              ]}>
                {item.price}
              </Text>
              <Text
                style={style.contentListTitleRight}>
                {numberToFormatString(item.value)}
              </Text>
              <View style={[
                style.contentListBg,
                { backgroundColor: themeRed, width: item.ratio },
              ]} />
            </View>
          ))
        }
      </View>
    </View>
  );
};

const TransactionLeftView: FC<{ leftList: TypeLeftOutList[]; changeCoin: (id: TypeLeftOutList['id']) => void; }> = ({
  leftList,
  changeCoin,
}) => {
  const animatedValue = useRef(new Animated.Value(-400));

  const addEvent = {
    changeCoinType: (id: TypeLeftOutList['id']) => {
      modalOutBg.outBgsetShow(false);
      changeCoin(id);
    },
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
        <Text style={style.leftListTitle}>币币</Text>
        <ScrollView style={{ flex: 1 }}>
          {
          leftList.map(item => {
            const ratioNum = parseFloat(item.ratio);
            let color = themeGray;
            if (ratioNum > 0) color = themeGreen;
            if (ratioNum < 0) color = themeRed;
            return (
              <TouchableNativeFeedback key={item.id} onPress={() => addEvent.changeCoinType(item.id)}>
                <View style={style.leftListLine}>
                  <Text style={style.leftListName}>{item.name}</Text>
                  <Text style={[
                    style.leftListPrice,
                    { color },
                  ]}>
                    {item.priceUSDT}
                  </Text>
                  <Text style={[
                    style.leftListRatio,
                    { color },
                  ]}>
                    {item.ratio}
                  </Text>
                </View>
              </TouchableNativeFeedback>
            );
          })
        }
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};

const TransactionScreen: FC = () => {
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const [prevRoutePage] = useGetDispatch<InState['pageRouteState']['prevPageRoute']>('pageRouteState', 'prevPageRoute');
  const navigation = useNavigation();
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  // 委托类型0限价委托，1市价委托
  const entrustTypeData = ['限价委托', '市价委托'];
  const [entrustType, setEntrustType] = useState<0|1>(0);

  // 币种交易对
  const [coinType, setCoinType] = useState<TypeLeftOutList['id']>('BTC/USDT');
  // 是否显示更多
  const [showMore, setShowMore] = useState(false);
  // 左侧币种列表
  const [coinListArr, setCoinListArr] = useState<TypeLeftOutList[]>([]);
  // 左侧币种symbol列表
  const [coinListSymbolArr, setCoinListSymbolArr] = useState<string[]>([]);
  // 数量百分比
  const [fixedValueRatio, setFixedValueRatio] = useState(0);
  // 隐藏百分比数量
  const [hideFixedValue, setHideFixedValue] = useState(true);
  // usdt/rmb汇率
  const [USDTToRMB, setUSDTToRMB] = useState(7);
  const [rmbValue, setRmbValue] = useState('');
  // 最新指数价格
  const newPrice = useRef('--');
  // 买入0/卖出1
  const [paySell, setPaySell] = useState<0|1>(0);
  // 可用USDT
  const [canUseMoney, setCanUseMoney] = useState('0');
  // 可用币种
  const [canUseCoin, setCanUseCoin] = useState('0');
  // 交易额
  const [changeUSDT, setChangeUSDT] = useState('0');
  // 价格
  const [price, setPrice] = useState('');
  // 数量
  const [vol, setVol] = useState('');
  // 是否有密码
  const [hasPass, setHasPass] = useState(false);
  // 是否在请求执行中
  const [submitLoading, setSubmitLoading] = useState(false);

  const addEvent = {
    // 获取是否有交易密码
    getHasPayPass: () => {
      ajax.post('/v1/currency/changepass', {}).then(data => {
        if (data.status === 200) {
          setHasPass(data.data === 'true');
        }
      }).catch(err => {
        console.log(err);
      });
    },
    // 更改限价委托/市价委托
    changePayType: () => {
      const close = showSelector({
        data: entrustTypeData,
        selected: entrustTypeData[entrustType],
        onPress: str => {
          close();
          if (typeof str === 'string') {
            setEntrustType(entrustTypeData.indexOf(str) as typeof entrustType);
            if (str === entrustTypeData[1]) {
              setPrice('市价');
            } else {
              setPrice('');
            }
            setVol('');
          }
        },
      });
    },
    // 显示左侧内容
    showLeftChange: () => {
      modalOutBg.outBgsetChildren(<TransactionLeftView leftList={coinListArr} changeCoin={addEvent.goToLink} />);
      modalOutBg.outBgsetShow(true);
      modalOutBg.outBgCanClose(true);
    },
    // 前往页面
    goToLink: (coin: TypeLeftOutList['id']) => {
      navigation.navigate('Transaction', { coin });
      setCoinType(coin);
    },
    // 更改数量
    changeVol: (text: string) => {
      if (entrustType === 0) {
        if (parseFloat(canUseMoney) === 0) setVol(canUseMoney);
        // eslint-disable-next-line no-useless-escape
        else if (/^[\d|\.]*$/.test(text)) setVol(text);
      } else if (entrustType === 1) {
        if (parseFloat(text) > parseFloat(canUseMoney)) setVol(canUseMoney);
        else if (parseFloat(text) < 0) setVol('0');
        // eslint-disable-next-line no-useless-escape
        else if (/^[\d|\.]*$/.test(text)) setVol(text);
      }
    },
    // 买卖操作
    changePass: () => {
      if (submitLoading) {
        showMessage({
          position: 'bottom',
          message: '您有一笔订单正在提交，请稍后',
          type: 'warning',
        });
        return;
      }
      if (hasPass) {
        showPayPass({
          submitPass: addEvent.getPassSubmit,
          navigation,
        });
      } else {
        const closeAlert = showComAlert({
          title: '请设置交易密码',
          desc: '您未设置交易密码，请前往设置',
          success: {
            text: '前往设置',
            onPress: () => {
              // 修改支付密码
              navigation.navigate('changePass', { state: 'pay' });
              closeAlert();
            },
          },
          close: {
            text: '取消',
            onPress: () => {
              closeAlert();
            },
          },
        });
      }
    },
    getPassSubmit: (pass: string) => {
      if (parseFloat(vol) === 0) {
        showMessage({
          position: 'bottom',
          message: '数量不能为0',
          type: 'warning',
        });
        return;
      }
      // 挂单操作
      const fm: {[key: string]: string|number} = {};
      // 设置数量
      fm.entrust_num = vol;
      // 买入卖出币种
      if (paySell === 0) {
        fm.type = 1;
        if (vol.match('%')) fm.entrust_num = (parseFloat(vol) * parseFloat(canUseMoney)) / 100;
      } else {
        fm.type = 2;
        if (vol.match('%')) fm.entrust_num = (parseFloat(vol) * parseFloat(canUseCoin)) / 100;
      }
      [fm.buy_currency] = coinType.split('/');
      [, fm.sell_currency] = coinType.split('/');
      fm.price = price;
      fm.trust_type = entrustType + 1;
      fm.pay_password = pass;
      setSubmitLoading(true);
      ajax.post('/v1/currency/purchase', fm).then(data => {
        if (data.status === 200) {
          setTimeout(() => {
            showMessage({
              position: 'bottom',
              message: '订单委托成功',
              type: 'success',
            });
            ComTranscationView.prototype.getData();
          }, 1000);
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
        setSubmitLoading(false);
      });
    },
  };

  useEffect(() => {
    // 获取左侧数据
    const tickerImg = 'cash.market.ALL.ticker';
    const socketListener = (message: any) => {
      const resultData: {
        [key: string]: {
          close: string;
          open: string;
          symbol: string;
        }
      } = message.Tick;
      const result: typeof coinListArr = Object.values(resultData || {}).map(coin => {
        const close = parseFloat(coin.close);
        const open = parseFloat(coin.open);
        const range = Math.floor(((close - open) / open) * 10000) / 100;
        return {
          name: `${coin.symbol.replace('USDT', '')}/USDT`,
          priceUSDT: coin.close,
          ratio: `${range}%`,
          id: `${coin.symbol.replace('USDT', '')}/USDT`,
        };
      });
      setCoinListArr(result);
      if (coinListSymbolArr.length === 0) {
        setCoinListSymbolArr(result.map(item => item.name));
      }
    };
    if (routePage === 'Transaction') {
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
      if (subSocket.current) return;
      subSocket.current = true;
      socket.current.send(tickerImg, 'unsub');
      socket.current.removeListener(tickerImg);
    }
  }, [routePage]);

  useEffect(() => {
  }, [coinListSymbolArr]);

  useEffect(() => {
    if (entrustType === 0) {
      if (vol.match('%')) {
        if (paySell === 0) {
          setChangeUSDT(`${parseFloat(price || '0') * parseFloat(`${(parseFloat(vol) / 100) * parseFloat(canUseMoney)}` || '0')}`);
        } else {
          setChangeUSDT(`${parseFloat(price || '0') * parseFloat(`${(parseFloat(vol) / 100) * parseFloat(canUseCoin)}` || '0')}`);
        }
      } else {
        setChangeUSDT(`${parseFloat(price || '0') * parseFloat(vol || '0')}`);
      }
    }
  }, [price, vol]);

  useEffect(() => {
    // 更改数量
    setVol(`${fixedValueRatio}%`);
  }, [fixedValueRatio]);

  useEffect(() => {
    ajax.post('/v1/currency/coin', {
      symbol: coinType.split('/')[1],
    }).then(data => {
      if (data.status === 200) {
        setCanUseMoney(data.data[0]);
        setUSDTToRMB(data.data[1]);
      }
    }).catch(err => {
      console.log(err);
    });
    ajax.post('/v1/currency/coin', {
      symbol: coinType.split('/')[0],
    }).then(data => {
      if (data.status === 200) {
        setCanUseCoin(data.data[0]);
      }
    }).catch(err => {
      console.log(err);
    });
  }, [coinType]);

  useEffect(() => {
    if (`${parseFloat(vol)}` !== vol && vol !== '') setHideFixedValue(false);
    else setHideFixedValue(true);
  }, [vol]);

  useEffect(() => {
    setRmbValue(`${(USDTToRMB * parseFloat(price) || 0).toFixed(2)}`);
  }, [USDTToRMB, price]);

  useEffect(() => {
    if (routePage === 'Transaction' && prevRoutePage === 'changePass') {
      addEvent.getHasPayPass();
    }
  }, [routePage]);
  useEffect(() => {
    addEvent.getHasPayPass();
  }, []);

  return (
    <ComLayoutHead
      border
      title="币币交易"
      leftComponent={<View />}
      scrollStyle={{ backgroundColor: themeWhite }}>
      {/* 头部 */}
      <View>
        <View style={style.headView}>
          <StaticTouchableNativeFeedback onPress={() => addEvent.showLeftChange()}>
            <View style={style.headLeftView}>
              <Image
                style={style.headLeftIcon}
                resizeMode="contain"
                source={require('../../assets/images/icons/contract_show_left.png')} />
              <Text style={style.headLeftText}>
                {coinType}
              </Text>
            </View>
          </StaticTouchableNativeFeedback>
          <View style={style.headRightView}>
            <StaticTouchableNativeFeedback onPress={() => navigation.navigate('TranscationKline', { name: coinType })}>
              <View style={style.headRightIconView}>
                <Image
                  style={style.headRgihtIcon}
                  resizeMode="contain"
                  source={require('../../assets/images/icons/contract_kline.png')} />
              </View>
            </StaticTouchableNativeFeedback>
            <StaticTouchableNativeFeedback onPress={() => setShowMore(state => !state)}>
              <View style={style.headRightIconView}>
                <Image
                  style={style.headRgihtIcon}
                  resizeMode="contain"
                  source={require('../../assets/images/icons/contract_more.png')} />
              </View>
            </StaticTouchableNativeFeedback>
          </View>
          {
            showMore && (
              <View style={style.moreView}>
                <View style={style.moreViewList}>
                  <Image
                    style={style.moreViewIcon}
                    resizeMode="contain"
                    source={require('../../assets/images/icons/contract_input.png')} />
                  <Text style={style.moreViewText}>资金转入</Text>
                </View>
                {/* <View style={style.moreViewLine} /> */}
                {/* <View style={style.moreViewList}>
                  <Image
                    style={style.moreViewIcon}
                    resizeMode="contain"
                    source={require('../../assets/images/icons/contract_counter.png')} />
                  <Text style={style.moreViewText}>合约计算器</Text>
                </View> */}
                <View style={style.moreViewTop} />
              </View>
            )
          }
        </View>
      </View>
      {/* 主内容区 */}
      <View style={style.content}>
        {/* 主操作区 */}
        <View style={style.contentLeft}>
          {/* 开仓平仓按钮 */}
          <View style={style.typeChangeBtnsView}>
            {
              ['买入', '卖出'].map((item, index) => (
                <StaticTouchableNativeFeedback
                  key={index}
                  background={StaticTouchableNativeFeedback.Ripple('transparent')}
                  onPress={() => setPaySell(index as typeof paySell)}>
                  <View
                    style={[
                      style.typeChangeBtn,
                      index === paySell && style.typeChangeBtnSelect,
                    ]}>
                    <Text style={[
                      style.typeChangeBtnText,
                      index === paySell && style.typeChangeBtnSelectText,
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
                          require('../../assets/images/pic/contract_btn_no_bg.png'),
                          require('../../assets/images/pic/contract_btn_bg.png'),
                        ][Number(index === paySell)]} />
                    </View>
                  </View>
                </StaticTouchableNativeFeedback>
              ))
            }
          </View>
          {/* 限价/市价 */}
          <View style={style.moreTypeChange}>
            <StaticTouchableNativeFeedback onPress={() => addEvent.changePayType()}>
              <View style={style.moreTypeChangePress}>
                <Text style={style.moreTypeChangeText}>
                  { entrustTypeData[entrustType] }
                </Text>
                <Image
                  resizeMode="contain"
                  style={style.moreTypeChangeIcon}
                  source={require('../../assets/images/icons/down.png')} />
              </View>
            </StaticTouchableNativeFeedback>
          </View>
          {/* 价格操作区 */}
          <View>
            <View>
              {/* 价格 */}
              <View style={style.priceSetView}>
                <View style={style.priceSetViewLeft}>
                  <TextInput
                    keyboardType="number-pad"
                    style={style.priceSetInputInput}
                    placeholder="价格"
                    value={price}
                    onChangeText={text => setPrice(text)} />
                  {
                    // 市价委托
                    entrustType === 1 && (
                      <View style={{
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }} />
                    )
                  }
                </View>
              </View>
              <Text>&asymp;&yen;{rmbValue}</Text>
              {/* 数量 */}
              <View style={style.priceSetValue}>
                <TextInput
                  keyboardType="numeric"
                  style={style.priceSetInputInput}
                  placeholder={
                    entrustType === 1
                      ? '数量(USDT)' : `数量(${coinType.split('/')[0]})`
                  }
                  value={vol}
                  onFocus={() => `${parseFloat(vol)}` !== vol && setVol('')}
                  onChangeText={text => addEvent.changeVol(text)} />
              </View>
              {/* 滚动条 */}
              <ComSliderView
                fixedValueRatio={fixedValueRatio}
                setFixedValueRatio={setFixedValueRatio}
                hideFixedValue={hideFixedValue} />
              {/* 更多信息 */}
              <View style={style.ratioThenTextView}>
                <Text style={style.ratioThenText}>
                  可用({
                    coinType.split('/')[Number(!paySell)]
                  })
                </Text>
                <Text style={style.ratioThenText}>
                  {
                    [canUseMoney, canUseCoin][paySell]
                  }
                </Text>
              </View>
              {
                entrustType === 0 ? (
                  <View style={style.ratioThenTextView}>
                    <Text style={style.ratioThenText}>
                      交易额(USDT)
                    </Text>
                    <Text style={style.ratioThenText}>{changeUSDT}</Text>
                  </View>
                ) : (
                  <View style={style.ratioThenTextView}>
                    <Text style={style.ratioThenText}>{' '}</Text>
                  </View>
                )
              }
            </View>
            {/* 操作按钮 */}
            <View style={style.doFuncBtnsView}>
              <StaticTouchableNativeFeedback onPress={() => addEvent.changePass()}>
                <View style={[
                  style.doFuncBtnView,
                  { backgroundColor: [themeGreen, themeRed][paySell] },
                ]}>
                  <Text style={style.doFuncBtnText}>
                    {
                      ['买入', '卖出'][paySell]
                    }
                  </Text>
                </View>
              </StaticTouchableNativeFeedback>
            </View>
          </View>
        </View>
        {/* 数据列表区 */}
        <View style={style.contentRight}>
          {/* 标题 */}
          <View style={style.contentRightTitleView}>
            <Text style={style.contentRightTitleLeft}>价格</Text>
            <Text style={style.contentRightTitleRight}>手数(手)</Text>
          </View>
          {/* 数据 */}
          <ContractRightValueView
            USDTToRMB={USDTToRMB}
            getPrice={newPrice} />
        </View>
      </View>
      <ComLine />
      <ComTranscationView coinType={coinType} />
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  headView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 3,
    paddingLeft: 10,
    paddingRight: 10,
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
    zIndex: 2,
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


  // 主内容区
  content: {
    paddingTop: 10,
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    position: 'relative',
    zIndex: -1,
  },
  // 左侧操作区
  contentLeft: {
    flex: 3,
    paddingRight: 20,
    paddingTop: 5,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    height: 40,
    position: 'relative',
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
  // 数量
  priceSetValue: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: defaultThemeBgColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    position: 'relative',
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
    paddingTop: 5,
  },
  ratioThenText: {
    fontSize: 12,
    color: themeTextGray,
  },
  // 操作按钮
  doFuncBtnsView: {
    paddingTop: 5,
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
});

export default TransactionScreen;
