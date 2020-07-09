import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, StyleSheet, Image as StaticImage, Text, TouchableNativeFeedback as StaticTouchableNativeFeedback, ScrollView, Dimensions,
} from 'react-native';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import ComLayoutHead from '../../../components/layout/head';
import { useGoToWithLogin } from '../../../tools/routeTools';
import {
  themeWhite, themeGray, defaultThemeColor, defaultThemeBgColor,
} from '../../../config/theme';
import MarketSelfView from './self';
import { TypeMarketList, TypeMarketListLine } from './type';
import MarketListView from './list';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';
import Socket, { marketSocket } from '../../../data/fetch/socket';


const MarketScreen: FC = () => {
  const screenWidth = Math.round(Dimensions.get('screen').width);
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');

  const goToWithLogin = useGoToWithLogin();
  const headScrollRef = useRef<ScrollView>(null);
  const headScrollListRef = useRef<(View|null)[]>([]);
  const headScrollListWidthArr = useRef<number[]>([]);
  const contentScrollRef = useRef<ScrollView>(null);
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);

  // 头部列表
  const [headList, setHeadList] = useState<TypeMarketList[]>([]);
  const [selectHead, setSelectHead] = useState<TypeMarketList['id']>();
  // 显示数据列表
  const [dataView, setDataView] = useState<TypeMarketListLine[][]>([]);
  // 储存行情列表滚动事件左滑距离，控制滚动调用次数，优化显示
  const [dataScrollX, setDataScrollX] = useState(0);
  // 定义变量处理头部点击之后列表滚动事件和点击头部切换事件重复调用选中项闪烁
  const dataViewScrollIsClick = useRef(false);

  const addEvent = {
    // 前往页面
    goToLinkWithLogin: (link: string, params?: object) => goToWithLogin(link, params),
    // 点击头部切换
    headTabClick: (index: number, isScroll?: true) => {
      if (dataViewScrollIsClick.current) return;
      // 如果是不是滚动事件调用方法，调用视图滚动
      if (!isScroll) {
        contentScrollRef.current?.scrollTo({ x: index * screenWidth, y: 0 });
        // 点击事件调用当前方法，加锁，防止选中项闪烁
        dataViewScrollIsClick.current = true;
        const time = Math.abs((index - headList.map(item => item.id).indexOf(selectHead as string))) * 200;
        setTimeout(() => { dataViewScrollIsClick.current = false; }, time > 500 ? 500 : time);
      }
      let boxToLeft = 0;
      let boxWidth = 0;
      headScrollListWidthArr.current.forEach((width, listIndex) => {
        if (listIndex < index) boxToLeft += width;
        if (listIndex === index) boxWidth = width;
      });
      headScrollRef.current?.scrollTo({
        y: 0,
        x: boxToLeft + (boxWidth - screenWidth) / 2,
      });
      setSelectHead(headList[index].id);
    },
    // 列表滚动
    listViewScroll: (x: number) => {
      // 获取滚动页面的x
      const data = Math.round(x / screenWidth);
      if (data === dataScrollX) return;
      setDataScrollX(data);
      addEvent.headTabClick(data, true);
    },
    // 列表滚动结束后重新进行一次赋值
    onMomentumScrollEnd: (x: number) => {
      const data = Math.round(x / screenWidth);
      setDataScrollX(data);
      dataViewScrollIsClick.current = false;
      addEvent.headTabClick(data, true);
    },
    // 封装UI.measure
    promiseMeasure: (box: View|null): Promise<{x: number,
      y: number,
      width: number,
      height: number,
      pageX: number,
      pageY: number, }> => {
      return new Promise((resolve, reject) => {
        if (box === null) {
          reject(new Error('错误'));
        } else {
          box.measure((x, y, width, height, pageX, pageY) => {
            resolve({
              x, y, width, height, pageX, pageY,
            });
          });
        }
      });
    },
  };

  useEffect(() => {
    (async function dataFunc() {
      const result = [];
      for (let listIndex = 0, len = headScrollListRef.current.length; listIndex < len; listIndex++) {
        try {
          const item = headScrollListRef.current[listIndex];
          // eslint-disable-next-line no-await-in-loop
          const { width } = await addEvent.promiseMeasure(item);
          result.push(width);
        } catch (err) {
          console.log(err);
        }
      }
      headScrollListWidthArr.current = result;
    }());
  }, [headList]);

  useEffect(() => {
    setHeadList([
      {
        title: '自选', id: '1', showStyle: 0, listArrLinkId: 0,
      },
      {
        title: 'USDT合约', id: '2', showStyle: 1, listArrLinkId: 1,
      },
    ]);
    setDataView([
      [],
      [],
    ]);
    setSelectHead('1');
  }, []);

  useEffect(() => {
    const tickerImg = 'gold.market.ALL.ticker';
    const socketListener = (message: any) => {
      const resultData: {
        [key: string]: {
          [key: string]: string;
        };
      } = message.Tick;
      const result: TypeMarketListLine[] = Object.values(resultData).map(coin => {
        const close = parseFloat(coin.close);
        const open = parseFloat(coin.open);
        const range = Math.floor(((close - open) / open) * 10000) / 100;
        return {
          name: `${coin.symbol.replace('USDT', '')}/USDT 永续`,
          id: coin.symbol,
          priceUSDT: coin.close,
          priceRMB: coin.rmb_close,
          ratio: `${range}%`,
          volume: coin.quo,
        };
      });
      setDataView(state => {
        const res = [...state];
        res[1] = result;
        return res;
      });
    };
    if (routePage === 'Market') {
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
      if (subSocket.current) return;
      subSocket.current = true;
      socket.current.send(tickerImg, 'unsub');
      socket.current.removeListener(tickerImg);
    }
  }, [routePage]);

  return (
    <ComLayoutHead
      overScroll
      title="行情"
      leftComponent={(
        <StaticTouchableNativeFeedback onPress={() => addEvent.goToLinkWithLogin('MarketEdit')}>
          <View style={style.marketHeadIconView}>
            <StaticImage
              resizeMode="contain"
              style={style.marketHeadIcon}
              source={require('../../../assets/images/icons/market_edit.png')} />
          </View>
        </StaticTouchableNativeFeedback>
      )}
      rightComponent={(
        <StaticTouchableNativeFeedback onPress={() => addEvent.goToLinkWithLogin('MarketSearch')}>
          <View style={style.marketHeadIconView}>
            <StaticImage
              resizeMode="contain"
              style={style.marketHeadIcon}
              source={require('../../../assets/images/icons/market_search.png')} />
          </View>
        </StaticTouchableNativeFeedback>
      )}>
      <View style={style.marketHeadScrollOutBox}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          ref={headScrollRef}
          style={style.marketHeadScroll}>
          {
            headList.map((item, index) => (
              <TouchableNativeFeedback key={item.id} onPress={() => addEvent.headTabClick(index)}>
                <View
                  style={style.marketHeadScrollListBox}
                  ref={view => { headScrollListRef.current[index] = view; }}
                  onLayout={() => {}}>
                  <Text style={[
                    style.marketHeadScrollListText,
                    selectHead === item.id && style.marketHeadScrollListTextSelect,
                  ]}>
                    {item.title}
                  </Text>
                  {
                    selectHead === item.id && <View style={style.marketHeadScrollListLineSelect} />
                  }
                </View>
              </TouchableNativeFeedback>
            ))
          }
        </ScrollView>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        scrollEventThrottle={10}
        ref={contentScrollRef}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => addEvent.onMomentumScrollEnd(e.nativeEvent.contentOffset.x)}
        onScroll={e => addEvent.listViewScroll(e.nativeEvent.contentOffset.x)}
        style={style.contentScrollView}>
        {
          headList.map(item => {
            return (
              <ScrollView
                key={item.id}
                showsHorizontalScrollIndicator={false}
                style={[style.contentScrollViewInBox, { width: screenWidth }]}>
                {
                  item.showStyle === 0 && dataView[item.listArrLinkId] && <MarketSelfView data={dataView[item.listArrLinkId]} />
                }
                {
                  item.showStyle === 1 && dataView[item.listArrLinkId] && <MarketListView data={dataView[item.listArrLinkId]} />
                }
              </ScrollView>
            );
          })
        }
      </ScrollView>
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  marketHeadIconView: {
    padding: 10,
  },
  marketHeadIcon: {
    width: 18,
    height: 18,
  },
  marketHeadScrollOutBox: {
    height: 50,
  },
  marketHeadScroll: {
    backgroundColor: themeWhite,
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
  },
  marketHeadScrollListBox: {
    paddingLeft: 15,
    paddingRight: 15,
    height: 50,
    position: 'relative',
  },
  marketHeadScrollListText: {
    lineHeight: 50,
    height: 50,
    color: themeGray,
    fontSize: 15,
  },
  marketHeadScrollListTextSelect: {
    color: defaultThemeColor,
  },
  marketHeadScrollListLineSelect: {
    position: 'absolute',
    bottom: 1,
    left: '50%',
    height: 3,
    width: 30,
    backgroundColor: defaultThemeColor,
    borderRadius: 2,
  },
  contentScrollView: {
    flex: 1,
  },
  contentScrollViewInBox: {
  },
});

export default MarketScreen;
