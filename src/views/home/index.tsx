import React, {
  FC, useState, useEffect, useRef, useCallback,
} from 'react';
import {
  View, Text, Image, ImageSourcePropType, ScrollViewProps, Dimensions, Platform,
} from 'react-native';
import { TouchableNativeFeedback, ScrollView } from 'react-native-gesture-handler';
import Swiper from 'react-native-swiper';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import {
  themeRed, themeGreen, themeBlack, themeGray,
} from '../../config/theme';
import homeStyle from './index.style';
import { positiveNumber, numberToFormatString } from '../../tools/number';
import ComLine from '../../components/line';
import ComLayoutHead from '../../components/layout/head';
import useGetDispatch from '../../data/redux/dispatch';
import { InState, ActionsType } from '../../data/redux/state';
import ajax from '../../data/fetch';
import { TypeNotice } from '../../data/@types/baseList';
import { useGoToWithLogin } from '../../tools/routeTools';
import Socket, { marketSocket, CoinToCoinSocket } from '../../data/fetch/socket';

// 头部
const HomeScreenHead: FC = () => {
  const navitaion = useNavigation();
  const [userIsLogin] = useGetDispatch<InState['userState']['userIsLogin']>('userState', 'userIsLogin');
  const searchImg = require('../../assets/images/icons/search.png');
  const commentsImg = require('../../assets/images/icons/comments.png');
  const gotoWithLogin = useGoToWithLogin();
  const gotoWithLoginDispatch = useGoToWithLogin(true);
  // 点击搜索按钮
  const searchBtn = () => gotoWithLoginDispatch('MarketSearch');
  // 点击公告按钮
  const commentBtn = () => gotoWithLogin('HomeNewsList');
  return (
    <View style={homeStyle.homeHead}>
      {
        userIsLogin ? (
          <Text style={homeStyle.homeHeadText}>
            欢迎来到ALFAEX
          </Text>
        ) : (
          <View style={{ flex: 1 }}>
            <TouchableNativeFeedback onPress={() => {
              navitaion.navigate('Login');
            }}>
              <Text style={{
                fontWeight: 'bold',
                fontSize: 20,
                lineHeight: 40,
                color: themeBlack,
              }}>
                未登录
              </Text>
            </TouchableNativeFeedback>
          </View>
        )
      }
      <TouchableNativeFeedback
        onPress={searchBtn}>
        <Image
          resizeMode="contain"
          style={homeStyle.homeHeadSearch}
          source={searchImg} />
      </TouchableNativeFeedback>
      <TouchableNativeFeedback
        onPress={commentBtn}>
        <Image
          resizeMode="contain"
          style={homeStyle.homeHeadComments}
          source={commentsImg} />
      </TouchableNativeFeedback>
    </View>
  );
};

// banner
const HomeScreenBanner: FC = () => {
  const [bannerState, dispatchBannerState] = useGetDispatch<InState['imageState']['banner']>('imageState', 'banner');
  // 轮播图
  const [banner, setBanner] = useState<InState['imageState']['banner']>(bannerState);
  // 读秒
  const swiperTime = 4;
  useEffect(() => {
    ajax.get<{address: string; id: number; link: string;}[]>('/v1/index/rotation').then(data => {
      if (data.status === 200) {
        if (data.data) {
          const result = data.data.map(item => ({
            source: { uri: item.address },
            id: item.id,
            link: item.link,
          }));
          setBanner(result);
          dispatchBannerState({
            type: ActionsType.CHANGE_BANNER,
            data: result,
          });
        }
      }
    }).catch(err => {
      console.log(err);
    });
  }, []);
  return (
    <View style={homeStyle.banner}>
      {
        banner.length
          ? (
            <Swiper
              autoplay
              autoplayTimeout={swiperTime}
              paginationStyle={homeStyle.bannerSlideBottom}
              dotStyle={homeStyle.bannerSlideBottomDotStyle}
              activeDotStyle={homeStyle.bannerSlideBottomActiveDotStyle}>
              {
                banner.map(item => (
                  <View style={homeStyle.bannerSlide} key={item.id}>
                    <Image resizeMode="stretch" style={homeStyle.bannerSlideImage} source={item.source} fadeDuration={0} />
                  </View>
                ))
              }
            </Swiper>
          ) : <View />
      }
    </View>
  );
};

