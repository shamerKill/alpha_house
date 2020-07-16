import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, Text, StyleSheet, Image, TouchableNativeFeedback as StaticTouchableNativeFeedback,
} from 'react-native';
import {
  TextInput, PanGestureHandlerGestureEvent, PanGestureHandler, TouchableNativeFeedback,
} from 'react-native-gesture-handler';
import { useRoute, useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import ContractHeadView from './com_head';
import { TypeLeftOutList } from './type';
import {
  defaultThemeBgColor, themeGray, themeBlack, themeWhite, themeGreen, themeTextGray, getThemeOpacity, defaultThemeColor, themeRed,
} from '../../../config/theme';
import showSelector from '../../../components/modal/selector';
import { numberToFormatString } from '../../../tools/number';
import showComAlert from '../../../components/modal/alert';
import ajax from '../../../data/fetch';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';
import Socket, { marketSocket } from '../../../data/fetch/socket';
import storage from '../../../data/database';

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

// 右侧数据显示
const ContractRightValueView: FC<{USDTToRMB: number, getPrice: React.MutableRefObject<string>; coinType: string;}> = ({ getPrice, coinType }) => {
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  // 买列表
  const [buyData, setBuyData] = useState<(TypeSellBuyList&{ratio?:string})[]>([]);
  // 卖
  const [sellData, setSellData] = useState<(TypeSellBuyList&{ratio?:string})[]>([]);
  // 最新指数价格
  const [newPrice, setNewPrice] = useState('--');
  const [prevNewPrice, setPrevNewPrice] = useState('--');
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
    if (!coinType) return;
    const tickerImg = `gold.market.${coinType.replace('/', '')}.depth`;
    const socketListener = (message: any) => {
      if (message?.buy && message?.sell) {
        if (message.buy.length < 6 || message.sell.length < 6) return;
        const buyDataMem = message.buy.splice(0, 6).map((item: any) => ({
          price: item[0],
          value: item[1],
        }));
        const sellDataMem = message.sell.splice(0, 6).map((item: any) => ({
          price: item[0],
          value: item[1],
        }));
        const allData = addEvent.setData([...buyDataMem, ...sellDataMem]);
        setBuyData(allData.splice(0, 6));
        setSellData(allData);
      }
    };
    // 获取成交价
    const tickerImgPrice = `gold.market.${coinType.replace('/', '')}.deal`;
    const socketListenerPrice = (message: any) => {
      if (Array.isArray(message.Tick)) {
        const socketPrice: string = message.Tick[message.Tick.length - 1].price;
        setPrevNewPrice(newPrice);
        setNewPrice(socketPrice);
        setDirection(parseFloat(socketPrice) - parseFloat(prevNewPrice) < 0 ? 0 : 1);
      } else {
        const socketPrice: string = message.Tick.price;
        setPrevNewPrice(newPrice);
        setNewPrice(socketPrice);
        setDirection(parseFloat(socketPrice) - parseFloat(prevNewPrice) < 0 ? 0 : 1);
      }
    };
    if (routePage === 'Contract') {
      marketSocket.getSocket().then(ws => {
        socket.current = ws;
        ws.addListener(socketListener, tickerImg);
        ws.send(tickerImg, 'sub');
        ws.send(tickerImg, 'req');
        ws.addListener(socketListenerPrice, tickerImgPrice);
        ws.send(tickerImgPrice, 'sub');
        ws.send(tickerImgPrice, 'req');
        subSocket.current = false;
      }).catch(err => {
        console.log(err);
      });
    } else if (socket.current) {
      if (!subSocket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(socketListener);
        socket.current.send(tickerImgPrice, 'unsub');
        socket.current.removeListener(socketListenerPrice);
      }
    }
    // eslint-disable-next-line consistent-return
    return () => {
      if (!subSocket.current && socket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(socketListener);
        socket.current.send(tickerImgPrice, 'unsub');
        socket.current.removeListener(socketListenerPrice);
      }
    };
  }, [routePage, coinType]);
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
          {/* &#8776;&yen;{((parseFloat(newPrice) || 0) * USDTToRMB).toFixed(2)} */}
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
  changePageLeverType: React.Dispatch<React.SetStateAction<string>>;
  canCloseOrderValue: {lang: string; sort: string;};
}> = ({
  coinType,
  selectType,
  changeConTypeCallback,
  changePageLeverType,
  canCloseOrderValue,
}) => {
  // console.log(coinType); // 币种类型
  // console.log(selectType); // 合约类型
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const [prevRoutePage] = useGetDispatch<InState['pageRouteState']['prevPageRoute']>('pageRouteState', 'prevPageRoute');
  const route = useRoute();
  const navigation = useNavigation();

  // 后台获得币种分类数据
  const [serverCoinType, setServerCoinType] = useState<{
    changeRatio: number; // 手数计算比例
    leverList: {
      lever: string; // 可开杠杆倍数，
      selfRatio: number; // 杠杆保证金率
    }[];
  }>({
    changeRatio: 1,
    leverList: [],
  });

  // 是否在提交中
  const isLoading = useRef(false);

  // 左边列表数据
  const [leftList, setLeftList] = useState<TypeLeftOutList[]>([]);
  // 顶部信息数据
  const [topInfo, setTopInfo] = useState({
    asset: '', risk: '', use: '', lever: '',
  });
  // 开仓0还是平仓1
  const [doType, setDoType] = useState<0|1>(0);
  // 委托类型0限价委托，1计划委托
  // , '计划委托'
  const entrustTypeData = ['限价委托'];
  const [entrustType, setEntrustType] = useState<0|1>(0);
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
  const [occupyBond, setOccupyBond] = useState('0.00');
  // 平仓数据占用保证金
  const [haveOcupyBond, setHaveOcupyBond] = useState('0.00');
  // 可开手数
  const [canOpenValue, setCanOpenValue] = useState('0');
  // 可平手数(开多)
  // setCanCloseValueLang
  const [canCloseValueLang, setCanCloseValueLang] = useState('--');
  // 可平手数(开空)
  const [canCloseValueSort, setCanCloseValueSort] = useState('--');
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
  const [USDTToRMB] = useState(7);


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
        data: serverCoinType.leverList.map(item => ({
          data: item.lever,
          before: '杠杆 ',
          after: 'X',
        })),
        selected: leverValue,
        onPress: (value) => {
          if (typeof value !== 'string') {
            addEvent.submitChangeLeverType(value.data, close);
          }
        },
      });
    },
    submitChangeLeverType: (lever: string, close: () => void) => {
      ajax.post('/v1/bian/update_lever', {
        symbol: coinType.split('/')[0],
        lever: Number(lever),
      }).then(data => {
        if (data.status === 200) {
          setLaverValue(lever);
          showMessage({
            message: '杠杆更改成功',
            type: 'success',
          });
        } else {
          showMessage({
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        close();
      });
    },
    // 点击市价按钮
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
    // 开空0/开多1
    openOrder: (type: 0|1) => {
      if (isLoading.current) {
        showMessage({
          message: '已有委托正在提交,请稍后',
          type: 'info',
        });
        return;
      }
      // 如果是平单
      if (doType === 1) {
        addEvent.closeOrder(type);
        return;
      }
      // 判断手数
      if (Number(fixedValue) <= 0) {
        showMessage({
          message: '开仓手数有误',
          type: 'warning',
        });
        return;
      }
      // 判断价格
      if (!isMarketPrice && parseFloat(fixedPrice) <= 0) {
        showMessage({
          message: '请输入正确价格',
          type: 'warning',
        });
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
            addEvent.submitOpenOrder(type);
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
    // 开空0/开多1
    submitOpenOrder: (type: 0|1) => {
      isLoading.current = true;
      const fm: {[key: string]: any} = {};
      fm.price = parseFloat(fixedPrice) || 123;
      fm.num = Number(fixedValue);
      fm.lever = Number(leverValue);
      [fm.symbol] = coinType.split('/');
      fm.side = ['SELL', 'BUY'][type];
      fm.price_type = Number(isMarketPrice) + 1;
      fm.postition_side = ['SHORT', 'LONG'][type];
      ajax.post('/v1/bian/Order', fm).then(data => {
        if (data.status === 200) {
          showMessage({
            message: '委托提交成功',
            type: 'success',
          });
          addEvent.getServerUserInfo();
        } else {
          showMessage({
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        isLoading.current = false;
      });
    },
    // 平多1/平空0
    closeOrder: (type: 0|1) => {
      if (isLoading.current) {
        showMessage({
          message: '已有委托正在提交,请稍后',
          type: 'info',
        });
        return;
      }
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
            addEvent.submitCloseOrder(type);
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
    // 平空0/平多1
    submitCloseOrder: (type: 0|1) => {
      let changeNum = fixedValue;
      if (/%/.test(fixedValue)) {
        changeNum = `${Math.floor((parseFloat(fixedValue) * parseFloat([canCloseValueSort, canCloseValueLang][type])) / 100)}`;
      }
      if (Number(changeNum) > Number([canCloseValueSort, canCloseValueLang][type]) || Number(changeNum) === 0) {
        showMessage({
          message: '所设平仓手数有误',
          type: 'warning',
        });
        return;
      }
      if (!isMarketPrice) {
        const titlePrice = parseFloat(newPrice.current);
        const willPrice = parseFloat(fixedPrice);
        const ratio = Math.abs((titlePrice - willPrice) / (titlePrice || 1));
        if (ratio > 0.3) {
          showMessage({
            message: '所设市价不能与指数价相差30%',
            type: 'warning',
          });
          return;
        }
      }
      isLoading.current = true;
      const fm: {[key: string]: any} = {};
      fm.price = parseFloat(fixedPrice) || 10;
      fm.num = Number(changeNum);
      fm.lever = Number(leverValue);
      [fm.symbol] = coinType.split('/');
      fm.side = ['BUY', 'SELL'][type];
      fm.price_type = Number(isMarketPrice) + 1;
      fm.postition_side = ['SHORT', 'LONG'][type];
      ajax.post('/v1/bian/Order', fm).then(data => {
        if (data.status === 200) {
          showMessage({
            message: '委托提交成功',
            type: 'success',
          });
          addEvent.getServerUserInfo();
        } else {
          showMessage({
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        isLoading.current = false;
      });
    },
    // 获取用户信息
    getServerUserInfo: () => {
      ajax.get('/v1/bian/gold_accounts').then(data => {
        if (data.status === 200) {
          // 用户信息
          setTopInfo({
            asset: `${parseFloat(data.data.asset.availableBalance).toFixed(2)}/${parseFloat(data.data.asset.walletBalance).toFixed(2)}`,
            risk: `${Math.floor((data.data.asset.maintMargin / (data.data.asset.walletBalance || 1)) * 10000) / 100}%`,
            use: `${Math.floor((data.data.asset.maintMargin / (data.data.asset.walletBalance || 1)) * 10000) / 100}%`,
            lever: data.data.positions.filter((item: any) => item.symbol === coinType.replace('/', ''))[0]?.leverage,
          });
          // 更改杠杆
          setLaverValue(data.data.positions.filter((item: any) => item.symbol === coinType.replace('/', ''))[0].leverage);
          // 获取当前币保证金
          const newCoinSelf: number[] = data.data.positions.filter((item: any) => item.symbol === coinType.replace('/', '')).map((item: any) => parseFloat(item.maintMargin));
          setHaveOcupyBond(newCoinSelf.reduce((a, b) => (a + b)).toFixed(4));
          // 更改杠杆倍率
          if (coinType === 'BTC/USDT') {
            setServerCoinType({
              changeRatio: parseFloat(data.data.values),
              leverList: [
                { lever: '1', selfRatio: 1 },
                { lever: '2', selfRatio: 0.5 },
                { lever: '3', selfRatio: 0.333 },
                { lever: '4', selfRatio: 0.25 },
                { lever: '5', selfRatio: 0.2 },
                { lever: '10', selfRatio: 0.1 },
                { lever: '20', selfRatio: 0.05 },
                { lever: '50', selfRatio: 0.02 },
                { lever: '100', selfRatio: 0.01 },
                // { lever: '125', selfRatio: 0.008 },
              ],
            });
          } else {
            setServerCoinType({
              changeRatio: parseFloat(data.data.values),
              leverList: [
                { lever: '1', selfRatio: 1 },
                { lever: '2', selfRatio: 0.5 },
                { lever: '3', selfRatio: 0.333 },
                { lever: '4', selfRatio: 0.25 },
                { lever: '5', selfRatio: 0.2 },
                { lever: '10', selfRatio: 0.1 },
                { lever: '25', selfRatio: 0.04 },
                { lever: '50', selfRatio: 0.02 },
                { lever: '75', selfRatio: 0.013 },
              ],
            });
          }
        }
      }).catch(err => {
        console.log(err);
      });
    },
  };

  // 根据百分比和可开手数更改当前手数
  useEffect(() => {
    if (doType === 0) {
      const value = Math.round((parseFloat(canOpenValue) * fixedValueRatio) / 100);
      if (Number.isNaN(value)) return;
      setFixedValue(value.toString());
    }
  }, [canOpenValue, fixedValueRatio]);
  // 如果是平仓，手数可以百分比
  useEffect(() => {
    if (doType === 1) setFixedValue(`${fixedValueRatio}%`);
  }, [fixedValueRatio]);
  // 点击平仓之后，换成计划委托
  useEffect(() => {
    if (doType === 1) setEntrustType(0);
    setFixedValue('');
    setFixedValueRatio(0);
  }, [doType]);
  // 手数限制
  useEffect(() => {
    if (doType === 0 && !isMarketPrice && Number(fixedValue) > Number(canOpenValue)) {
      setFixedValue(canOpenValue);
    }
  }, [fixedValue]);

  useEffect(() => {
    if (routePage === 'Contract' && coinType) {
      addEvent.getServerUserInfo();
    }
  }, [routePage, coinType]);

  // 更改可开手数
  useEffect(() => {
    // 一个币几手
    const handToCoin = 1 / serverCoinType.changeRatio;
    // 可用资产(USDT)
    const canUseMoney = parseFloat(topInfo.asset.split('/')[0]);
    // 价格
    let price = parseFloat(fixedPrice);
    if (isMarketPrice) {
      price = parseFloat(newPrice.current);
    }
    if (price === 0) return;
    // 杠杆
    const lever = leverValue;
    // 计算可开手数
    const canOpenVolumn = Math.floor(handToCoin * (canUseMoney / price) * Number(lever));
    if (!Number.isNaN(canOpenVolumn)) {
      // 可开手数赋值
      setCanOpenValue(`${canOpenVolumn}`);
    }
  }, [serverCoinType, topInfo, fixedPrice, leverValue, newPrice.current]);
  // 更改占用保证金
  useEffect(() => {
    if (serverCoinType.leverList.length === 0) return;
    // 获取杠杆保证金率
    const safeRatio = serverCoinType?.leverList?.filter(item => item.lever === leverValue)?.[0]?.selfRatio;
    // 占用保证金数 杠杆*价格*手数*一手币数*资金占用率比例
    const safeValue = parseFloat(fixedPrice) * parseFloat(fixedValue) * serverCoinType.changeRatio * safeRatio;
    if (!Number.isNaN(safeValue)) {
      // 可开手数赋值
      setOccupyBond(`${safeValue.toFixed(2)}`);
    }
  }, [fixedPrice, leverValue, fixedValue, serverCoinType]);
  // 更改页面杠杆
  useEffect(() => {
    if (changePageLeverType) {
      changePageLeverType(leverValue);
    }
  }, [leverValue]);
  // 更改可平手数
  useEffect(() => {
    setCanCloseValueLang(canCloseOrderValue.lang);
    setCanCloseValueSort(canCloseOrderValue.sort);
  }, [canCloseOrderValue]);

  // 获取左侧列表数据
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  useEffect(() => {
    const tickerImg = 'gold.market.ALL.ticker';
    const socketListener = (message: any) => {
      const resultData: {
        [key: string]: {
          [key: string]: string;
        };
      } = message.Tick;
      const result: TypeLeftOutList[] = [];
      Object.values(resultData || {}).forEach(item => {
        const close = parseFloat(item.close);
        const open = parseFloat(item.open);
        const range = Math.floor(((close - open) / open) * 10000) / 100;
        result.push({
          name: item.symbol.replace('USDT', '/USDT'),
          id: item.symbol.replace('USDT', '/USDT'),
          priceUSDT: item.close,
          ratio: `${range}%`,
        });
      });
      if (leftList.length === 0) {
        setLeftList(result);
      }
      if (route.params === undefined) {
        navigation.navigate('Contract', { contractType: selectType, coinType: result[0].name });
      }
    };
    if (routePage === 'Contract' && prevRoutePage !== 'Contract') {
      // 获取USDT合约
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
      if (subSocket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(tickerImg);
      }
    }
    return () => {
      if (subSocket.current) return;
      subSocket.current = true;
      socket.current?.send(tickerImg, 'unsub');
      socket.current?.removeListener(tickerImg);
    };
  }, [routePage, route, prevRoutePage]);

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
            {
              doType === 0 && (
                <StaticTouchableNativeFeedback onPress={() => addEvent.changeLeverType()}>
                  <View style={style.moreTypeChangePress}>
                    <Text style={style.moreTypeChangeText}>杠杆&nbsp;{leverValue}X</Text>
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
                    {
                      !isMarketPrice && (
                        <>
                          <Text style={style.ratioThenText}>占用保证金</Text>
                          <Text style={style.ratioThenText}>{[occupyBond, haveOcupyBond][doType]}</Text>
                        </>
                      )
                    }
                  </View>
                  <View style={style.ratioThenTextView}>
                    {
                      doType === 0 && !isMarketPrice && (
                        <>
                          <Text style={style.ratioThenText}>可开手数</Text>
                          <Text style={style.ratioThenText}>{canOpenValue}</Text>
                        </>
                      )
                    }
                    {
                      doType === 1 && (
                        <>
                          <Text style={style.ratioThenText}>可平手数</Text>
                          <Text style={style.ratioThenText}>多单:{canCloseValueLang}&nbsp;&nbsp;空单:{canCloseValueSort}</Text>
                        </>
                      )
                    }
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
            getPrice={newPrice}
            coinType={coinType} />
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
});

export default ContractContentView;
