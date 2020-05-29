import React, { FC, useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-elements';
import { TextInput } from 'react-native-gesture-handler';
import { showMessage } from 'react-native-flash-message';
import {
  useNavigation, StackActions, useRoute, RouteProp,
} from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import { themeWhite, themeGray, defaultThemeBgColor } from '../../../config/theme';
import ComFormButton from '../../../components/form/button';

const AccountSetPassScreen: FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{setPass: { type: 'register' | 'forget' }}, 'setPass'>>();
  const [account, setAccount] = useState('');
  const [pass, setPass] = useState('');
  const [rePass, setRePass] = useState('');

  const addEvent = {
    // 输入更改
    changePass: (value: string, setValue: typeof setPass) => {
      setValue(value.replace(/[^\w]/g, ''));
    },
    // 验证
    verfiy: () => {
      console.log(route.params.type);
      const result = /\w{8,20}/.test(pass);
      if (!result) {
        showMessage({
          message: '密码输入格式错误',
          description: '密码规则:8-20位包含大小写字母/数字的密码',
          type: 'warning',
        });
        return;
      }
      if (pass !== rePass) {
        showMessage({
          message: '请检查',
          description: '两次密码输入不一致',
          type: 'warning',
        });
        return;
      }
      addEvent.submit();
    },
    // 提交
    submit: () => {
      navigation.dispatch(StackActions.popToTop());
      navigation.dispatch(StackActions.replace('Home'));
    },
  };

  useEffect(() => {
    setAccount('188****8888');
  }, []);

  return (
    <ComLayoutHead
      overScroll
      scrollStyle={{ backgroundColor: themeWhite, padding: 10 }}>
      <Text h4>设置密码</Text>
      <Text style={style.codeDesc}>用户 {account}</Text>
      <Text style={style.codeNoneDesc}>密码规则:8-20位包含大小写字母/数字的密码</Text>
      <View style={style.passView}>
        <TextInput
          secureTextEntry
          style={style.passInput}
          placeholder="请输入登录密码"
          value={pass}
          onChange={e => addEvent.changePass(e.nativeEvent.text, setPass)} />
      </View>
      <View style={style.passView}>
        <TextInput
          secureTextEntry
          style={style.passInput}
          placeholder="请再次确认登录密码"
          value={rePass}
          onChange={e => addEvent.changePass(e.nativeEvent.text, setRePass)} />
      </View>
      <ComFormButton
        containerStyle={style.submitBtn}
        onPress={() => addEvent.verfiy()}
        title="完成" />
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
    paddingTop: 10,
    fontSize: 16,
    paddingBottom: 10,
  },
  codeNoneDesc: {
    fontSize: 12,
    color: themeGray,
    paddingBottom: 20,
  },
  passView: {
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
    marginTop: 20,
    height: 40,
  },
  passInput: {
    fontSize: 16,
    height: 40,
  },
  submitBtn: {
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

export default AccountSetPassScreen;
