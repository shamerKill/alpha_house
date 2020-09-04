import React, {
  FC, useEffect, useState, useRef,
} from 'react';
import {
  View, Image, StyleSheet, Text, TouchableNativeFeedback, SafeAreaView, ScrollView, Animated,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { TypeLeftOutList } from './type';
import { modalOutBg } from '../../../components/modal/outBg';
import {
  themeWhite, defaultThemeColor, defaultThemeBgColor, themeBlack, themeGray, themeGreen, themeRed, themeMoreBlue, getThemeOpacity,
} from '../../../config/theme';
import Socket, { marketSocket } from '../../../data/fetch/socket';
import { useGoToWithLogin } from '../../../tools/routeTools';
import ComFormButton from '../../../components/form/button';

export const ContractHeadLeftView: FC<{
  coinType: string;
  leftList: TypeLeftOutList[];
  changeCoin: (id: TypeLeftOutList['id']) => void;
  goToWithLogin: ReturnType<typeof useGoToWithLogin>}> = ({
  coinType,
  leftList,
  changeCoin,
  goToWithLogin,
}) => {
  const animatedValue = useRef(new Animated.Value(-400));

  const [list, setList] = useState(leftList);

  const addEvent = {
    changeCoinType: (id: TypeLeftOutList['id']) => {
      changeCoin(id);
      modalOutBg.outBgsetShow(false);
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
      setList(result);
    };
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
    return () => {
      if (subSocket.current) return;
      subSocket.current = true;
      if (socket.current) {
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(tickerImg);
      }
    };
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
            list?.map(item => {
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
          <ComFormButton
            style={{ marginTop: 20 }}
            title="查看总持仓"
            onPress={() => {
              modalOutBg.outBgsetShow(false);
              goToWithLogin(
                'ContractAllPosition',
                {
                  coins: list.map(item => item.id),
                },
              );
            }} />
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
};

const ContractHeadView: FC<{
  coinType: string;
  leftList: TypeLeftOutList[];
  changeCallback: (data: { coinType?: string; contractType?: 0|1|2 }) => void;
}> = ({
  coinType,
  leftList,
  changeCallback,
}) => {
  const goToWithLogin = useGoToWithLogin();
  const [showMore, setShowMore] = useState(false);

  const addEvent = {
    // 显示左侧内容
    showLeftChange: () => {
      modalOutBg.outBgsetChildren(<ContractHeadLeftView
        changeCoin={(id) => addEvent.goToLink(id)}
        leftList={leftList}
        coinType={coinType}
        goToWithLogin={goToWithLogin} />);
      modalOutBg.outBgsetShow(true);
      modalOutBg.outBgCanClose(true);
    },
    // 前往页面
    goToLink: (id: TypeLeftOutList['id']) => {
      if (typeof id === 'string') changeCallback({ coinType: id });
      else changeCallback({ coinType: id });
    },
    // 资金转入
    assetChange: () => {
      setShowMore(false);
      goToWithLogin('transfer');
    },
    // 合约计算
    contractComput: () => {
      setShowMore(false);
      showMessage({
        position: 'bottom',
        message: '功能暂未开放，敬请期待',
        type: 'info',
      });
    },
  };

  return (
    <View style={style.headView}>
      <TouchableNativeFeedback onPress={() => addEvent.showLeftChange()}>
        <View style={style.headLeftView}>
          <Image
            style={style.headLeftIcon}
            resizeMode="contain"
            source={require('../../../assets/images/icons/contract_show_left.png')} />
          <Text style={style.headLeftText}>
            {coinType}
          </Text>
        </View>
      </TouchableNativeFeedback>
      <View style={style.headRightView}>
        <TouchableNativeFeedback onPress={() => goToWithLogin('MarketKline', { name: coinType })}>
          <View style={style.headRightIconView}>
            <Image
              style={style.headRgihtIcon}
              resizeMode="contain"
              source={require('../../../assets/images/icons/contract_kline.png')} />
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => setShowMore(state => !state)}>
          <View style={style.headRightIconView}>
            <Image
              style={style.headRgihtIcon}
              resizeMode="contain"
              source={require('../../../assets/images/icons/contract_more.png')} />
          </View>
        </TouchableNativeFeedback>
      </View>
      {
        showMore && (
          <View style={style.moreView}>
            <TouchableNativeFeedback onPress={() => addEvent.assetChange()}>
              <View style={style.moreViewList}>
                <Image
                  style={style.moreViewIcon}
                  resizeMode="contain"
                  source={require('../../../assets/images/icons/contract_input.png')} />
                <Text style={style.moreViewText}>资金转入</Text>
              </View>
            </TouchableNativeFeedback>
            {/* <View style={style.moreViewLine} />
            <TouchableNativeFeedback onPress={addEvent.contractComput}>
              <View style={style.moreViewList}>
                <Image
                  style={style.moreViewIcon}
                  resizeMode="contain"
                  source={require('../../../assets/images/icons/contract_counter.png')} />
                <Text style={style.moreViewText}>合约计算器</Text>
              </View>
            </TouchableNativeFeedback> */}
            <View style={style.moreViewTop} />
          </View>
        )
      }
    </View>
  );
};

const style = StyleSheet.create({
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
});

export default ContractHeadView;