// 公告
const HomeScreenComment: FC = () => {
  // 公告
  const [comments, setComments] = useState<TypeNotice[]>([]);
  // 读秒
  const swiperTime = 5;
  // 点击
  const commitClick = (id: string) => {
    console.log(id);
  };
  useEffect(() => {
    ajax.get('/v1/article/article_list?types=1').then(data => {
      if (data.status === 200) {
        if (data.data) {
          const result = Object.values(data.data).map((item: any) => ({
            title: item.list.title,
            id: item.list.id,
          }));
          setComments(result);
        }
      }
    }).catch((err) => {
      console.log(err);
    });
  }, []);
  return (
    <View style={homeStyle.commentView}>
      <Image
        style={homeStyle.commentIcon}
        resizeMode="contain"
        source={require('../../assets/images/icons/comments.png')} />
      {
        comments.length
          ? (
            <Swiper
              autoplay
              horizontal={false}
              scrollEnabled={false}
              showsPagination={false}
              autoplayTimeout={swiperTime}>
              {
                comments.map(item => (
                  <TouchableNativeFeedback key={item.id} onPress={() => commitClick(item.id)}>
                    <View style={homeStyle.commentView}>
                      <Text style={homeStyle.commentText}>{ item.title }</Text>
                    </View>
                  </TouchableNativeFeedback>
                ))
              }
            </Swiper>
          ) : <View />
      }
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
        style={homeStyle.commentShadow} />
    </View>
  );
};

