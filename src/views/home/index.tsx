import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, Text, Image, ImageSourcePropType, ScrollViewProps, Dimensions, Platform,
} from 'react-native';
import { TouchableNativeFeedback, ScrollView } from 'react-native-gesture-handler';
import Swiper from 'react-native-swiper';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  themeRed, themeGreen, themeBlack, themeGray,
} from '../../config/theme';
import homeStyle from './index.style';
import { positiveNumber } from '../../tools/number';
import ComLine from '../../components/line';
import ComLayoutHead from '../../components/layout/head';

// 头部
const HomeScreenHead: FC<{ user: string; }> = ({ user }) => {
  const searchImg = require('../../assets/images/icons/search.png');
  const commentsImg = require('../../assets/images/icons/comments.png');
  const navigation = useNavigation();
  // 点击搜索按钮
  const searchBtn = () => alert('点击搜索');
  // 点击公告按钮
  const commentBtn = () => navigation.navigate('HomeNewsList');
  return (
    <View style={homeStyle.homeHead}>
      <Text style={homeStyle.homeHeadText}>Hi,{user}</Text>
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
type TypeBannerArr = {pic: ImageSourcePropType, id: number}[];
const HomeScreenBanner: FC<{ bannerArr: TypeBannerArr }> = ({ bannerArr }) => {
  // 读秒
  const swiperTime = 4;
  return (
    <View style={homeStyle.banner}>
      <Swiper
        autoplay
        autoplayTimeout={swiperTime}
        paginationStyle={homeStyle.bannerSlideBottom}
        dotStyle={homeStyle.bannerSlideBottomDotStyle}
        activeDotStyle={homeStyle.bannerSlideBottomActiveDotStyle}>
        {
          bannerArr.map(item => (
            <View style={homeStyle.bannerSlide} key={item.id}>
              <Image resizeMode="stretch" style={homeStyle.bannerSlideImage} source={item.pic} />
            </View>
          ))
        }
      </Swiper>
    </View>
  );
};

// 公告
type TypeCommentArr = {title: string; id: string;}[];
const HomeScreenComment: FC<{ commentArr: TypeCommentArr }> = ({ commentArr }) => {
  // 读秒
  const swiperTime = 5;
  // 点击
  const commitClick = (id: string) => {
    alert(id);
  };
  return (
    <View style={homeStyle.commentView}>
      <Image
        style={homeStyle.commentIcon}
        resizeMode="contain"
        source={require('../../assets/images/icons/comments.png')} />
      <Swiper
        autoplay
        horizontal={false}
        scrollEnabled={false}
        showsPagination={false}
        autoplayTimeout={swiperTime}>
        {
          commentArr.map(item => (
            <TouchableNativeFeedback key={item.id} onPress={() => commitClick(item.id)}>
              <View style={homeStyle.commentView}>
                <Text style={homeStyle.commentText}>{ item.title }</Text>
              </View>
            </TouchableNativeFeedback>
          ))
        }
      </Swiper>
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
  return (
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
  );
};
const HomeScreenRowMarket: FC<{ value: TypeHomeRowMarketValue[] }> = ({ value }) => {
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
  return (
    <View style={homeStyle.marketSwiper}>
      <ScrollView
        horizontal
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onScroll={scrollEvent}
        style={homeStyle.marketScroll}>
        {
          value.map(item => (
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
    console.log(link);
  };
  const navList = [
    {
      icon: require('../../assets/images/icons/nav_usdt.png'), name: 'USDT合约', link: '', key: 'nav_1',
    },
    {
      icon: require('../../assets/images/icons/nav_coin.png'), name: '币本位合约', link: '', key: 'nav_2',
    },
    {
      icon: require('../../assets/images/icons/nav_quarter.png'), name: '季度合约', link: '', key: 'nav_3',
    },
    {
      icon: require('../../assets/images/icons/nav_blend.png'), name: '混合合约', link: '', key: 'nav_4',
    },
  ];
  return (
    <View>
      <View style={homeStyle.navListView}>
        {
          navList.map(nav => (
            <TouchableNativeFeedback key={nav.key} onPress={() => goTolink(nav.link)}>
              <View style={homeStyle.navListLi}>
                <Image style={homeStyle.navListImage} source={nav.icon} />
                <Text style={homeStyle.navListText}>{nav.name}</Text>
              </View>
            </TouchableNativeFeedback>
          ))
        }
      </View>
      <View style={homeStyle.navListView}>
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
      <View>
        <View>
          <Text>
            <Text style={{ color: themeBlack, fontWeight: 'bold', fontSize: 18 }}>{coin}</Text>
            <Text style={{ color: themeGray }}>/{unit}</Text>
          </Text>
        </View>
        <Text style={{ color: themeGray, fontSize: 12 }}>24h&nbsp;&nbsp;&nbsp;{count}</Text>
      </View>
      <View>
        <Text style={{ color: themeBlack, fontWeight: 'bold', fontSize: 16 }}>{price}</Text>
        <Text style={{ color: themeGray, fontSize: 12 }}>&yen;{rmbPrice}</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: positiveNumber(range) ? themeGreen : themeRed }}>
        {range}
      </Text>
    </View>
  );
};
const HomeScreenMarket: FC = () => {
  const [marketType, setMarketType] = useState(0);
  const [coinType, setCoinType] = useState(0);
  const marketView = useRef<ScrollView>(null);
  // 获取宽高
  const screenWidth = Math.floor(Dimensions.get('window').width);
  let screenHeight = Math.floor(Dimensions.get('window').height) - 30 - 50 - 70;
  if (Platform.OS === 'ios') screenHeight = screenHeight - 30 - 30;
  // 币币行情
  const [coinMarketU, setCoinMarketU] = useState<TypeHomeScreenMarketLine[]>([]);
  const [coinMarketB, setCoinMarketB] = useState<TypeHomeScreenMarketLine[]>([]);
  const [coinMarketE, setCoinMarketE] = useState<TypeHomeScreenMarketLine[]>([]);
  // 涨幅榜
  const [coinMarketRange, setCoinMarketRange] = useState<TypeHomeScreenMarketLine[]>([]);
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
  // 获取数据
  useEffect(() => {
    setCoinMarketU([
      {
        coin: 'BTC', unit: 'USDT', count: '25,504', price: '9832.12', rmbPrice: '69419.58', range: '+3.65%', id: '1',
      },
      {
        coin: 'BTC', unit: 'USDT', count: '25,504', price: '9832.12', rmbPrice: '69419.58', range: '+3.65%', id: '2',
      },
    ]);
    setCoinMarketB([
      {
        coin: 'BTC', unit: 'USDT', count: '25,504', price: '9832.12', rmbPrice: '69419.58', range: '+3.65%', id: '3',
      },
    ]);
    setCoinMarketE([
      {
        coin: 'BTC', unit: 'USDT', count: '25,504', price: '9832.12', rmbPrice: '69419.58', range: '+3.65%', id: '4',
      },
    ]);
    setCoinMarketRange([
      {
        coin: 'BTC', unit: 'USDT', count: '25,504', price: '9832.12', rmbPrice: '69419.58', range: '+3.65%', id: '5',
      },
    ]);
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
                <Text
                  style={
                  coinType === 0 ? homeStyle.marketViewHeadRightTextSelect : homeStyle.marketViewHeadRightText
                }>
                  USDT
                </Text>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback onPress={() => coinMarketViewChange(1)}>
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
              </TouchableNativeFeedback>
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
                style={{ flexDirection: 'row' }}>
                <View style={{ width: screenWidth }}>
                  { coinMarketU.map(item => (
                    <HomeScreenMarketLine key={item.id} {...item} />
                  )) }
                </View>
                <View style={{ width: screenWidth }}>
                  { coinMarketB.map(item => (
                    <HomeScreenMarketLine key={item.id} {...item} />
                  )) }
                </View>
                <View style={{ width: screenWidth }}>
                  { coinMarketE.map(item => (
                    <HomeScreenMarketLine key={item.id} {...item} />
                  )) }
                </View>
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
  // 用户
  const [userPhone] = useState('188****8888');
  // 轮播图
  const [bannerArr, setBanner] = useState<TypeBannerArr>([]);
  // 公告
  const [comments, setComments] = useState<TypeCommentArr>([]);
  // 中部行情
  const [marketBlock, setMarketBlock] = useState<TypeHomeRowMarketValue[]>([]);
  // nav的广告图片和链接
  const [navAd, setNavAd] = useState<TypeHomeNavProp>(null);

  // 处理数据
  useEffect(() => {
    const banner = require('../../assets/images/memory/banner1.png');
    setBanner([
      { pic: banner, id: 1 },
      { pic: banner, id: 2 },
      { pic: banner, id: 3 },
    ]);
    setComments([
      { title: '这是第一个公告这是第一个公告这是第一个公告', id: '1' },
      { title: '这是第2个公告', id: '2' },
      { title: '这是第3个公告', id: '3' },
      { title: '这是第4个公告', id: '4' },
    ]);
    setMarketBlock([
      {
        keyV: '1BTC/USDT永续', price: '9900.76', range: '+3.98%', type: 'USDT合约',
      },
      {
        keyV: '2BTC/USDT永续', price: '9900.76', range: '-3.98%', type: 'USDT合约',
      },
      {
        keyV: '3BTC/USDT永续', price: '9900.76', range: '-3.98%', type: 'USDT合约',
      },
      {
        keyV: '4BTC/USDT永续', price: '9900.76', range: '+3.98%', type: 'USDT合约',
      },
    ]);
    setNavAd({
      pic: require('../../assets/images/memory/nav_1.png'),
      link: '',
    });
  }, []);
  return (
    <ComLayoutHead close>
      <ScrollView style={homeStyle.homeView}>
        <View style={homeStyle.homeViewInner}>
          {/* 头部 */}
          <HomeScreenHead user={userPhone} />
          {/* banner */}
          <HomeScreenBanner bannerArr={bannerArr} />
          {/* adv */}
          <HomeScreenComment commentArr={comments} />
          {/* market */}
          <HomeScreenRowMarket value={marketBlock} />
        </View>
        <ComLine />
        <View style={homeStyle.homeViewInner}>
          {/* nav */}
          <HomeScreenNav adv={navAd} />
        </View>
        <ComLine />
        {/* 行情 */}
        <HomeScreenMarket />
      </ScrollView>
    </ComLayoutHead>
  );
};

export default HomeScreen;
