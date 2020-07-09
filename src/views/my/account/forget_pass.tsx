import React, { FC, useState, useRef } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Input } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, themeGray, defaultThemeColor, defaultThemeBgColor,
} from '../../../config/theme';
import ComFormButton from '../../../components/form/button';
import { isPhone, isEmail } from '../../../tools/verify';
import ajax from '../../../data/fetch';

const AccountForgetPass: FC = () => {
  const navigation = useNavigation();
  const loading = useRef(false);
  const [account, setAccount] = useState('');

  const addEvent = {
    verfiyBeforeSend: () => {
      if (!isPhone(account) && !isEmail(account)) {
        showMessage({
          message: '账号输入错误',
          type: 'warning',
        });
        return;
      }
      if (loading.current) return;
      addEvent.send();
    },
    send: () => {
      if (loading.current) return;
      loading.current = true;
      // 发送验证码
      ajax.post('/v1/power/send_sms', {
        mobile: account,
        type: 2, // 注册短信
        mobile_area: '00',
      }).then(data => {
        if (data.status === 200) {
          navigation.navigate('AccountVerfiyCode', { type: 'forget', data: { account } });
        } else {
          showMessage({
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        loading.current = false;
      });
    },
  };

  return (
    <ComLayoutHead
      overScroll
      scrollStyle={{ backgroundColor: themeWhite, padding: 10 }}>
      <Text h4>忘记密码</Text>
      <Text style={style.codeDesc}>验证您的账户</Text>
      <Text style={style.codeNoneDesc}>我们将向您的账户地址发送验证码</Text>
      <Input
        containerStyle={style.formInputContainer}
        labelStyle={style.formInputLabel}
        inputContainerStyle={style.formInputInputContainer}
        inputStyle={style.formInputInput}
        errorStyle={{ height: 0 }}
        keyboardType="email-address"
        label="手机号或邮箱"
        placeholder="请输入手机号或邮箱"
        value={account}
        onChangeText={value => setAccount(value)} />
      <ComFormButton
        containerStyle={style.formButton}
        onPress={() => addEvent.verfiyBeforeSend()}
        title="登录" />
      <View style={style.bgImageView}>
        <Image
          resizeMode="stretch"
          style={style.bgImage}
          source={require('../../../assets/images/pic/login_bg.png')} />
      </View>
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  codeDesc: {
    paddingTop: 20,
    fontSize: 16,
    paddingBottom: 10,
  },
  codeNoneDesc: {
    fontSize: 12,
    color: themeGray,
    paddingBottom: 20,
  },
  formInputContainer: {
    paddingTop: 5,
    marginLeft: -10,
  },
  formInputLabel: {
    color: defaultThemeColor,
    fontWeight: '400',
  },
  formInputInputContainer: {
    borderBottomColor: defaultThemeBgColor,
  },
  formInputInput: {
    fontSize: 16,
    paddingLeft: 0,
  },
  formButton: {
    width: '100%',
    marginTop: 40,
  },
  bgImageView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
});

export default AccountForgetPass;
