import React, {
  FC, useState, useEffect,
} from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import ComLine from '../../../components/line';
import ComFormLabel from '../../../components/form/label';
import ComFormButton from '../../../components/form/button';
import showComAlert from '../../../components/modal/alert';
import { isPass, isVerifyCode, isPayPass } from '../../../tools/verify';
import ajax from '../../../data/fetch';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';

const MyChangePassScreen: FC = () => {
  const route = useRoute<RouteProp<{bindAccount: { state: 'login'|'pay' }|undefined}, 'bindAccount'>>();
  const [userAccount] = useGetDispatch<InState['userState']['userInfo']['account']>('userState', 'userInfo', 'account');
  const navigation = useNavigation();
  if (!route.params) {
    navigation.goBack();
    return null;
  }
  const typeTitle = route.params.state === 'login' ? '登录' : '交易';
  const typeDesc = route.params.state === 'login' ? '8-20位包含大小写字母/数字' : '请输入6位纯数字密码';
  const [code, setCode] = useState('');
  const [pass, setPass] = useState('');
  const [rePass, setRePass] = useState('');
  const addEvent = {
    // 获取验证码
    getCode: (close: any) => {
      const fmData = { type: 3, mobile_area: '00' }; // 交易密码
      if (route.params?.state === 'login') fmData.type = 2;
      ajax.post('/v1/power/sms_send', fmData).then(data => {
        if (data.status !== 200) {
          showMessage({
            message: data.message,
            type: 'warning',
          });
          close && close();
        }
      }).catch(err => {
        console.log(err);
      });
    },
    // 验证
    verifyForm: () => {
      if (!route.params?.state) return;
      if (route.params.state === 'login') {
        if (!isPass(pass) || pass !== rePass) {
          addEvent.errorMessage('密码输入有误');
          return;
        }
        if (!isVerifyCode(code)) {
          addEvent.errorMessage('验证码输入有误');
          return;
        }
      }
      if (route.params.state === 'pay') {
        if (!isPayPass(pass) || pass !== rePass) {
          addEvent.errorMessage('密码输入有误');
          return;
        }
        if (!isVerifyCode(code)) {
          addEvent.errorMessage('验证码输入有误');
          return;
        }
      }
      const reqUri = {
        pay: '/v1/power/update_tran_pass',
        login: '/v1/power/edit_pass_in',
      }[route.params.state];
      ajax.post(reqUri, {
        Password: pass,
        RePassword: rePass,
        Code: code,
      }).then(data => {
        if (data.status === 200) {
          if (route.params?.state === 'login') addEvent.postFormLogin();
          if (route.params?.state === 'pay') addEvent.postFormPay();
        } else {
          addEvent.errorMessage(data.message);
        }
      }).catch(err => {
        console.log(err);
      });
    },
    errorMessage: (message: string) => {
      showMessage({
        message,
        type: 'warning',
      });
    },
    // 提交交易密码
    postFormPay: () => {
      const close = showComAlert({
        title: '修改成功',
        desc: '交易密码修改成功',
        success: {
          text: '确定',
          onPress: () => {
            close();
            navigation.goBack();
          },
        },
      });
    },
    // 提交登录密码
    postFormLogin: () => {
      const close = showComAlert({
        title: '修改成功',
        desc: '登录密码修改成功',
        success: {
          text: '确定',
          onPress: () => {
            close();
            navigation.goBack();
          },
        },
      });
    },
  };
  return (
    <ComLayoutHead title={`修改${typeTitle}密码`}>
      <ComLine height={15} />
      <ComFormLabel
        disabled
        title="绑定账户"
        placeholder="获取中"
        value={userAccount} />
      <ComLine />
      <ComFormLabel
        title="验证码"
        placeholder="请输入验证码"
        getCode={addEvent.getCode}
        value={code}
        onChangeText={value => setCode(value)} />
      <ComLine />
      <ComFormLabel
        title={`${route.params.state === 'login' ? '登录' : '交易'}密码`}
        password
        keyboardType={route.params.state === 'login' ? 'ascii-capable' : 'number-pad'}
        placeholder={typeDesc}
        value={pass}
        onChangeText={value => setPass(value)} />
      <ComLine />
      <ComFormLabel
        title="确认密码"
        password
        keyboardType={route.params.state === 'login' ? 'ascii-capable' : 'number-pad'}
        placeholder={`请再次确认${typeTitle}密码`}
        value={rePass}
        onChangeText={value => setRePass(value)} />
      <ComFormButton
        title="确定"
        onPress={addEvent.verifyForm}
        style={{
          marginTop: 40,
          marginBottom: 30,
        }} />
    </ComLayoutHead>
  );
};

export default MyChangePassScreen;
