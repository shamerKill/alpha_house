import React, { FC, useState, useEffect } from 'react';
import {
  View, Text, TouchableNativeFeedback, Image, StyleSheet,
} from 'react-native';
import { useNavigation, StackActions } from '@react-navigation/native';
import { Input } from 'react-native-elements';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, themeTextGray, defaultThemeColor, defaultThemeBgColor,
} from '../../../config/theme';
import ComFormButton from '../../../components/form/button';

const LoginScreen: FC = () => {
  const navigation = useNavigation();

  // 语言
  const [language, setLanguage] = useState('');
  // 账号密码
  const [account, setAccount] = useState('');
  const [pass, setPass] = useState('');

  const addEvent = {
    verfiyBeforeSend: () => {
      console.log('检查数据');
      addEvent.send();
    },
    send: () => {
      navigation.dispatch(StackActions.popToTop());
      navigation.dispatch(StackActions.replace('Home'));
    },
    goToLink: (link: string, obj?: object) => {
      navigation.navigate(link, obj);
    },
  };


  useEffect(() => {
    setLanguage('中文简体');
  }, []);

  return (
    <ComLayoutHead
      overScroll
      scrollStyle={{
        backgroundColor: themeWhite,
        position: 'relative',
        justifyContent: 'center',
      }}
      rightComponent={(
          // 头部选择语言
        <TouchableNativeFeedback onPress={() => addEvent.goToLink('settingValue', { type: 4 })}>
          <View style={style.topRouteView}>
            <Text style={style.topRouteViewText}>{language}</Text>
            <Image
              resizeMode="contain"
              style={style.topRouteViewImage}
              source={require('../../../assets/images/icons/list_more.png')} />
          </View>
        </TouchableNativeFeedback>
      )}>
      <View style={style.formView}>
        <Text style={style.title}>登录</Text>
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
        <Input
          secureTextEntry
          containerStyle={style.formInputContainer}
          labelStyle={style.formInputLabel}
          inputContainerStyle={style.formInputInputContainer}
          inputStyle={style.formInputInput}
          errorStyle={{ height: 0 }}
          label="密码"
          placeholder="请输入密码"
          value={pass}
          onChangeText={value => setPass(value)} />
        <View style={style.formForgetView}>
          <TouchableNativeFeedback onPress={() => addEvent.goToLink('AccountForgetPass')}>
            <Text style={style.formForgetText}>忘记密码?</Text>
          </TouchableNativeFeedback>
        </View>
        <ComFormButton
          containerStyle={style.formButton}
          onPress={() => addEvent.verfiyBeforeSend()}
          title="登录" />
        <View style={style.formRegisterView}>
          <View style={style.formRegisterText}>
            <Text>没有账号?</Text>
            <TouchableNativeFeedback onPress={() => addEvent.goToLink('Register')}>
              <Text style={style.formRegisterTextLink}>马上注册</Text>
            </TouchableNativeFeedback>
          </View>
        </View>
      </View>
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
  topRouteView: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  topRouteViewText: {
    fontSize: 16,
    color: themeTextGray,
    width: 80,
    textAlign: 'right',
  },
  topRouteViewImage: {
    width: 16,
    height: 16,
    marginLeft: 5,
  },
  formView: {
    marginBottom: 140,
    paddingLeft: 10,
    paddingRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingLeft: 10,
    paddingBottom: 30,
  },
  formInputContainer: {
    paddingTop: 5,
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
  },
  formForgetView: {
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  formForgetText: {
    color: defaultThemeColor,
    paddingTop: 10,
    paddingBottom: 10,
  },
  formRegisterView: {
    paddingTop: 10,
  },
  formRegisterText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formRegisterTextLink: {
    color: defaultThemeColor,
    paddingLeft: 10,
    lineHeight: 40,
  },
  formButton: {
    width: '100%',
    marginBottom: 20,
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

export default LoginScreen;
