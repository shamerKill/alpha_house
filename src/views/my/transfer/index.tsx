import React, { FC, useState, useEffect } from 'react';
import {
  View, Image, StatusBar, StyleSheet, Text, TouchableNativeFeedback, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import {
  themeWhite, getThemeOpacity, defaultThemeBgColor, themeGray, themeBlack, defaultThemeColor,
} from '../../../config/theme';
import ComFormButton from '../../../components/form/button';
import showSelector from '../../../components/modal/selector';
import ajax from '../../../data/fetch';

const MyTransferScreen: FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // 划转币种
  const [coinType, setCoinType] = useState('USDT');
  // 来自账户
  const [fromAccount, setFromAccount] = useState('币币账户');
  // 前往账户
  const [toAccount, setToAccunt] = useState('USDT合约账户');
  // 到账数量
  const [changeValue, setChangeValue] = useState('');
  // 最多可转数量
  const [maxValueObj, setMaxValueObj] = useState<{fromAccount: string; toAccount: string;}>({ fromAccount: '--', toAccount: '--' });
  const [maxValue, setMaxValue] = useState<string>('--');

  const addEvent = {
    // 选择币种
    selectCoinType: () => {
      const coinArr = ['USDT'];
      const close = showSelector({
        data: coinArr,
        selected: coinType,
        onPress: (data) => {
          if (typeof data !== 'string') return;
          if (data === coinType) return;
          setCoinType(data);
          close();
        },
      });
    },
    // 选择账户类型
    selectAccountType: (type: 'to'|'from') => {
      navigation.navigate('transferAccounts');
    },
    // 反划转户管道
    reverseAccounts: () => {
      const data = fromAccount;
      setFromAccount(toAccount);
      setToAccunt(data);
      showMessage({
        position: 'bottom',
        message: '',
        description: '已切换',
        type: 'success',
      });
      setMaxValueObj(state => ({
        toAccount: state.fromAccount,
        fromAccount: state.toAccount,
      }));
    },
    // 更改划转数量
    valueIputChange: (text: string) => {
      const result = text.replace(/[^\w|.]/g, '');
      setChangeValue(result);
    },
    // 设置为全部
    setAllValue: () => {
      if (parseFloat(maxValue)) {
        setChangeValue(maxValue);
      } else {
        setChangeValue('0');
      }
    },
    // 发送交易
    sendTrans: () => {
      if (loading) {
        showMessage({
          position: 'bottom',
          message: '账户划转中...',
          type: 'warning',
        });
        return;
      }
      if ((parseFloat(changeValue) || 0) <= 0) {
        showMessage({
          position: 'bottom',
          message: '请输入正确划转数量',
          type: 'warning',
        });
        return;
      }
      if (parseFloat(changeValue) > parseFloat(maxValueObj.fromAccount)) {
        showMessage({
          position: 'bottom',
          message: '划转数量不能大于最多可划转数量',
          type: 'warning',
        });
        return;
      }
      setLoading(true);
      // type划转方向 1: 币币账户向usdt永续合约账户划转 2: usdt永续合约账户向币币账户划转
      ajax.post('/contract/api/v1/bian/transfer_account', {
        num: changeValue,
        symbol: coinType,
        type: fromAccount === '币币账户' ? '1' : '2',
      }).then(data => {
        if (data.status === 200) {
          setMaxValueObj(state => ({
            ...state,
            fromAccount: `${parseFloat(state.fromAccount) - parseFloat(changeValue)}`,
          }));
          showMessage({
            position: 'bottom',
            message: '划转成功',
            type: 'success',
          });
          setChangeValue('');
        } else {
          showMessage({
            position: 'bottom',
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        setLoading(false);
      });
    },
  };

  useEffect(() => {
    setMaxValue(maxValueObj.fromAccount);
    if (parseFloat(changeValue) > parseFloat(maxValueObj.fromAccount)) {
      setChangeValue(maxValueObj.fromAccount);
    }
  }, [maxValueObj]);

  useEffect(() => {
    ajax.get('/contract/api/v1/bian/transfer_account_view').then(data => {
      if (data.status === 200) {
        setMaxValueObj({
          toAccount: `${data.data.usdtAsset.account}`,
          fromAccount: `${data.data.coinAsset.account}`,
        });
      }
    }).catch(err => {
      console.log(err);
    });
  }, []);

  return (
    <View style={style.pageView}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content" />
      <View style={style.bgView}>
        <Image
          style={style.bgViewImage}
          resizeMode="stretch"
          source={require('../../../assets/images/pic/transfer_bg.png')} />
      </View>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          {/* 返回键 */}
          <TouchableNativeFeedback onPress={() => navigation.goBack()}>
            <View style={style.backView}>
              <Image
                resizeMode="contain"
                style={style.backImage}
                source={require('../../../assets/images/icons/back_white.png')} />
            </View>
          </TouchableNativeFeedback>
          {/* 标题 */}
          <View style={style.titleView}>
            <Text style={style.titleTitle}>划转</Text>
            {/* <TouchableNativeFeedback onPress={() => navigation.navigate('transferLogs')}>
              <View style={style.titleLogsView}>
                <Text style={style.titleLogsText}>划转记录</Text>
              </View>
            </TouchableNativeFeedback> */}
          </View>
          {/* 划转币种 */}
          <TouchableNativeFeedback onPress={addEvent.selectCoinType}>
            <View style={style.coinTypeView}>
              <Text style={style.coinTypeDesc}>选择划转币种</Text>
              <View style={style.coinTypeRight}>
                <Text style={style.coinTypeCoin}>{coinType}</Text>
                <View style={style.coinTypeMore}>
                  <Image
                    style={style.coinTypeMoreIcon}
                    resizeMode="contain"
                    source={require('../../../assets/images/icons/list_more.png')} />
                </View>
              </View>
            </View>
          </TouchableNativeFeedback>
          {/* 从什么到什么 */}
          <View style={style.accountView}>
            <View style={style.accountViewInner}>
              <View style={style.accountViewLeft}>
                <View style={style.accountViewList}>
                  <Text style={style.accountViewDesc}>从</Text>
                  <TouchableNativeFeedback onPress={() => addEvent.selectAccountType('from')}>
                    <Text style={style.accountViewText}>{fromAccount}</Text>
                  </TouchableNativeFeedback>
                </View>
                <View style={style.accountViewBr} />
                <View style={style.accountViewList}>
                  <Text style={style.accountViewDesc}>到</Text>
                  <TouchableNativeFeedback onPress={() => addEvent.selectAccountType('to')}>
                    <Text style={style.accountViewText}>{toAccount}</Text>
                  </TouchableNativeFeedback>
                </View>
              </View>
              <TouchableNativeFeedback onPress={addEvent.reverseAccounts}>
                <View style={style.accountViewRight}>
                  <Image
                    style={style.accountViewIcon}
                    resizeMode="contain"
                    source={require('../../../assets/images/icons/transfer_change.png')} />
                </View>
              </TouchableNativeFeedback>
            </View>
            <View style={style.accountViewBg}>
              <Image
                style={style.accountViewBgImage}
                resizeMode="stretch"
                source={require('../../../assets/images/pic/card_bg.png')} />
            </View>
          </View>
          {/* 划转数量 */}
          <View style={style.valueView}>
            <View style={style.valueViewInner}>
              <Text style={style.valueLabel}>划转数量({coinType})</Text>
              <View style={style.valueInputView}>
                {
                  changeValue === '' && <Text style={style.valueInputPlaceholder}>0.00</Text>
                }
                <TextInput
                  style={style.valueInput}
                  keyboardType="decimal-pad"
                  value={changeValue}
                  onChange={e => addEvent.valueIputChange(e.nativeEvent.text)} />
              </View>
              <View style={style.valueBottom}>
                <Text style={style.valueDesc}>最多可划转{maxValue}</Text>
                <TouchableNativeFeedback onPress={() => addEvent.setAllValue()}>
                  <View style={style.valueAllBtn}>
                    <Text style={style.valueAllText}>全部</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            </View>
            <View style={style.accountViewBg}>
              <Image
                style={style.accountViewBgImage}
                resizeMode="stretch"
                source={require('../../../assets/images/pic/card_bg.png')} />
            </View>
          </View>
          <ComFormButton
            containerStyle={style.submitBtn}
            title={loading ? '划转中' : '划转'}
            loading={loading}
            onPress={addEvent.sendTrans} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const style = StyleSheet.create({
  pageView: {
    flex: 1,
    position: 'relative',
  },
  bgView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 250,
  },
  bgViewImage: {
    width: '100%',
    height: '100%',
  },
  // 返回键
  backView: {
    padding: 10,
    width: 60,
  },
  backImage: {
    width: 25,
    height: 25,
  },
  // 标题
  titleView: {
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  titleTitle: {
    color: themeWhite,
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleLogsView: {
    padding: 10,
    marginRight: -10,
    marginBottom: -10,
  },
  titleLogsText: {
    color: getThemeOpacity(themeWhite, 0.6),
  },
  // 划转币种
  coinTypeView: {
    margin: 10,
    backgroundColor: getThemeOpacity(themeWhite, 0.1),
    borderRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  coinTypeDesc: {
    color: themeWhite,
    fontSize: 16,
  },
  coinTypeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinTypeCoin: {
    color: themeWhite,
    fontSize: 16,
  },
  coinTypeMore: {
    paddingLeft: 5,
  },
  coinTypeMoreIcon: {
    width: 14,
    height: 14,
  },
  // 划转账户更改
  accountView: {
    position: 'relative',
    height: 140,
  },
  accountViewInner: {
    height: '100%',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  accountViewLeft: {
    flex: 1,
  },
  accountViewRight: {
    width: 50,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountViewList: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  accountViewBr: {
    height: 1,
    width: '100%',
    backgroundColor: defaultThemeBgColor,
  },
  accountViewDesc: {
    paddingRight: 20,
    color: themeGray,
    fontSize: 12,
  },
  accountViewText: {
    fontSize: 16,
    color: themeBlack,
    flex: 1,
    height: 40,
    lineHeight: 40,
  },
  accountViewIcon: {
    width: 30,
    height: 30,
  },
  accountViewBg: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    zIndex: -1,
  },
  accountViewBgImage: {
    height: '100%',
    width: '100%',
  },
  // 划转数量
  valueView: {
    position: 'relative',
  },
  valueViewInner: {
    padding: 20,
  },
  valueLabel: {
    color: themeGray,
    paddingBottom: 10,
  },
  valueInputView: {
    position: 'relative',
  },
  valueInputPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    lineHeight: 40,
    fontSize: 16,
    fontWeight: 'bold',
    color: themeGray,
    paddingLeft: 5,
  },
  valueInput: {
    height: 40,
    fontSize: 16,
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  valueBottom: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueDesc: {
    fontSize: 12,
    color: themeBlack,
  },
  valueAllBtn: {
    padding: 10,
    marginTop: -10,
    marginRight: -10,
  },
  valueAllText: {
    color: defaultThemeColor,
  },
  submitBtn: {
    marginTop: 20,
    width: '90%',
  },
});

export default MyTransferScreen;
