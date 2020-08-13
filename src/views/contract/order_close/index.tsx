import React, { FC, useState, useEffect } from 'react';
import {
  View, TouchableNativeFeedback, Image, Text, StyleSheet,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-gesture-handler';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import ComFormButton from '../../../components/form/button';
import {
  defaultThemeBgColor, getThemeOpacity, themeWhite, themeGray, defaultThemeColor, themeTextGray,
} from '../../../config/theme';
import ajax from '../../../data/fetch';

const ContractOrderCloseScreen: FC = () => {
  const navigation = useNavigation();
  type TypeOrderCloseParams = {
    id: string|number, // 订单ID
    coinType: string; // 币种名称
    type: 0|1; // 空单0，多单1
    willType: 0|1; // 止损0，止盈1
    openPrice: string; // 持仓均价
    value: string; // 持仓数量
  };
  const { params: orderParams } = useRoute<RouteProp<{orderClose: TypeOrderCloseParams}, 'orderClose'>>();

  // 是否是市价
  // const [isMarketPrice, setIsMarketPrice] = useState(false);
  // 触发价格
  const [startPrice, setStartPrice] = useState('');
  // 执行价格
  const [doPrice, setDoPrice] = useState('');
  // 按触发价格计算
  const [willChangePriceNum, setWillChangePriceNum] = useState(0);
  const [willChangePrice, setWillChangePrice] = useState('--');

  const [loading, setLoading] = useState(false);

  const addEvent = {
    // 检查止盈/止损单
    verifyForm: () => {
      if (loading) return;
      // 判断预计是否正确
      if (willChangePriceNum > 0) {
        // 预计正确，继续提交
        addEvent.submiOrder();
      } else {
        showMessage({
          position: 'bottom',
          type: 'warning',
          message: '触发价/执行价输入有误，请检查',
        });
      }
    },
    // 提交
    submiOrder: () => {
      setLoading(true);
      ajax.post('/contract/api/v2/order/setProfitLoss', {
        price: startPrice,
        price_action: doPrice,
        types: ['止损', '止盈'][orderParams.willType],
        orderId: orderParams.id,
      }).then(data => {
        if (data.status === 200) {
          showMessage({
            position: 'bottom',
            type: 'success',
            message: data.message,
          });
          navigation.goBack();
        } else {
          showMessage({
            position: 'bottom',
            type: 'warning',
            message: data.message,
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        setLoading(false);
      });
    },
  };


  // 更新触发价格
  useEffect(() => {
    const doPriceNum = parseFloat(doPrice);
    const openPriceNum = parseFloat(orderParams.openPrice);
    const valueNum = parseFloat(orderParams.value) || 1;
    // 如果是市价
    // if (isMarketPrice) {
    //   doPriceNum = parseFloat(startPrice);
    // }
    // 获取更改价格
    const changeValue = (
      // 多单/空单
      orderParams.type === 1 ? (doPriceNum - openPriceNum) : (openPriceNum - doPriceNum)
    ) * valueNum;
    if (Number.isNaN(changeValue)) {
      setWillChangePrice('--');
      return;
    }
    // 如果是止盈
    if (orderParams.willType === 1) {
      if (changeValue > 0) {
        setWillChangePriceNum(changeValue);
        setWillChangePrice(changeValue.toFixed(2));
      } else {
        setWillChangePrice('--');
        setWillChangePriceNum(0);
      }
    }
    // 如果是止损
    if (orderParams.willType === 0) {
      if (changeValue < 0) {
        setWillChangePriceNum(Math.abs(changeValue));
        setWillChangePrice(Math.abs(changeValue).toFixed(2));
      } else {
        setWillChangePrice('--');
        setWillChangePriceNum(0);
      }
    }
  }, [doPrice, orderParams.openPrice, orderParams.value, orderParams.willType, startPrice]);

  return (
    <ComLayoutHead
      close
      headBg={defaultThemeBgColor}>
      <View style={style.boxView}>
        <View style={style.titleView}>
          <Text style={style.titleText}>
            {orderParams.coinType.replace('USDT', '/USDT')}
            {orderParams.type === 0 && '空单'}
            {orderParams.type === 1 && '多单'}
            &nbsp;&nbsp;
            {orderParams.willType === 0 && '止损'}
            {orderParams.willType === 1 && '止盈'}
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
                {/* {
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
                } */}
                <TextInput
                  style={[
                    style.inputInput,
                  ]}
                  keyboardType="number-pad"
                  placeholder="请输入执行价格"
                  value={doPrice}
                  onChange={e => setDoPrice(e.nativeEvent.text)} />
              </View>
            </View>
            <View style={style.inputBgView}>
              <Image
                style={style.inputBgImage}
                resizeMode="stretch"
                source={require('../../../assets/images/pic/btn_bg_shadow.png')} />
            </View>
          </View>
          {/* <View style={[
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
          </View> */}
        </View>
        {/* 开仓价 */}
        <Text style={style.moreText}>订单开仓价：{orderParams.openPrice}USDT</Text>
        <Text style={style.moreText}>持仓数量：{orderParams.value}{orderParams.coinType.replace('USDT', '')}</Text>
        {/* 触发价格 */}
        <Text style={style.moreText}>按触发价格将预计{['损失', '盈利'][orderParams.willType]}：{willChangePrice}USDT</Text>
        <ComFormButton
          containerStyle={{
            width: '100%',
            marginTop: 20,
          }}
          title="确定"
          onPress={() => addEvent.verifyForm()}
          loading={loading} />
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
    lineHeight: 20,
  },
});

export default ContractOrderCloseScreen;
