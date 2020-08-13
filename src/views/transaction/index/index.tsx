import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, StyleSheet, Image, Text, Animated, SafeAreaView, TouchableNativeFeedback as StaticTouchableNativeFeedback, ActivityIndicator,
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
import { numberToFormatString } from '../../../tools/number';
import showComAlert from '../../../components/modal/alert';
import ajax from '../../../data/fetch';
import { TypeOrderList } from './type';
import ComLayoutHead from '../../../components/layout/head';
import ComFormButton from '../../../components/form/button';

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

// 委托列表
const OrderListView: FC<{
  data: TypeOrderList,
  backOrder?: (id: TypeOrderList['id']) => void;
  coinType: string;
}> = ({ data, backOrder, coinType }) => {
  return (
    <View style={{
      borderBottomWidth: 1,
      borderBottomColor: defaultThemeBgColor,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
        }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              paddingBottom: 5,
              paddingTop: 5,
              color: [themeRed, themeGreen][data.type],
            }}>
            {['买入', '卖出'][data.type]}
          </Text>
          <Text style={{
            paddingBottom: 5,
            paddingTop: 5,
            fontSize: 12,
            color: themeGray,
            paddingLeft: 10,
          }}>
            {data.time}
          </Text>
        </View>
        {
          data.status === 0 ? (
            <ComFormButton
              containerStyle={{
                width: 80,
                height: 24,
                padding: 0,
                marginTop: 5,
              }}
              style={{
                height: 24,
                padding: 0,
              }}
              fontStyle={{
                lineHeight: 20,
                padding: 0,
                fontSize: 14,
              }}
              onPress={() => {
                backOrder && backOrder(data.id);
              }}
              title="撤销" />
          ) : (
            <Text style={{ color: themeGray, fontSize: 12 }}>
              {
                ['未成交', '已撤销', '部分成交', '完全成交'][data.status]
              }
            </Text>
          )
        }
      </View>
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 10,
        paddingBottom: 10,
      }}>
        {
          data.status === 0 || data.status === 1 ? (
            <View style={{
              width: '50%',
              paddingBottom: 10,
            }}>
              <Text style={{ fontSize: 16 }}>{data.willPrice}</Text>
              <Text style={{ fontSize: 14, color: themeGray }}>委托价格(USDT)</Text>
            </View>
          ) : (
            <View style={{
              width: '50%',
              paddingBottom: 10,
            }}>
              <Text style={{ fontSize: 16 }}>{data.doPrice}</Text>
              <Text style={{ fontSize: 14, color: themeGray }}>成交均价(USDT)</Text>
            </View>
          )
        }
        {
          data.status === 0 || data.status === 1 ? (
            <View style={{
              width: '50%',
              paddingBottom: 10,
            }}>
              <Text style={{ fontSize: 16 }}>{data.willValue}</Text>
              <Text style={{ fontSize: 14, color: themeGray }}>委托数量({coinType.replace('USDT', '')})</Text>
            </View>
          ) : (
            <View style={{
              width: '50%',
              paddingBottom: 10,
            }}>
              <Text style={{ fontSize: 16 }}>{data.doValue}</Text>
              <Text style={{ fontSize: 14, color: themeGray }}>成交数量({coinType.replace('USDT', '')})</Text>
            </View>
          )
        }
        {
          data.status === 0 || data.status === 1 ? (
            <View style={{
              width: '50%',
              paddingBottom: 10,
            }}>
              <Text style={{ fontSize: 16 }}>{data.doValue}</Text>
              <Text style={{ fontSize: 14, color: themeGray }}>成交数量({coinType.replace('USDT', '')})</Text>
            </View>
          ) : (
            <View style={{
              width: '50%',
              paddingBottom: 10,
            }}>
              <Text style={{ fontSize: 16 }}>{data.fee}</Text>
              <Text style={{ fontSize: 14, color: themeGray }}>手续费(USDT)</Text>
            </View>
          )
        }
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
  positionOrders: TypeOrderList[];
  // 历史成交单
  entrustOrders: TypeOrderList[];
  // 历史委托
  historyOrders: TypeOrderList[];
};

