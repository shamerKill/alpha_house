import React, { FC, useState, useEffect } from 'react';
import {
  View, TouchableNativeFeedback, Image, Text, StyleSheet,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-gesture-handler';
import ComLayoutHead from '../../../components/layout/head';
import ComFormButton from '../../../components/form/button';
import {
  defaultThemeBgColor, getThemeOpacity, themeWhite, themeGray, defaultThemeColor, themeTextGray, themeBlack,
} from '../../../config/theme';

const ContractOrderCloseScreen: FC = () => {
  const navigation = useNavigation();
  let { params: { id: orderId } } = useRoute<RouteProp<{orderClose: { id: string|number }}, 'orderClose'>>();
  if (typeof orderId === 'number') orderId = orderId.toString();

  // 订单数据
  const [orderInfo, setOrderInfo] = useState<{
    coinType: string; // 交易对
    orderType?: 0|1; // 多单1，空单0
    stopType?: 0|1; // 止盈1，止损0
    number: number; // 可平手数
  }>({
    coinType: '--',
    number: 0,
  });
  // 是否是市价
  const [isMarketPrice, setIsMarketPrice] = useState(false);
  // 触发价格
  const [startPrice, setStartPrice] = useState('');
  // 执行价格
  const [doPrice, setDoPrice] = useState('');
  // 数量
  const [doValue, setDoValue] = useState('');
  // 按触发价格
  const [willChangePrice, setWillChangePrice] = useState('--');

  useEffect(() => {
    setTimeout(() => {
      setOrderInfo({
        coinType: 'BTC/USDT永续',
        orderType: 0,
        stopType: 1,
        number: 12,
      });
      setWillChangePrice('+123');
    }, 1000);
  }, []);

  return (
    <ComLayoutHead
      close
      headBg={defaultThemeBgColor}>
      <View style={style.boxView}>
        <View style={style.titleView}>
          <Text style={style.titleText}>
            {orderInfo.coinType}
            {orderInfo.orderType === 0 && '空单'}
            {orderInfo.orderType === 1 && '多单'}
            &nbsp;&nbsp;
            {orderInfo.stopType === 0 && '止损'}
            {orderInfo.stopType === 1 && '止盈'}
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
        {/* 输入框 */}
        <View style={style.inputView}>
          <View style={style.inputViewInBox}>
            <Text style={style.inputLabel}>触发价格</Text>
            <TextInput
              style={style.inputInput}
              keyboardType="number-pad"
              placeholder="请输入触发价格"
              value={startPrice}
              onChange={e => setStartPrice(e.nativeEvent.text)} />
            <Text style={style.inputDesc}>USDT</Text>
          </View>
          <View style={style.inputBgView}>
            <Image
              style={style.inputBgImage}
              resizeMode="stretch"
              source={require('../../../assets/images/pic/btn_bg_shadow.png')} />
          </View>
        </View>
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
                        value={doPrice}
                        onChange={e => setDoPrice(e.nativeEvent.text)} />
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
        <View style={style.inputView}>
          <View style={style.inputViewInBox}>
            <Text style={style.inputLabel}>数量</Text>
            <TextInput
              style={style.inputInput}
              keyboardType="number-pad"
              placeholder={`可平手数${orderInfo.number}`}
              value={doValue}
              onChange={e => setDoValue(e.nativeEvent.text)} />
            <Text style={style.inputDesc}>手</Text>
          </View>
          <View style={style.inputBgView}>
            <Image
              style={style.inputBgImage}
              resizeMode="stretch"
              source={require('../../../assets/images/pic/btn_bg_shadow.png')} />
          </View>
        </View>
        {/* 百分比选择 */}
        <View style={style.btnsListBox}>
          {
          ['20', '40', '60', '80', '100'].map(item => (
            <TouchableNativeFeedback key={item}>
              <View style={style.btnsListBtn}>
                <Text style={style.btnsListText}>
                  {item}%
                </Text>
              </View>
            </TouchableNativeFeedback>
          ))
        }
        </View>
        {/* 触发价格 */}
        <Text style={style.moreText}>按触发价格将：{willChangePrice}USDT</Text>
        <ComFormButton
          containerStyle={{
            width: '100%',
          }}
          title="确定" />
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
  btnsListBox: {
    marginTop: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnsListBtn: {
    width: '18%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getThemeOpacity(themeWhite, 0.6),
    borderRadius: 3,
    borderWidth: 1,
    borderColor: getThemeOpacity(defaultThemeColor, 0.2),
    borderStyle: 'dashed',
  },
  btnsListText: {
    color: themeGray,
  },
  moreText: {
    fontSize: 12,
    color: themeTextGray,
    marginBottom: 30,
  },
});

export default ContractOrderCloseScreen;
