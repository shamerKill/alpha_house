import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, TouchableNativeFeedback, Image, Text, StyleSheet, ScrollView, SafeAreaView, Platform,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import {
  themeMoreBlue, defaultThemeBgColor, getThemeOpacity, themeWhite, themeGreen, themeRed, themeGray, defaultThemeColor,
} from '../../../config/theme';
import ComLayoutHead from '../../../components/layout/head';
import ComLine from '../../../components/line';
import MarketKlineHtml from './echarts';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';
import Socket, { marketSocket } from '../../../data/fetch/socket';
import { biNumberToSymbol } from '../../../tools/number';
import formatTime from '../../../tools/time';

const MarketKlineInfo: FC = () => {
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  const route = useRoute<RouteProp<{markLine: { name: string }}, 'markLine'>>();
  const routeCoinType = route.params.name.split(' ')[0].replace('/', '');

  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  // USDT价格
  const [price, setPrice] = useState('--');
  // 人民币价格
  const [priceRMB, setPriceRMB] = useState('--');
  // 涨幅
  const [changeRatio, setChangeRatio] = useState('--');
  // 最高价
  const [heightPrice, setHeightPrice] = useState('--');
  // 最低价
  const [lowPrice, setLowPrice] = useState('--');
  // 24小时成交量
  const [dayValue, setDayValue] = useState('--');

  const getColor = () => [themeRed, themeGreen][Number(parseFloat(changeRatio) > 0)];

  useEffect(() => {
    const tickerImg = 'gold.market.ALL.ticker';
    const socketListener = (message: any) => {
      const coinInfo = message.Tick[routeCoinType];
      const close = parseFloat(coinInfo.close);
      const open = parseFloat(coinInfo.open);
      const range = Math.floor(((close - open) / open) * 10000) / 100;
      if (coinInfo) {
        setPrice(coinInfo.close);
        setPriceRMB(coinInfo.rmb_close);
        setChangeRatio(`${range}%`);
        setHeightPrice(coinInfo.height);
        setLowPrice(coinInfo.low);
        setDayValue(biNumberToSymbol(coinInfo.quo));
      }
    };
    if (routePage === 'MarketKline') {
      marketSocket.getSocket().then(ws => {
        socket.current = ws;
        ws.addListener(socketListener, tickerImg);
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
    return () => {
      if (socket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(tickerImg);
      }
    };
  }, [routePage]);

  return (
    <View style={style.infoView}>
      <View style={style.infoLeft}>
        <Text style={[
          style.infoPrice,
          { color: getColor() },
        ]}>
          {price}
        </Text>
        <Text style={style.infoLeftText}>
          <Text>&asymp;{priceRMB}CNY</Text>
          &nbsp;&nbsp;&nbsp;&nbsp;
          <Text style={{ color: getColor() }}>
            {changeRatio}
          </Text>
        </Text>
      </View>
      <View style={style.infoRight}>
        <View style={style.infoRightList}>
          <Text style={style.infoRightTitle}>{heightPrice}</Text>
          <Text style={style.infoRightDesc}>高</Text>
        </View>
        <View style={style.infoRightList}>
          <Text style={style.infoRightTitle}>{lowPrice}</Text>
          <Text style={style.infoRightDesc}>低</Text>
        </View>
        <View style={style.infoRightList}>
          <Text style={style.infoRightTitle}>{dayValue}</Text>
          <Text style={style.infoRightDesc}>24H</Text>
        </View>
      </View>
    </View>
  );
};

// 深度
const MarketKlineDepthView: FC = () => {
  type TypeList = {
    id: number|string;
    value: string;
    price: string;
  };
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  const route = useRoute<RouteProp<{markLine: { name: string }}, 'markLine'>>();
  const routeCoinType = route.params.name.split(' ')[0].replace('/', '');
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');

  // 买盘
  const [buyList, setBuyList] = useState<TypeList[]>([]);
  // 卖盘
  const [sellList, setSellList] = useState<TypeList[]>([]);
  // 最大数买盘0，卖盘1
  const [maxValue, setMaxValue] = useState(['', '']);
  // 显示数据买盘0,卖盘1
  const [showList, setShowList] = useState<[TypeList, TypeList][]>([]);

  // 根据买盘/卖盘更改显示数据
  useEffect(() => {
    // 更改最大数
    const maxV = [0, 0];
    if (buyList.length !== sellList.length) return;
    setShowList(buyList.map((item, index) => {
      // 在这里处理最大数更改
      const buyValue = parseFloat(item.value);
      const sellValue = parseFloat(sellList[index].value);
      if (buyValue > maxV[0]) maxV[0] = buyValue;
      if (sellValue > maxV[1]) maxV[1] = sellValue;
      // 在这里处理显示数据合并
      const result: [TypeList, TypeList] = [
        { ...item },
        { ...sellList[index] },
      ];
      return result;
    }));
    // 更改最大数
    setMaxValue(maxV.map(item => item.toString()));
  }, [buyList, sellList]);


  useEffect(() => {
    const tickerImg = `gold.market.${routeCoinType}.depth`;
    const socketListener = (message: any) => {
      setBuyList(message.buy.map((item: any, index: number) => ({
        price: item[0],
        value: item[1],
        id: index + 1,
      })));
      setSellList(message.sell.map((item: any, index: number) => ({
        price: item[0],
        value: item[1],
        id: index + 1,
      })));
    };
    if (routePage === 'MarketKline') {
      marketSocket.getSocket().then(ws => {
        socket.current = ws;
        ws.addListener(socketListener, tickerImg);
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
    return () => {
      if (socket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(tickerImg);
      }
    };
  }, [routePage]);

  return (
    <View style={style.logsView}>
      <View style={style.logsHead}>
        <Text style={[
          style.logsHeadText,
          { flex: 2 },
        ]}>
          买盘
        </Text>
        <Text style={[
          style.logsHeadText,
          { flex: 3, textAlign: 'left' },
        ]}>
          数量
        </Text>
        <Text style={[
          style.logsHeadText,
          { flex: 6 },
        ]}>
          价格(USDT)
        </Text>
        <Text style={[
          style.logsHeadText,
          { flex: 3, textAlign: 'right' },
        ]}>
          数量
        </Text>
        <Text style={[
          style.logsHeadText,
          { flex: 2 },
        ]}>
          卖盘
        </Text>
      </View>
      <View>
        {
          showList.map((item, index) => (
            <View key={index} style={style.logsListView}>
              <View style={style.logsListLeft}>
                <Text style={[
                  style.logsListText,
                  { color: themeGray, textAlign: 'center', flex: 2 },
                ]}>
                  {item[0].id}
                </Text>
                <Text style={[
                  style.logsListText,
                  { color: themeWhite, textAlign: 'left', flex: 3 },
                ]}>
                  {item[0].value}
                </Text>
                <Text style={[
                  style.logsListText,
                  { color: themeGreen, textAlign: 'right', flex: 3 },
                ]}>
                  {item[0].price}
                </Text>
                {/* 背景 */}
                <View style={[
                  style.logsBgView,
                  { right: 0, alignItems: 'flex-end' },
                ]}>
                  <View style={{
                    height: '100%',
                    backgroundColor: getThemeOpacity(themeGreen, 0.3),
                    width: `${(parseFloat(buyList?.[index]?.value) / parseFloat(maxValue[0])) * 100}%`,
                  }} />
                </View>
              </View>
              <View style={style.logsListRight}>
                <Text style={[
                  style.logsListText,
                  { color: themeRed, textAlign: 'left', flex: 3 },
                ]}>
                  {item[1].price}
                </Text>
                <Text style={[
                  style.logsListText,
                  { color: themeWhite, textAlign: 'right', flex: 3 },
                ]}>
                  {item[1].value}
                </Text>
                <Text style={[
                  style.logsListText,
                  { color: themeGray, textAlign: 'center', flex: 2 },
                ]}>
                  {item[1].id}
                </Text>
                {/* 背景 */}
                <View style={[
                  style.logsBgView,
                  { left: 0 },
                ]}>
                  <View style={{
                    height: '100%',
                    backgroundColor: getThemeOpacity(themeRed, 0.3),
                    width: `${(parseFloat(sellList?.[index]?.value) / parseFloat(maxValue[1])) * 100}%`,
                  }} />
                </View>
              </View>
            </View>
          ))
        }
      </View>
    </View>
  );
};

// 成交
const MarketKlineLogsView: FC = () => {
  type TypeLogsList = {
    time: string; // 时间
    price: string; // 价格
    number: string; // 数量
    type: 0|1; // 买0，卖1
  };

  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  const route = useRoute<RouteProp<{markLine: { name: string }}, 'markLine'>>();
  const routeCoinType = route.params.name.split(' ')[0].replace('/', '');
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');

  const [logsList, setLogsList] = useState<TypeLogsList[]>([]);

  useEffect(() => {
    const tickerImg = `gold.market.${routeCoinType}.deal`;
    const socketListener = (message: any) => {
      if (Array.isArray(message.Tick)) {
        setLogsList(message.Tick.map((item: any) => {
          return {
            time: formatTime('hh:mm:ss', item.ts),
            price: item.price,
            number: item.number,
            type: ({ buy: 0, sell: 1 } as any)[item.direction],
          };
        }));
      } else {
        setLogsList(state => {
          const result = [...state];
          result.shift();
          result.push({
            time: formatTime('hh:mm:ss', message.Tick.ts),
            price: message.Tick.price,
            number: message.Tick.number,
            type: ({ buy: 0, sell: 1 } as any)[message.Tick.direction],
          });
          return result;
        });
      }
    };
    if (routePage === 'MarketKline') {
      marketSocket.getSocket().then(ws => {
        socket.current = ws;
        ws.addListener(socketListener, tickerImg);
        ws.send(tickerImg, 'sub');
        ws.send(tickerImg, 'req');
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
    return () => {
      if (socket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(tickerImg);
      }
    };
  }, [routePage]);
  useEffect(() => {
    setLogsList([
      {
        time: '13:38:44', price: '0.546', number: '1187.00', type: 0,
      },
      {
        time: '13:38:44', price: '0.546', number: '1187.00', type: 1,
      },
      {
        time: '13:38:44', price: '0.546', number: '1187.00', type: 0,
      },
      {
        time: '13:38:44', price: '0.546', number: '1187.00', type: 0,
      },
      {
        time: '13:38:44', price: '0.546', number: '1187.00', type: 1,
      },
      {
        time: '13:38:44', price: '0.546', number: '1187.00', type: 0,
      },
      {
        time: '13:38:44', price: '0.546', number: '1187.00', type: 0,
      },
      {
        time: '13:38:44', price: '0.546', number: '1187.00', type: 0,
      },
      {
        time: '13:38:44', price: '0.546', number: '1187.00', type: 0,
      },
      {
        time: '13:38:44', price: '0.546', number: '1187.00', type: 0,
      },
    ]);
  }, []);
  return (
    <View>
      <View style={[
        style.logsHead,
        { paddingLeft: 10, paddingRight: 10 },
      ]}>
        <Text style={[
          style.logsHeadText,
          { flex: 3, textAlign: 'left' },
        ]}>
          时间
        </Text>
        <Text style={[
          style.logsHeadText,
          { flex: 4 },
        ]}>
          价格
        </Text>
        <Text style={[
          style.logsHeadText,
          { flex: 3, textAlign: 'right' },
        ]}>
          数量
        </Text>
      </View>
      <View style={{ paddingLeft: 10, paddingRight: 10 }}>
        {
          logsList.map((item, index) => (
            <View
              style={[
                style.logsListView,
                { alignItems: 'center' },
              ]}
              key={index}>
              <Text style={{ color: themeWhite, flex: 3 }}>
                {item.time}
              </Text>
              <Text style={{ color: [themeGreen, themeRed][item.type], flex: 4, textAlign: 'center' }}>
                {item.price}
              </Text>
              <Text style={{ color: themeWhite, flex: 3, textAlign: 'right' }}>
                {item.number}
              </Text>
            </View>
          ))
        }
      </View>
    </View>
  );
};

const MarketKlineBottom: FC = () => {
  // 显示底部列表深度0|成交1
  const [listType, setListType] = useState<0|1>(0);
  const addEvent = {
    changeListType: (type: typeof listType) => {
      if (type !== listType) setListType(type);
    },
  };
  return (
    // 列表
    <View style={style.listView}>
      <View style={style.tabView}>
        <TouchableNativeFeedback onPress={() => addEvent.changeListType(0)}>
          <View style={style.tabViewBtn}>
            <Text style={[
              style.tabViewText,
              listType === 0 && { color: defaultThemeColor },
            ]}>
              深度
            </Text>
            {
            listType === 0 && <View style={style.tabViewBgLine} />
          }
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => addEvent.changeListType(1)}>
          <View style={style.tabViewBtn}>
            <Text style={[
              style.tabViewText,
              listType === 1 && { color: defaultThemeColor },
            ]}>
              成交
            </Text>
            {
              listType === 1 && <View style={style.tabViewBgLine} />
            }
          </View>
        </TouchableNativeFeedback>
      </View>
      {
        [<MarketKlineDepthView />, <MarketKlineLogsView />][listType]
      }
    </View>
  );
};


const MarketKlineScreen: FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{marketLine: { name: string }}, 'marketLine'>>();

  const scrollView = useRef<ScrollView>(null);
  const scrollViewStart = useRef({ x: 0, y: 0 });

  // 页面是否可以滑动
  const [scrollViewIsScroll, setScrollViewIsScroll] = useState(true);

  const addEvent = {
    backPage: () => {
      navigation.goBack();
    },
    // android滑动处理
    scrollTouchStart: (x: number, y: number) => {
      if (Platform.OS === 'android') {
        scrollViewStart.current.x = x;
        scrollViewStart.current.y = y;
        setScrollViewIsScroll(false);
      }
    },
    scrollTouchMove: (x: number, y: number) => {
      if (Platform.OS === 'android') {
        const moveX = Math.abs(x - scrollViewStart.current.x);
        const moveY = Math.abs(y - scrollViewStart.current.y);
        if (moveY > moveX) setScrollViewIsScroll(true);
        else setScrollViewIsScroll(false);
      }
    },
    scrollTouchEnd: () => {
      if (Platform.OS === 'android') {
        setScrollViewIsScroll(true);
      }
    },
  };

  return (
    <ComLayoutHead
      close
      barStyleLight
      overScroll
      containerStyle={{ borderBottomWidth: 0 }}
      headBg={themeMoreBlue}
      scrollStyle={{ backgroundColor: themeMoreBlue }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* 头部 */}
        <View style={style.pageHead}>
          <TouchableNativeFeedback onPress={() => addEvent.backPage()}>
            <View style={style.headBackView}>
              <Image
                resizeMode="contain"
                style={style.headBackImg}
                source={require('../../../assets/images/icons/back_white.png')} />
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback>
            <View style={style.headTitleView}>
              <Image
                resizeMode="contain"
                style={style.headTitleIcon}
                source={require('../../../assets/images/icons/show_left_white.png')} />
              <Text style={style.headTitleText}>{route.params.name || ''}</Text>
            </View>
          </TouchableNativeFeedback>
        </View>
        <ScrollView
          ref={scrollView}
          style={style.scorllView}
          scrollEventThrottle={16}
          scrollEnabled={scrollViewIsScroll}
          onTouchStart={e => addEvent.scrollTouchStart(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          onTouchMove={e => addEvent.scrollTouchMove(e.nativeEvent.pageX, e.nativeEvent.pageY)}
          onTouchEnd={() => addEvent.scrollTouchEnd()}>
          {/* 数据内容 */}
          <MarketKlineInfo />
          <ComLine color={getThemeOpacity(themeGreen, 0.1)} />
          {/* 图表 */}
          <MarketKlineHtml style={{ height: 430 }} />
          <ComLine color={getThemeOpacity(themeGreen, 0.1)} />
          {/* 列表 */}
          <MarketKlineBottom />
        </ScrollView>
        {/* 买入/卖出 */}
        <View style={style.bottomBtnsView}>
          <View style={[
            style.bottomBtn,
            { backgroundColor: themeGreen },
          ]}>
            <Text style={style.bottomBtnText}>买入</Text>
          </View>
          <View style={[
            style.bottomBtn,
            { backgroundColor: themeRed },
          ]}>
            <Text style={style.bottomBtnText}>卖出</Text>
          </View>
        </View>
      </SafeAreaView>
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  pageHead: {
    flexDirection: 'row',
    borderBottomColor: getThemeOpacity(defaultThemeBgColor, 0.2),
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headBackView: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headBackImg: {
    width: 20,
    height: 20,
  },
  headTitleView: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    flex: 1,
  },
  headTitleIcon: {
    height: 20,
    width: 20,
  },
  headTitleText: {
    color: themeWhite,
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  scorllView: {
    flex: 1,
  },
  // 数据信息
  infoView: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLeft: {},
  infoPrice: {
    fontWeight: 'bold',
    fontSize: 24,
    paddingBottom: 5,
  },
  infoLeftText: {
    fontSize: 16,
    color: themeGray,
  },
  infoRight: {},
  infoRightList: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    marginBottom: 5,
  },
  infoRightTitle: {
    fontSize: 12,
    color: themeGray,
  },
  infoRightDesc: {
    fontSize: 12,
    width: 40,
    textAlign: 'right',
    color: getThemeOpacity(themeGray, 0.6),
  },
  // 列表view
  listView: {
    height: 400,
  },
  // 列表tab
  tabView: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: getThemeOpacity(themeGreen, 0.1),
  },
  tabViewBtn: {
    position: 'relative',
    width: 80,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabViewText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: getThemeOpacity(themeWhite, 0.6),
  },
  tabViewBgLine: {
    width: 20,
    height: 2,
    backgroundColor: defaultThemeColor,
    position: 'absolute',
    bottom: 0,
  },
  // 底部按钮
  bottomBtnsView: {
    backgroundColor: themeMoreBlue,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 5,
    paddingBottom: 5,
  },
  bottomBtn: {
    width: '45%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  bottomBtnText: {
    color: themeWhite,
    fontSize: 16,
  },

  // 数据列表
  logsView: {
  },
  logsHead: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  logsHeadText: {
    color: themeGray,
    textAlign: 'center',
  },
  logsListView: {
    flexDirection: 'row',
    height: 30,
  },
  logsListLeft: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
    paddingRight: 5,
    alignItems: 'center',
  },
  logsListRight: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
    paddingLeft: 5,
    alignItems: 'center',
  },
  logsListText: {
  },
  logsBgView: {
    position: 'absolute',
    height: '100%',
    width: '80%',
    top: 0,
    zIndex: -1,
  },
});

export default MarketKlineScreen;
