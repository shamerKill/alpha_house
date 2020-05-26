import React, {
  FC, useState, useEffect,
} from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import ComLine from '../../../components/line';
import ComFormLabel from '../../../components/form/label';
import ComFormButton from '../../../components/form/button';
import showComAlert from '../../../components/modal/alert';

const MyChangePassScreen: FC = () => {
  const route = useRoute<RouteProp<{bindAccount: { state: 'login'|'pay' }|undefined}, 'bindAccount'>>();
  const navigation = useNavigation();
  if (!route.params) {
    navigation.goBack();
    return null;
  }
  const typeTitle = route.params.state === 'login' ? '登录' : '交易';
  const typeDesc = route.params.state === 'login' ? '请输入登录密码' : '请输入6位纯数字密码';
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [pass, setPass] = useState('');
  const [rePass, setRePass] = useState('');
  const addEvent = {
    // 获取验证码
    getCode: () => {
    },
    // 验证
    verifyForm: () => {
      if (route.params?.state === 'login') addEvent.postFormLogin();
      if (route.params?.state === 'pay') addEvent.postFormPay();
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
        desc: '登录密码修改成功，请但会重新登录',
        success: {
          text: '重新登录',
          onPress: () => {
            close();
            navigation.goBack();
          },
        },
      });
    },
  };
  useEffect(() => {
    setAccount('188****8888');
  }, []);
  return (
    <ComLayoutHead title={`修改${typeTitle}密码`}>
      <ComLine height={15} />
      <ComFormLabel
        disabled
        title="绑定账户"
        placeholder="获取中"
        value={account}
        onChangeText={value => setAccount(value)} />
      <ComLine />
      <ComFormLabel
        title="验证码"
        placeholder="请输入验证码"
        getCode={addEvent.getCode}
        value={code}
        onChangeText={value => setCode(value)} />
      <ComLine />
      <ComFormLabel
        title="交易密码"
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
