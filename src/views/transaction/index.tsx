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
import ComLayoutHead from '../../components/layout/head';
import {
  themeWhite, themeGray, themeGreen, themeRed, themeMoreBlue, getThemeOpacity, defaultThemeBgColor, defaultThemeColor, themeBlack, themeTextGray,
} from '../../config/theme';
import { TypeLeftOutList } from '../contract/index/type';
import { modalOutBg } from '../../components/modal/outBg';
import { numberToFormatString } from '../../tools/number';
import ComLine from '../../components/line';
import ComTranscationView from './logs';


// 买卖列表类型
type TypeSellBuyList = {
  price: string;
  value: number;
};

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
      }, 200));
    },
  };
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
  const navigation = useNavigation();

  // 币种交易对
  const [coinType, setCoinType] = useState<TypeLeftOutList['id']>('BTC/USDT');
  // 是否显示更多
  const [showMore, setShowMore] = useState(false);
  // 左侧币种列表
  const [coinListArr, setCoinListArr] = useState<TypeLeftOutList[]>([]);
  // 数量百分比
  const [fixedValueRatio, setFixedValueRatio] = useState(0);
  // usdt/rmb汇率
  const [USDTToRMB, setUSDTToRMB] = useState(7);
  // 最新指数价格
  const newPrice = useRef('--');

  const addEvent = {
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
    // 显示更多内容
  };

  useEffect(() => {
    setCoinListArr([
      {
        name: 'BTC/USDT 永续', id: 'BTC/USDT', priceUSDT: '9873.55', ratio: '+3.65%',
      },
      {
        name: 'EOS/USDT 永续', id: 'EOS/USDT', priceUSDT: '9873.55', ratio: '-3.65%',
      },
      {
        name: 'ETH/USDT 永续', id: 'ETH/USDT', priceUSDT: '9873.55', ratio: '-3.65%',
      },
      {
        name: 'BCH/USDT 永续', id: 'BCH/USDT', priceUSDT: '9873.55', ratio: '+3.65%',
      },
    ]);
    setUSDTToRMB(10);
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
            <StaticTouchableNativeFeedback>
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
                  onPress={() => {}}>
                  <View
                    style={[
                      style.typeChangeBtn,
                      style.typeChangeBtnSelect,
                    ]}>
                    <Text style={[
                      style.typeChangeBtnText,
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
                        ][1]} />
                    </View>
                  </View>
                </StaticTouchableNativeFeedback>
              ))
            }
          </View>
          {/* 限价/市价 */}
          <View style={style.moreTypeChange}>
            <StaticTouchableNativeFeedback onPress={() => {}}>
              <View style={style.moreTypeChangePress}>
                <Text style={style.moreTypeChangeText}>
                  限价
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
                    placeholder="价格" />
                </View>
              </View>
              <Text>&asymp;&yen;0.00</Text>
              {/* 数量 */}
              <View style={style.priceSetValue}>
                <TextInput
                  keyboardType="number-pad"
                  style={style.priceSetInputInput}
                  placeholder="数量(BTC)" />
              </View>
              {/* 滚动条 */}
              <ComSliderView
                fixedValueRatio={fixedValueRatio}
                setFixedValueRatio={setFixedValueRatio} />
              {/* 更多信息 */}
              <View style={style.ratioThenTextView}>
                <Text style={style.ratioThenText}>可用</Text>
                <Text style={style.ratioThenText}>{1}</Text>
              </View>
              <View style={style.ratioThenTextView}>
                <Text style={style.ratioThenText}>交易额</Text>
                <Text style={style.ratioThenText}>{2}</Text>
              </View>
            </View>
            {/* 操作按钮 */}
            <View style={style.doFuncBtnsView}>
              <StaticTouchableNativeFeedback onPress={() => {}}>
                <View style={[
                  style.doFuncBtnView,
                  { backgroundColor: [themeGreen, themeRed][0] },
                ]}>
                  <Text style={style.doFuncBtnText}>买入</Text>
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
      <ComTranscationView />
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
