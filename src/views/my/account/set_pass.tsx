import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-elements';
import { TextInput } from 'react-native-gesture-handler';
import { showMessage } from 'react-native-flash-message';
import {
  useNavigation, StackActions, useRoute, RouteProp,
} from '@react-navigation/native';
import { getUniqueId } from 'react-native-device-info';
import ComLayoutHead from '../../../components/layout/head';
import { themeWhite, themeGray, defaultThemeBgColor } from '../../../config/theme';
import ComFormButton from '../../../components/form/button';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState, ActionsType } from '../../../data/redux/state';
import { isPass } from '../../../tools/verify';
import ajax from '../../../data/fetch';

const AccountSetPassScreen: FC = () => {
  const navigation = useNavigation();
  const loading = useRef(false);

  type paramsData = { account: string; accountType: 'email'|'phone'; upUserCode: string; verifyCode: string; };
  const route = useRoute<RouteProp<{setPass: { type: 'register' | 'forget', data?: paramsData}}, 'setPass'>>();

  const [, dispatchUserInfo] = useGetDispatch<InState['userState']['userInfo']>('userState', 'userInfo');
  const [, dispatchUserIsLogin] = useGetDispatch<InState['userState']['userIsLogin']>('userState', 'userIsLogin');

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
      if (loading.current) return;
      console.log(route.params.type);
      const result = isPass(pass);
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
      if (route.params.type === 'register') addEvent.submitRegister();
      else if (route.params.type === 'forget') addEvent.submitForget();
    },
    submitRegister: () => {
      if (!route.params.data) {
        showMessage({
          message: '数据有误，请返回重新创建',
          type: 'danger',
        });
        return;
      }
      const params = route.params.data;
      // 获取设备码
      const uniqueId = getUniqueId();
      // 提交
      const reqBody: {[key: string]: any} = {};
      // 账户
      if (params.accountType === 'email') reqBody.Email = params.account;
      else {
        const [phonePrefix, phone] = params.account.split(' ');
        reqBody.Mobile = phone;
        // 区号
        reqBody.Region = phonePrefix;
      }
      // 密码
      reqBody.Password = pass;
      // 设备码
      reqBody.DeviceInfo = uniqueId;
      // 邀请码
      reqBody.InviteCode = params.upUserCode;
      // 请求
      loading.current = true;
      ajax.post<string>('/v1/power/sign_up', reqBody, { setToken: true }).then(data => {
        if (data.status === 200) {
          addEvent.submit();
          showMessage({
            message: '注册成功，已登录',
            type: 'success',
          });
          dispatchUserInfo({
            type: ActionsType.CHANGE_USER_INFO,
            data: {
              account: params.account,
              accountType: params.accountType,
              upUserCode: params.upUserCode,
            },
          });
          dispatchUserIsLogin({
            type: ActionsType.CHANGE_USER_LOGIN,
            data: true,
          });
        } else {
          showMessage({
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(() => {
        showMessage({
          message: '用户输入有误，请重新创建',
          type: 'warning',
        });
      }).finally(() => {
        loading.current = false;
      });
    },
    submitForget: () => {
      console.log(route.params.data);
      if (!route.params.data) {
        showMessage({
          message: '数据有误，请返回重新创建',
          type: 'danger',
        });
        return;
      }
      const params = route.params.data;
      // 提交
      const reqBody: {[key: string]: any} = {};
      reqBody.Account = params.account;
      reqBody.Password = pass;
      reqBody.RePassword = rePass;
      reqBody.Code = params.verifyCode;
      loading.current = true;
      ajax.post<string>('/v1/power/edit_pass', reqBody, { setToken: true }).then(data => {
        if (data.status === 200) {
          showMessage({
            message: '修改成功，请登录',
            type: 'success',
          });
          dispatchUserIsLogin({
            type: ActionsType.CHANGE_USER_LOGIN,
            data: true,
          });
          navigation.dispatch(StackActions.popToTop());
          navigation.dispatch(StackActions.replace('Home'));
          navigation.dispatch(StackActions.push('Login'));
        } else {
          showMessage({
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(() => {
        showMessage({
          message: '用户输入有误，请重新创建',
          type: 'warning',
        });
      }).finally(() => {
        loading.current = false;
      });
    },
    // 提交
    submit: () => {
      navigation.dispatch(StackActions.popToTop());
      navigation.dispatch(StackActions.replace('Home'));
    },
  };

  useEffect(() => {
    setAccount(route.params.data?.account || '');
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