// 横向行情列表
type TypeHomeRowMarketValue = { keyV: string; price: string; range: string; type: string; };
const HomeScreenRowMarketBlock: FC<{ value: TypeHomeRowMarketValue; }> = ({ value }) => {
  const navigation = useNavigation();
  const toContract = useCallback(() => {
    const coinType = value.keyV.split(' ')[0].replace('/', '');
    if (coinType) {
      navigation.navigate('Contract', { contractType: 0, coinType });
    }
  }, []);
  return (
    <TouchableNativeFeedback onPress={() => toContract()}>
      <View style={homeStyle.marketBlock}>
        <Text style={homeStyle.marketBlockKey}>{value.keyV}</Text>
        <Text style={{
          ...homeStyle.marketBlockPrice,
          color: positiveNumber(value.range) ? themeGreen : themeRed,
        }}>
          {value.price}
        </Text>
        <Text style={{
          ...homeStyle.marketBlockRange,
          color: positiveNumber(value.range) ? themeGreen : themeRed,
        }}>
          {value.range}
        </Text>
        <Text style={homeStyle.marketBlockType}>{value.type}</Text>
      </View>
    </TouchableNativeFeedback>
  );
};
const HomeScreenRowMarket: FC = () => {
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  // 中部行情
  const [marketBlock, setMarketBlock] = useState<TypeHomeRowMarketValue[]>([]);
  const pugWidth = 100;
  const dotWidth = 40;
  // const dotWidth = value.length ? (3 / value.length) * 100 : 0;
  const changeWidth = pugWidth - dotWidth;
  const [dotLeft, setDotLeft] = useState(0);
  const scrollEvent: ScrollViewProps['onScroll'] = event => {
    let range = event.nativeEvent.contentOffset.x
      / (
        event.nativeEvent.contentSize.width
        - event.nativeEvent.layoutMeasurement.width
      );
    if (range > 1) range = 1;
    if (range < 0) range = 0;
    setDotLeft(changeWidth * range);
  };
  useEffect(() => {
    const tickerImg = 'gold.market.ALL.ticker';
    const socketListener = (message: any) => {
      const resultData: {
        [key: string]: {
          close: string;
          open: string;
          symbol: string;
        }
      } = message.Tick;
      const result = Object.values(resultData || {}).map(coin => {
        const close = parseFloat(coin.close);
        const open = parseFloat(coin.open);
        const range = Math.floor(((close - open) / open) * 10000) / 100;
        return {
          keyV: `${coin.symbol.replace('USDT', '')}/USDT 永续`,
          price: coin.close,
          range: `${range}%`,
          type: 'USDT合约',
        };
      });
      setMarketBlock(result);
    };
    if (routePage === 'Home') {
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
    <View style={homeStyle.marketSwiper}>
      <ScrollView
        horizontal
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onScroll={scrollEvent}
        style={homeStyle.marketScroll}>
        {
          marketBlock.map(item => (
            <HomeScreenRowMarketBlock value={item} key={item.keyV} />
          ))
        }
      </ScrollView>
      <View style={{
        ...homeStyle.marketSwiperPug,
        width: pugWidth,
      }}>
        <View style={{
          ...homeStyle.marketSwiperDot,
          width: dotWidth,
          marginLeft: dotLeft,
        }} />
      </View>
    </View>
  );
};

// nav列表
type TypeHomeNavProp = {pic: ImageSourcePropType, link: string} | null;
const HomeScreenNav: FC<{ adv: TypeHomeNavProp }> = ({ adv }) => {
  const navigation = useNavigation();
  const goTolink = (link: string) => {
    if (link) navigation.navigate(link);
    else {
      showMessage({
        position: 'bottom',
        message: '功能开发中',
        type: 'info',
      });
    }
  };
  return (
    <View>
      <View style={homeStyle.navListViewBtns}>
        <TouchableNativeFeedback onPress={() => goTolink('HomeHelpList')} style={{ flex: 1 }}>
          <View style={homeStyle.navBtnView}>
            <Image style={homeStyle.navBtnImage} source={require('../../assets/images/icons/help_center.png')} />
            <Text style={homeStyle.navBtnText}>帮助中心</Text>
            <Image
              style={homeStyle.navBtnBg}
              resizeMode="stretch"
              source={require('../../assets/images/pic/btn_bg_shadow.png')} />
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback style={{ flex: 1 }}>
          <View style={homeStyle.navBtnView}>
            <Image style={homeStyle.navBtnImage} source={require('../../assets/images/icons/fund.png')} />
            <Text style={homeStyle.navBtnText}>基金</Text>
            <Image
              style={homeStyle.navBtnBg}
              resizeMode="stretch"
              source={require('../../assets/images/pic/btn_bg_shadow.png')} />
          </View>
        </TouchableNativeFeedback>
      </View>
      { adv?.pic
        && (
          <TouchableNativeFeedback onPress={() => goTolink(adv.link)}>
            <Image resizeMode="contain" style={homeStyle.navBtnAdv} source={adv.pic} />
          </TouchableNativeFeedback>
        )}
    </View>
  );
};

// 行情列表
type TypeHomeScreenMarketLine = {
  coin: string; // 币种
  unit: string; // 单位
  count: string; // 成交量
  price: string; // 价格
  rmbPrice: string; // 人民币价格
  range: string; // 涨跌幅
  id: string; // 唯一值
};
const HomeScreenMarketLine: FC<TypeHomeScreenMarketLine> = ({
  coin, unit, count, price, rmbPrice, range,
}) => {
  return (
    <View style={homeStyle.marketViewList}>
      <View style={{ width: '30%' }}>
        <View>
          <Text>
            <Text style={{ color: themeBlack, fontWeight: 'bold', fontSize: 18 }}>{coin}</Text>
            <Text style={{ color: themeGray }}>/{unit}</Text>
          </Text>
        </View>
        <Text style={{ color: themeGray, fontSize: 12 }}>24h&nbsp;&nbsp;&nbsp;{count}</Text>
      </View>
      <View style={{ width: '30%', alignItems: 'center' }}>
        <Text style={{ color: themeBlack, fontWeight: 'bold', fontSize: 16 }}>{price}</Text>
        <Text style={{ color: themeGray, fontSize: 12 }}>&yen;{rmbPrice}</Text>
      </View>
      <Text style={{
        width: '30%',
        fontSize: 18,
        fontWeight: 'bold',
        color: positiveNumber(range) ? themeGreen : themeRed,
        textAlign: 'right',
      }}>
        {range}
      </Text>
    </View>
  );
};
const HomeScreenMarket: FC = () => {
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const navigation = useNavigation();
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);

  const [marketType, setMarketType] = useState(0);
  const [coinType, setCoinType] = useState(0);
  const marketView = useRef<ScrollView>(null);
  // 获取宽高
  const screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height) - 30 - 50 - 70;
  if (Platform.OS === 'ios') screenHeight = screenHeight - 30 - 30;
  // 币币行情滑动函数
  const coinMarketChange = (x: number) => {
    const changeNum = Math.round(x / screenWidth);
    setCoinType(changeNum);
  };
  // 更改币币行情显示
  const coinMarketViewChange = (x: number) => {
    setCoinType(x);
    if (marketView.current) {
      try {
        (marketView.current as any).scrollTo({ x: x * screenWidth, y: 0 });
      } catch (err) { console.log(err); }
    }
  };
  // 币币行情USET/BTC/ETH
  const [coinMarketU, setCoinMarketU] = useState<TypeHomeScreenMarketLine[]>([]);
  // 涨幅榜
  const [coinMarketRange, setCoinMarketRange] = useState<TypeHomeScreenMarketLine[]>([]);
  // 处理数据
  useEffect(() => {
    const tickerImg = 'cash.market.ALL.ticker';
    const socketListener = (message: any) => {
      const resultData: {
        [key: string]: any;
      } = message.Tick;
      const result: TypeHomeScreenMarketLine[] = Object.values(resultData || {}).map(coin => {
        const close = parseFloat(coin.close);
        const open = parseFloat(coin.open);
        const range = Math.floor(((close - open) / open) * 10000) / 100 || 0;
        return {
          coin: `${coin.symbol.replace('USDT', '')}`,
          unit: 'USDT',
          count: numberToFormatString(coin.quo),
          price: parseFloat(coin.close).toFixed(4),
          rmbPrice: coin.rmb_close,
          range: `${range}%`,
          id: `${coin.symbol.replace('USDT', '')}/USDT`,
        };
      });
      setCoinMarketU(result);
      setCoinMarketRange([...result].sort((prev, after) => (parseFloat(after.range) - parseFloat(prev.range))));
    };
    if (routePage === 'Home') {
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


  // 跳转页面
  const gotoPage = useCallback((coin: string) => {
    navigation.navigate('Transaction', { contractType: 0, coinType: `${coin}USDT` });
  }, []);
  return (
    <View>
      {/* 头部 */}
      <View style={homeStyle.marketViewHead}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableNativeFeedback onPress={() => setMarketType(0)}>
            <Text
              style={
                marketType === 0 ? homeStyle.marketViewHeadLeftTextSelect : homeStyle.marketViewHeadLeftText
              }>
              币币行情
            </Text>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={() => setMarketType(1)}>
            <Text
              style={
                marketType === 1 ? homeStyle.marketViewHeadLeftTextSelect : homeStyle.marketViewHeadLeftText
              }>
              涨幅榜
            </Text>
          </TouchableNativeFeedback>
        </View>
        {
          marketType === 0
          && (
            <View style={{ flexDirection: 'row' }}>
              <TouchableNativeFeedback onPress={() => coinMarketViewChange(0)}>
                <View style={{ width: 50, justifyContent: 'center' }}>
                  <Text
                    style={[
                      coinType === 0 ? homeStyle.marketViewHeadRightTextSelect : homeStyle.marketViewHeadRightText,
                      { flexWrap: 'nowrap' },
                    ]}>
                    USDT
                  </Text>
                </View>
              </TouchableNativeFeedback>
              {/* <TouchableNativeFeedback onPress={() => coinMarketViewChange(1)}>
                <Text
                  style={
                  coinType === 1 ? homeStyle.marketViewHeadRightTextSelect : homeStyle.marketViewHeadRightText
                }>
                  BTC
                </Text>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback onPress={() => coinMarketViewChange(2)}>
                <Text
                  style={
                  coinType === 2 ? homeStyle.marketViewHeadRightTextSelect : homeStyle.marketViewHeadRightText
                }>
                  ETH
                </Text>
              </TouchableNativeFeedback> */}
            </View>
          )
        }
      </View>
      {/* 列表 */}
      <View>
        {/* 标题 */}
        <View style={homeStyle.marketViewListHead}>
          <Text style={homeStyle.marketViewListHeadText}>名称</Text>
          <Text style={homeStyle.marketViewListHeadText}>最新价</Text>
          <Text style={homeStyle.marketViewListHeadText}>涨跌幅</Text>
        </View>
        {/* 列表 */}
        <ScrollView style={{ height: screenHeight }}>
          {/* 币币行情 */}
          {
            marketType === 0 && (
              <ScrollView
                horizontal
                pagingEnabled
                onMomentumScrollEnd={e => coinMarketChange(e.nativeEvent.contentOffset.x)}
                showsHorizontalScrollIndicator={false}
                ref={marketView}
                style={{ flexDirection: 'row', height: screenHeight }}>
                <View style={{ width: screenWidth }}>
                  { coinMarketU.map(item => (
                    <TouchableNativeFeedback
                      key={item.id}
                      onPress={() => gotoPage(item.coin)}>
                      <HomeScreenMarketLine {...item} />
                    </TouchableNativeFeedback>
                  )) }
                </View>
                {/* <View style={{ width: screenWidth }}>
                  { coinMarketB.map(item => (
                    <HomeScreenMarketLine key={item.id} {...item} />
                  )) }
                </View>
                <View style={{ width: screenWidth }}>
                  { coinMarketE.map(item => (
                    <HomeScreenMarketLine key={item.id} {...item} />
                  )) }
                </View> */}
              </ScrollView>
            )
          }
          {/* 涨幅榜 */}
          {
            marketType === 1 && (
              <View>
                { coinMarketRange.map(item => (
                  <HomeScreenMarketLine key={item.id} {...item} />
                )) }
              </View>
            )
          }
        </ScrollView>
      </View>
    </View>
  );
};

const HomeScreen: FC = () => {
  // nav的广告图片和链接
  const [navAd, setNavAd] = useState<TypeHomeNavProp>(null);
  // 处理数据
  useEffect(() => {
    setNavAd({
      pic: require('../../assets/images/pic/home_nav.jpg'),
      link: 'Contract',
    });
  }, []);
  return (
    <ComLayoutHead close>
      <ScrollView style={homeStyle.homeView}>
        <View style={homeStyle.homeViewInner}>
          {/* 头部 */}
          <HomeScreenHead />
          {/* banner */}
          <HomeScreenBanner />
          {/* adv */}
          <HomeScreenComment />
          {/* market */}
          <HomeScreenRowMarket />
        </View>
        <ComLine />
        <View style={homeStyle.homeViewInner}>
          {/* nav */}
          <HomeScreenNav adv={navAd} />
        </View>
        <ComLine />
        {/* 行情 */}
        <HomeScreenMarket />
        {/* coinMarketU={coinMarketU}
          coinMarketB={coinMarketB}
          coinMarketE={coinMarketE}
          coinMarketRange={coinMarketRange} */}
      </ScrollView>
    </ComLayoutHead>
  );
};

export default HomeScreen;
