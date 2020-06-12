import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, Text, StyleSheet, Image, TouchableNativeFeedback as StaticTouchableNativeFeedback,
} from 'react-native';
import {
  TextInput, PanGestureHandlerGestureEvent, PanGestureHandler, TouchableNativeFeedback,
} from 'react-native-gesture-handler';
import ContractHeadView from './com_head';
import { TypeLeftOutList } from './type';
import {
  defaultThemeBgColor, themeGray, themeBlack, themeWhite, themeGreen, themeTextGray, getThemeOpacity, defaultThemeColor, themeRed,
} from '../../../config/theme';
import showSelector from '../../../components/modal/selector';
import { numberToFormatString } from '../../../tools/number';
import showComAlert from '../../../components/modal/alert';

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


// 页面
const ContractContentView: FC<{
  coinType: string;
  selectType: 0|1|2;
  changeConTypeCallback: (data: { coinType?: string; contractType?: 0|1|2 }) => void;
}> = ({
  coinType,
  selectType,
  changeConTypeCallback,
}) => {
  console.log(coinType);
  console.log(selectType);

  // 左边列表数据
  const [leftList, setLeftList] = useState<TypeLeftOutList[]>([]);
  // 顶部信息数据
  const [topInfo, setTopInfo] = useState({
    asset: '', risk: '', use: '', lever: '',
  });
  // 开仓0还是平仓1
  const [doType, setDoType] = useState<0|1>(0);
  // 委托类型0限价委托，1计划委托
  const entrustTypeData = ['限价委托', '计划委托'];
  const [entrustType, setEntrustType] = useState<0|1>(0);
  // 杠杆倍数
  const leverValuesArr = [
    '2', '5', '10', '20', '30', '50', '100',
  ];
  const [leverValue, setLaverValue] = useState<string>('10');
  // 限价委托价格
  const [fixedPrice, setFixedPrice] = useState('');
  // 是否以市价执行
  const [isMarketPrice, setMarketPrice] = useState(false);
  // 限价委托数量
  const [fixedValue, setFixedValue] = useState('');
  // 数量百分比
  const [fixedValueRatio, setFixedValueRatio] = useState(0);
  // 占用保证金
  const [occupyBond] = useState('0.00');
  // 可开手数
  const [canOpenValue] = useState('0');
  // 可平手数
  const [canCloseValue, setCanCloseValue] = useState('--');
  // 计划委托触发价格
  const [willDoPrice, setWillDoPrice] = useState('');
  // 计划委托执行价格
  const [willTransPrice, setWillTransPrice] = useState('');
  // 计划委托仓位
  const [willValues, setWillValues] = useState('');
  // 预估占用
  const [willOccupyBond] = useState('--');
  // 最新指数价格
  const newPrice = useRef('--');
  // usdt/rmb汇率
  const [USDTToRMB, setUSDTToRMB] = useState(7);


  // 方法
  const addEvent = {
    // 委托方式更改
    changeEntrustType: () => {
      const data = [...entrustTypeData];
      // 平仓只有限价委托
      if (doType === 1) data.length = 1;
      const close = showSelector({
        data,
        selected: entrustTypeData[entrustType],
        onPress: (value) => {
          if (typeof value !== 'string') return;
          const type = entrustTypeData.indexOf(value) as typeof entrustType;
          if (type === entrustType) return;
          setEntrustType(type);
          close();
          // 计划委托
          if (type === 1) {
            showComAlert({
              title: '温馨提示',
              desc: (
                <View>
                  <Text>计划委托：</Text>
                  <Text style={{ color: getThemeOpacity(themeBlack, 0.6) }}>计划委托在成功触发之前，不会冻结仓位和保证金。计划委托不一定成功触发，可能会因价格、仓位保证金等问题而失败。触发成功后限价单因市场等问题也并不一定成交，请悉知。</Text>
                </View>
              ),
              close: {
                text: '不再提示',
                onPress: () => {
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
          }
        },
      });
    },
    // 杠杆倍数更改
    changeLeverType: () => {
      const close = showSelector({
        data: leverValuesArr.map(item => ({
          data: item,
          before: '杠杆 ',
          after: 'X',
        })),
        selected: leverValue,
        onPress: (value) => {
          if (typeof value !== 'string') setLaverValue(value.data);
          close();
        },
      });
    },
    // 点击市价按钮
    onMarketPrice: () => {
      let changeMarketType = false;
      setMarketPrice(state => {
        changeMarketType = !state;
        return changeMarketType;
      });
      // 如果是市价转成限价，返回
      if (!changeMarketType) return;
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
    // 开空0/开多1
    openOrder: (type: 0|1) => {
      // 如果是平单
      if (doType === 1) {
        addEvent.closeOrder(type);
        return;
      }
      // 限价委托还是计划委托
      const showTextArr = [
        [
          // 开空
          (<Text>确定以{isMarketPrice ? '市价' : `限价${fixedPrice}USDT`} <Text style={{ color: themeRed }}>买入空单（卖出多单）</Text>，开仓{fixedValue}手？</Text>),
          // 开多
          (<Text>确定以{isMarketPrice ? '市价' : `限价${fixedPrice}USDT`} <Text style={{ color: themeGreen }}>买入多单</Text>，开仓{fixedValue}手？</Text>),
        ],
        [
          (<Text><Text style={{ color: themeRed }}>买入空单</Text>，开仓{coinType} {willValues}手触发价格：{willDoPrice}；执行价格：{willTransPrice}；</Text>),
          (<Text><Text style={{ color: themeGreen }}>买入多单</Text>，开仓{coinType} {willValues}手触发价格：{willDoPrice}；执行价格：{willTransPrice}；</Text>),
        ],
      ][entrustType];
      const close = showComAlert({
        title: ['开空', '开多'][type],
        desc: showTextArr[type],
        success: {
          text: '确定',
          onPress: () => {
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
    // 平多1/平空0
    closeOrder: (type: 0|1) => {
      console.log(type);
      const close = showComAlert({
        title: ['平空', '平多'][type],
        desc: [
          (<Text>确定以{isMarketPrice ? '市价' : `限价${fixedPrice}USDT`} <Text style={{ color: themeGreen }}>卖出空单</Text>，平仓{fixedValue}手？</Text>),
          (<Text>确定以{isMarketPrice ? '市价' : `限价${fixedPrice}USDT`} <Text style={{ color: themeRed }}>卖出多单</Text>，平仓{fixedValue}手？</Text>),
        ][type],
        success: {
          text: '确定',
          onPress: () => {
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
  };

  // 根据百分比和可开手数更改当前手数
  useEffect(() => {
    const value = Math.round((parseFloat(canOpenValue) * fixedValueRatio) / 100);
    if (Number.isNaN(value)) return;
    setFixedValue(value.toString());
  }, [canOpenValue, fixedValueRatio]);
  // 点击平仓之后，换成计划委托
  useEffect(() => {
    if (doType === 1) setEntrustType(0);
  }, [doType]);

  useEffect(() => {
    setLeftList([
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
    setTopInfo({
      asset: '0.00/0.00', risk: '0', use: '0.00%', lever: '0',
    });
    setUSDTToRMB(10);
    setCanCloseValue('123');
  }, []);

  return (
    <View style={style.pageView}>
      <ContractHeadView
        coinType={coinType}
        leftList={leftList}
        changeCallback={changeConTypeCallback} />
      {/* 个人信息 */}
      <View style={style.topInfoView}>
        <Text style={style.topInfoViewText}>
          <Text>资产:可用/当前&nbsp;&nbsp;</Text>
          <Text style={style.topInfoViewInfo}>{topInfo.asset}</Text>
        </Text>
        <Text style={[style.topInfoViewText, style.topInfoViewRight]}>
          <Text>风险度:&nbsp;&nbsp;</Text>
          <Text style={style.topInfoViewInfo}>{topInfo.risk}</Text>
        </Text>
        <Text style={style.topInfoViewText}>
          <Text>资金使用率:&nbsp;&nbsp;</Text>
          <Text style={style.topInfoViewInfo}>{topInfo.use}</Text>
        </Text>
        <Text style={[style.topInfoViewText, style.topInfoViewRight]}>
          <Text>资金杠杆:&nbsp;&nbsp;</Text>
          <Text style={style.topInfoViewInfo}>{topInfo.lever}</Text>
        </Text>
      </View>
      {/* 主内容区 */}
      <View style={style.content}>
        {/* 主操作区 */}
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
            <StaticTouchableNativeFeedback onPress={() => addEvent.changeEntrustType()}>
              <View style={style.moreTypeChangePress}>
                <Text style={style.moreTypeChangeText}>
                  {entrustTypeData[entrustType]}
                </Text>
                <Image
                  resizeMode="contain"
                  style={style.moreTypeChangeIcon}
                  source={require('../../../assets/images/icons/down.png')} />
              </View>
            </StaticTouchableNativeFeedback>
            <StaticTouchableNativeFeedback onPress={() => addEvent.changeLeverType()}>
              <View style={style.moreTypeChangePress}>
                <Text style={style.moreTypeChangeText}>杠杆&nbsp;{leverValue}X</Text>
                <Image
                  resizeMode="contain"
                  style={style.moreTypeChangeIcon}
                  source={require('../../../assets/images/icons/down.png')} />
              </View>
            </StaticTouchableNativeFeedback>
          </View>
          {/* 价格操作区 */}
          <View>
            {/* 限价委托 */}
            {
              entrustType === 0 && (
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
                              keyboardType="number-pad"
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
                          市价
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
                      placeholder="数量" />
                    <Text style={style.priceSetInputText}>手</Text>
                  </View>
                  {/* 滚动条 */}
                  <ComSliderView
                    fixedValueRatio={fixedValueRatio}
                    setFixedValueRatio={setFixedValueRatio} />
                  {/* 更多信息 */}
                  <View style={style.ratioThenTextView}>
                    <Text style={style.ratioThenText}>占用保证金</Text>
                    <Text style={style.ratioThenText}>{occupyBond}</Text>
                  </View>
                  <View style={style.ratioThenTextView}>
                    <Text style={style.ratioThenText}>可{['开', '平'][doType]}手数</Text>
                    <Text style={style.ratioThenText}>{[canOpenValue, canCloseValue][doType]}</Text>
                  </View>
                </View>
              )
            }
            {/* 计划委托 */}
            {
              entrustType === 1 && (
                <View>
                  {/* 触发价格 */}
                  <View style={style.priceSetValue}>
                    <TextInput
                      keyboardType="number-pad"
                      style={style.priceSetInputInput}
                      value={willDoPrice}
                      onChange={e => setWillDoPrice(e.nativeEvent.text)}
                      placeholder="触发价格" />
                    <Text style={style.priceSetInputText}>USDT</Text>
                  </View>
                  {/* 执行价格 */}
                  <View style={style.priceSetValue}>
                    <TextInput
                      keyboardType="number-pad"
                      style={style.priceSetInputInput}
                      value={willTransPrice}
                      onChange={e => setWillTransPrice(e.nativeEvent.text)}
                      placeholder="执行价格" />
                    <Text style={style.priceSetInputText}>默认对手价</Text>
                  </View>
                  {/* 仓位 */}
                  <View style={style.priceSetValue}>
                    <TextInput
                      keyboardType="number-pad"
                      style={style.priceSetInputInput}
                      value={willValues}
                      onChange={e => setWillValues(e.nativeEvent.text)}
                      placeholder="执行仓位" />
                    <Text style={style.priceSetInputText}>手</Text>
                  </View>
                  {/* 预估占用 */}
                  <View style={style.willUseView}>
                    <Text style={style.willUseViewText}>预估占用</Text>
                    <Text style={style.willUseViewText}>{willOccupyBond}</Text>
                  </View>
                </View>
              )
            }
            {/* 操作按钮 */}
            <View style={style.doFuncBtnsView}>
              <TouchableNativeFeedback onPress={() => addEvent.openOrder(1)}>
                <View style={[
                  style.doFuncBtnView,
                  { backgroundColor: [themeGreen, themeRed][doType] },
                ]}>
                  {
                    doType === 0
                      ? (
                        <>
                          <Text style={style.doFuncBtnText}>开多</Text>
                          <Text style={style.doFuncBtnDesc}>看涨</Text>
                        </>
                      )
                      : (
                        <Text style={style.doFuncBtnText}>平多</Text>
                      )
                  }
                </View>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback onPress={() => addEvent.openOrder(0)}>
                <View style={[
                  style.doFuncBtnView,
                  { backgroundColor: [themeRed, themeGreen][doType] },
                ]}>
                  {
                    doType === 0
                      ? (
                        <>
                          <Text style={style.doFuncBtnText}>开空</Text>
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
      <View style={style.comLineStyle} />
    </View>
  );
};

const style = StyleSheet.create({
  pageView: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  topInfoView: {
    backgroundColor: defaultThemeBgColor,
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
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
});

export default ContractContentView;
