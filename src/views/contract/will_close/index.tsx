import React, { FC, useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, TouchableNativeFeedback, Image, TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import {
  defaultThemeBgColor, themeWhite, themeGray, defaultThemeColor, themeTextGray, themeBlack,
} from '../../../config/theme';
import ComFormButton from '../../../components/form/button';

const ContractWillCloseScreen: FC = () => {
  const navigation = useNavigation();
  let { params: { id: orderId } } = useRoute<RouteProp<{orderClose: { id: string|number }}, 'orderClose'>>();
  if (typeof orderId === 'number') orderId = orderId.toString();
  // 订单数据
  const [orderInfo, setOrderInfo] = useState<{
    coinType: string; // 交易对
    orderPrice: string; // 下单价格
    orderType?: 0|1; // 多单1，空单0
  }>({
    coinType: '--',
    orderPrice: '--',
  });
  // 预设止损0｜预设止盈1
  const [willStopType, setWillStopType] = useState<0|1>(1);
  // 止盈触发价格
  const [winStartPrice, setWinStartPrice] = useState('');
  // 止盈执行价格
  const [winDoPrice, setWinDoPrice] = useState('');
  // 止损触发价
  const [lowStartPrice, setLowStartPrice] = useState('');
  // 止损执行价
  const [lowDoPrice, setLowDoPrice] = useState('');
  // 是否是市价
  const [isMarketPrice, setIsMarketPrice] = useState(false);
  // 预计更改值
  const [willChangePrice, setWillChangePrice] = useState('--');

  const addEvent = {
    changeWillType: (type: typeof willStopType) => {
      setWillStopType(type);
    },
  };

  useEffect(() => {
    setTimeout(() => {
      setOrderInfo({
        coinType: 'BTC/USDT永续',
        orderType: 0,
        orderPrice: '9123.12',
      });
    }, 1000);
    setWillChangePrice('--');
  }, []);

  return (
    <ComLayoutHead
      close
      scrollStyle={{ backgroundColor: themeWhite }}>
      <View style={style.boxView}>
        {/* 顶部 */}
        <View style={style.titleView}>
          <Text style={style.titleText}>
            {orderInfo.coinType}
            &nbsp;
            {orderInfo.orderType === 0 && '开空'}
            {orderInfo.orderType === 1 && '开多'}
          </Text>
          <TouchableNativeFeedback onPress={() => navigation.goBack()}>
            <View style={style.titleCloseView}>
              <Image
                resizeMode="contain"
                style={style.titleCloseIcon}
                source={require('../../../assets/images/icons/page_close_icon.png')} />
            </View>
          </TouchableNativeFeedback>
        </View>
        {/* 按钮列表 */}
        <View style={style.tabView}>
          <TouchableNativeFeedback onPress={() => addEvent.changeWillType(1)}>
            <View style={[
              style.tabViewBtn,
              willStopType === 1 && style.tabViewBtnSelect,
            ]}>
              <Text style={[
                style.tabViewText,
                willStopType === 1 && style.tabViewTextSelect,
              ]}>
                预设止盈
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={() => addEvent.changeWillType(0)}>
            <View style={[
              style.tabViewBtn,
              willStopType === 0 && style.tabViewBtnSelect,
            ]}>
              <Text style={[
                style.tabViewText,
                willStopType === 0 && style.tabViewTextSelect,
              ]}>
                预设止损
              </Text>
            </View>
          </TouchableNativeFeedback>
        </View>
        {/* 下单价格 */}
        <Text style={style.orderInfoPrice}>
          下单价格:&nbsp;{orderInfo.orderPrice}USDT
        </Text>
        {/* 触发价 */}
        <View style={style.inputView}>
          <View style={style.inputViewInBox}>
            <Text style={style.inputLabel}>{['止损', '止盈'][willStopType]}触发价格</Text>
            <TextInput
              style={style.inputInput}
              keyboardType="number-pad"
              placeholder="请输入触发价格"
              value={[lowStartPrice, winStartPrice][willStopType]}
              onChange={e => [setLowStartPrice, setWinStartPrice][willStopType](e.nativeEvent.text)} />
            <Text style={style.inputDesc}>USDT</Text>
          </View>
          <View style={style.inputBgView}>
            <Image
              style={style.inputBgImage}
              resizeMode="stretch"
              source={require('../../../assets/images/pic/btn_bg_shadow.png')} />
          </View>
        </View>
        {/* 执行价 */}
        <View style={style.inputBtnView}>
          <View style={[
            style.inputView,
            style.inputBtnViewLeft,
          ]}>
            <View style={style.inputViewInBox}>
              <View style={style.inputBtnViewLeftInner}>
                <Text style={style.inputLabel}>执行价格</Text>
                {
                  isMarketPrice
                    ? (<Text style={style.inputLabelMore}>以市价执行</Text>)
                    : (
                      <TextInput
                        style={[
                          style.inputInput,
                        ]}
                        keyboardType="number-pad"
                        placeholder="请输入执行价格"
                        value={[lowDoPrice, winDoPrice][willStopType]}
                        onChange={e => [setLowDoPrice, setWinDoPrice][willStopType](e.nativeEvent.text)} />
                    )
                }
              </View>
            </View>
            <View style={style.inputBgView}>
              <Image
                style={style.inputBgImage}
                resizeMode="stretch"
                source={require('../../../assets/images/pic/btn_bg_shadow.png')} />
            </View>
          </View>
          <View style={[
            style.inputView,
            style.inputBtnViewRight,
          ]}>
            <TouchableNativeFeedback onPress={() => setIsMarketPrice(state => !state)}>
              <View style={style.inputBtnViewRightInner}>
                <Text style={{
                  color: isMarketPrice ? defaultThemeColor : themeBlack,
                  fontSize: isMarketPrice ? 16 : 14,
                  fontWeight: isMarketPrice ? '900' : '400',
                }}>
                  市价
                </Text>
              </View>
            </TouchableNativeFeedback>
            <View style={style.inputBgView}>
              <Image
                style={style.inputBgImage}
                resizeMode="stretch"
                source={require('../../../assets/images/pic/btn_bg_shadow.png')} />
            </View>
          </View>
        </View>
        {/* 预计收益 */}
        <Text style={style.willPriceText}>
          预计{['损失', '收益'][willStopType]}: {willChangePrice}USDT
        </Text>
        <ComFormButton
          containerStyle={{
            width: '100%',
            marginTop: 50,
          }}
          title="确认" />
      </View>
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  boxView: {
    padding: 10,
  },
  titleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  titleCloseView: {
    padding: 10,
    marginRight: -10,
  },
  titleCloseIcon: {
    width: 20,
    height: 20,
  },
  // 按钮列表
  tabView: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  tabViewBtn: {
    height: 50,
    backgroundColor: defaultThemeBgColor,
    width: '49%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  tabViewBtnSelect: {
    backgroundColor: themeWhite,
    borderWidth: 1,
    borderColor: defaultThemeColor,
  },
  tabViewText: {
    fontSize: 16,
    color: themeGray,
  },
  tabViewTextSelect: {
    color: defaultThemeColor,
  },
  // 下单价格
  orderInfoPrice: {
    marginTop: 10,
    color: themeTextGray,
    marginBottom: 10,
  },
  // 输入框
  inputView: {
    position: 'relative',
    marginLeft: -10,
    marginRight: -10,
  },
  inputViewInBox: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: '8%',
    paddingRight: '8%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 16,
    lineHeight: 20,
    color: themeTextGray,
  },
  inputInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    height: 40,
  },
  inputDesc: {
    paddingLeft: 10,
  },
  inputBgView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  inputBgImage: {
    width: '100%',
    height: '100%',
  },
  inputBtnView: {
    flexDirection: 'row',
    paddingRight: 11,
    paddingLeft: 2,
  },
  inputBtnViewLeft: {
    flex: 1,
  },
  inputLabelMore: {
    textAlign: 'right',
    flex: 1,
    height: 40,
    lineHeight: 40,
    color: themeGray,
  },
  inputBtnViewLeftInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBtnViewRight: {
    width: 50,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBtnViewRightInner: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 预计收益
  willPriceText: {
    fontSize: 12,
    marginTop: 10,
    color: themeGray,
  },
});

export default ContractWillCloseScreen;