const ContractUSDTScreen: FC = () => {
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const navigation = useNavigation();
  const goToWithLogin = useGoToWithLogin();
  const [userIsLogin] = useGetDispatch<InState['userState']['userIsLogin']>('userState', 'userIsLogin');
  const [userInfo] = useGetDispatch<InState['userState']['userInfo']>('userState', 'userInfo');
  let { params: routeParams } = useRoute<RouteProp<{constract: { contractType: 0|1|2; coinType: string; }}, 'constract'>>();
  if (!routeParams) routeParams = { contractType: 0, coinType: '' };

  const fixedValueRef = useRef<TextInput&{blur:() => void}>(null);
  // 币种类型
  const [coinType, setCoinType] = useState(routeParams.coinType.replace(/\/+/g, ''));
  const coinTypeRef = useRef(coinType);

  useEffect(() => {
    setCoinType(routeParams.coinType.replace(/\/+/g, ''));
  }, [routeParams]);

  // 账户信息
  // 持有USDT
  const [assetsUsdt, setAssetsUsdt] = useState('');
  // 持有币种
  const [assetsCoin, setAssetsCoin] = useState('');

  const [backLoading, setBackLoading] = useState(false);

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
    historyOrders: [],
  });

  // 当前币种数据
  const [nowCoinInfo, setNowCoinInfo] = useState<TypeAllCoinInfo>({ ...defaultCoinListInfo.current });

  // 委托请求loading
  const [loading, setLoading] = useState(false);

  // 获取用户信息判断
  const getUserInfoMem = useRef(0);

  const addEvent = {
    // 获取当前用户信息
    fetchUserInfo: (nowCoinType: string) => {
      if (!userIsLogin) return;
      getUserInfoMem.current += 1;
      const memData = getUserInfoMem.current;
      ajax.get(`/coin/api/v1/coin/get_coin_balance?symbol=${nowCoinType.replace('USDT', '')}`).then(data => {
        if (memData === getUserInfoMem.current) {
          if (data.status === 200) {
            setAssetsCoin(`${data.data}`);
          }
        }
      }).catch(err => {
        console.log(err);
      });
      ajax.get('/coin/api/v1/coin/get_coin_balance?symbol=USDT').then(data => {
        if (memData === getUserInfoMem.current) {
          if (data.status === 200) {
            setAssetsUsdt(`${parseFloat(parseFloat(data.data).toFixed(2))}`);
          }
        }
      }).catch(err => {
        console.log(err);
      });
    },
    // 获取当前委托数据
    fetchPostionsOrders: (nowCoinType: string) => {
      if (!nowCoinType) return;
      if (nowCoinType !== nowCoinInfo.symbol) {
        setCoinListInfo(state => {
          let newState = [...state];
          newState = newState.map(item => {
            return {
              ...item,
              positionOrders: [],
            };
          });
          return newState;
        });
      }
      ajax.get(`/coin/api/v1/coin/hold_log?symbol=${nowCoinType.replace('USDT', '')}&base=USDT`).then(data => {
        if (data.status === 200 && data.data && data.data.length) {
          const result: TypeOrderList[] = data.data.map((item: any) => {
            return {
              id: item.id,
              type: item.type === 'BUY' ? 0 : 1,
              status: (() => {
                if (item.status === 1) return 0;
                if (item.status === 2) return 3;
                if (item.status === 4) return 1;
                return 2;
              })(),
              willPrice: item.price,
              willValue: item.num,
              doPrice: '--',
              doValue: item.deal_num,
              time: item.create_time,
            };
          });
          setCoinListInfo(state => {
            let newState = [...state];
            newState = newState.map(item => {
              return {
                ...item,
                positionOrders: result,
              };
            });
            return newState;
          });
        }
      }).catch(err => {
        console.log(err);
      });
    },
    // 获取历史成交数据
    fetchEntrustOrders: (nowCoinType: string) => {
      if (!nowCoinType) return;
      if (nowCoinType !== nowCoinInfo.symbol) {
        setCoinListInfo(state => {
          let newState = [...state];
          newState = newState.map(item => {
            return {
              ...item,
              entrustOrders: [],
            };
          });
          return newState;
        });
      }
      ajax.get(`/coin/api/v1/coin/deal_log?symbol=${nowCoinType.replace('USDT', '')}&base=USDT&page=1`).then(data => {
        if (data.status === 200 && data.data && data.data.length) {
          const result: TypeOrderList[] = data.data.map((item: any) => {
            return {
              id: item.entrust_id,
              type: item.type === 'BUY' ? 0 : 1,
              status: 3,
              willPrice: item.price,
              willValue: item.num,
              doPrice: item.price,
              doValue: item.hands,
              time: item.create_time,
              fee: item.fee,
            };
          });
          setCoinListInfo(state => {
            let newState = [...state];
            newState = newState.map(item => {
              return {
                ...item,
                entrustOrders: result,
              };
            });
            return newState;
          });
        }
      }).catch(err => {
        console.log(err);
      });
    },
    // 获取历史委托数据
    fetchHistoryOrders: (nowCoinType: string) => {
      if (!nowCoinType) return;
      if (nowCoinType !== nowCoinInfo.symbol) {
        setCoinListInfo(state => {
          let newState = [...state];
          newState = newState.map(item => {
            return {
              ...item,
              historyOrders: [],
            };
          });
          return newState;
        });
      }
      ajax.get(`/coin/api/v1/coin/trust_log?symbol=${nowCoinType.replace('USDT', '')}&base=USDT`).then(data => {
        if (data.status === 200 && data.data && data.data.length) {
          const result: TypeOrderList[] = data.data.map((item: any) => {
            return {
              id: item.id,
              type: item.type === 'BUY' ? 0 : 1,
              status: (() => {
                if (item.status === 1) return 0;
                if (item.status === 2) return 3;
                if (item.status === 4) return 1;
                return 2;
              })(),
              willPrice: item.price,
              willValue: item.num,
              doPrice: '--',
              doValue: item.deal_num,
              time: item.create_time,
            };
          });
          setCoinListInfo(state => {
            let newState = [...state];
            newState = newState.map(item => {
              return {
                ...item,
                historyOrders: result,
              };
            });
            return newState;
          });
        }
      }).catch(err => {
        console.log(err);
      });
    },
    // 撤销当前委托订单
    backOrder: (id: string|number) => {
      if (backLoading) return;
      setBackLoading(true);
      ajax.get(`/coin/api/v1/coin/cancel?id=${id}`).then(data => {
        if (data.status === 200) {
          showMessage({
            position: 'bottom',
            message: '撤销成功',
            type: 'success',
          });
          addEvent.fetchUserInfo(nowCoinInfo.symbol);
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
        setBackLoading(false);
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
    // 订单提交弹窗0买入，1卖出
    submitVerfiy: (type: 0|1) => {
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
      // 检查数量
      let changeValue = parseFloat(fixedValue);
      // 如果是百分比
      if (/%$/.test(fixedValue)) {
        // 如果是买
        if (type === 0) {
          if (fixedValue === '100%') changeValue = parseFloat(assetsUsdt);
          else changeValue = (changeValue / 100) * parseFloat(assetsUsdt);
        } else if (type === 1) {
          if (fixedValue === '100%') changeValue = parseFloat(assetsCoin);
          else changeValue = (changeValue / 100) * parseFloat(assetsCoin);
        }
      }
      if (Number.isNaN(changeValue)) {
        showMessage({
          position: 'bottom',
          message: '输入数量有误，请检查',
          type: 'warning',
        });
        return;
      }
      if (changeValue === 0) {
        showMessage({
          position: 'bottom',
          message: `您未持有${['USDT', coinType.replace('USDT', '')][type]}，如仍要交易，请前往资产划转`,
          type: 'warning',
        });
        return;
      }
      // 价格检查
      if (!isMarketPrice) {
        // 如果不是市价，判断价格
        if (Number.isNaN(parseFloat(fixedPrice)) || parseFloat(fixedPrice) === 0) {
          showMessage({
            position: 'bottom',
            message: '输入价格有误，请检查',
            type: 'warning',
          });
          return;
        }
      }
      addEvent.submitAlert(type, changeValue.toString()).then(data => {
        if (data) addEvent.submitOrder(type, changeValue.toString());
      });
    },
    // 订单提示
    submitAlert: (type: 0|1, changeValue: string): Promise<boolean> => {
      const showTextArr = [
        // 开多
        [themeGreen, `买入价值${changeValue}USDT的`],
        [themeRed, `卖出价值${changeValue}USDT的`],
      ];
      return new Promise(resolve => {
        const close = showComAlert({
          title: [`买入${coinType.replace('USDT', '')}`, `卖出${coinType.replace('USDT', '')}`][type],
          desc: (
            <Text>
              确定以
              <Text style={{ color: defaultThemeColor }}>{isMarketPrice ? '市价' : `限价${fixedPrice}USDT`}</Text>
              <Text style={{ color: showTextArr[type][0] }}>{showTextArr[type][1]}</Text>{coinType.replace('USDT', '')}？
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
    // 提交订单0买入，1卖出
    submitOrder: (type: 0|1, changeValue: string) => {
      if (loading) return;
      if (type === 0) {
        changeValue = (parseFloat(changeValue) / parseFloat(fixedPrice)).toFixed(8);
      }
      setLoading(true);
      ajax.post('/coin/api/v1/coin/trade', {
        base: 'USDT',
        symbol: coinType.replace('USDT', ''),
        num: parseFloat(changeValue),
        side: ['BUY', 'SELL'][type],
        type: ['LIMIT', 'MARKET'][Number(isMarketPrice)],
        price: parseFloat(fixedPrice),
      }).then(data => {
        if (data.status !== 200) {
          showMessage({
            position: 'bottom',
            message: data.message,
            type: 'warning',
          });
        } else {
          showMessage({
            position: 'bottom',
            message: '现货委托单已提交',
            type: 'success',
          });
          setFixedPrice('');
          setFixedValueRatio(0);
          setFixedValue('');
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        setLoading(false);
      });
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
  useEffect(() => {
    addEvent.fetchUserInfo(nowCoinInfo.symbol);
  }, [nowCoinInfo.symbol]);

  // 根据当前币种信息更改数据
  useEffect(() => {
    if (logSelectTab === 0) {
      addEvent.fetchPostionsOrders(coinTypeRef.current);
    } else if (logSelectTab === 1) {
      addEvent.fetchEntrustOrders(coinTypeRef.current);
    } else if (logSelectTab === 2) {
      addEvent.fetchHistoryOrders(coinTypeRef.current);
    }
  }, [coinType, logSelectTab]);

  // 根据币种/开仓平仓更改，进行数据初始化
  useEffect(() => {
    setFixedPrice('');
    setFixedValue('');
    setFixedValueRatio(0);
  }, [coinType]);

  // 监听订单更改
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  useEffect(() => {
    if (!userInfo.token) return;
    const ticker = 'cash.market.ALL.account';
    const tickerImg = `${ticker}.${userInfo.token}`
    const socketListener = () => {
      if (logSelectTabRef.current === 0) addEvent.fetchPostionsOrders(coinTypeRef.current);
      else if (logSelectTabRef.current === 1) addEvent.fetchEntrustOrders(coinTypeRef.current);
      else if (logSelectTabRef.current === 2) addEvent.fetchHistoryOrders(coinTypeRef.current);
      addEvent.fetchUserInfo(nowCoinInfo.symbol);
    };
    if (routePage === routeName) {
      // 获取币币订单
      CoinToCoinSocket.getSocket().then(ws => {
        socket.current = ws;
        ws.addListener(socketListener, ticker);
        ws.send(tickerImg, 'sub');
        subSocket.current = false;
      }).catch(err => {
        console.log(err);
      });
    } else if (socket.current) {
      if (subSocket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(tickerImg);
      }
    }
  }, [routePage]);

  useEffect(() => {
    if (fixedValueRatio === 0) {
      setFixedValue('');
    } else {
      setFixedValue(`${fixedValueRatio}%`);
      if (fixedValueRef.current?.blur) fixedValueRef.current?.blur();
    }
  }, [fixedValueRatio]);


  return (
    <ComLayoutHead
      close
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
            userIsLogin ? (
              <Text>现货交易</Text>
            ) : (
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
                    placeholder={`数量(${coinType.replace('USDT', '')})`}
                    ref={fixedValueRef} />
                </View>
                {/* 滚动条 */}
                <ComSliderView
                  fixedValueRatio={fixedValueRatio}
                  setFixedValueRatio={setFixedValueRatio} />
                {/* 更多信息 */}
                <View style={style.ratioThenTextView}>
                  <Text style={style.ratioThenText}>持有USDT</Text>
                  <Text style={style.ratioThenText}>{assetsUsdt}</Text>
                </View>
                <View style={style.ratioThenTextView}>
                  <Text style={style.ratioThenText}>持有{coinType.replace('USDT', '')}</Text>
                  <Text style={style.ratioThenText}>{assetsCoin}</Text>
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
                  { loading && <ActivityIndicator color={themeWhite} /> }
                </View>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback onPress={() => addEvent.submitVerfiy(1)}>
                <View style={[
                  style.doFuncBtnView,
                  { backgroundColor: themeRed },
                ]}>
                  <Text style={style.doFuncBtnText}>卖出</Text>
                  { loading && <ActivityIndicator color={themeWhite} /> }
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
                ['当前委托', '历史成交', '历史委托'].map((item, index) => (
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
          {/* 当前委托 */}
          {
            logSelectTab === 0
            && (
              nowCoinInfo.positionOrders.map(item => (
                <OrderListView
                  key={item.id}
                  data={item}
                  backOrder={addEvent.backOrder}
                  coinType={coinType} />
              ))
            )
          }
          {/* 历史成交 */}
          {
            logSelectTab === 1
            && (
              nowCoinInfo.entrustOrders.map(item => (
                <OrderListView
                  key={item.id}
                  data={item}
                  coinType={coinType} />
              ))
            )
          }
          {/* 历史委托 */}
          {
            logSelectTab === 2
            && (
              nowCoinInfo.historyOrders.map(item => (
                <OrderListView
                  key={item.id}
                  data={item}
                  backOrder={addEvent.backOrder}
                  coinType={coinType} />
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
    paddingBottom: 20,
    marginBottom: 60,
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
    flexDirection: 'row',
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
