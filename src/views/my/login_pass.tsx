import React, {
  FC, useState, useEffect,
} from 'react';
import ComLayoutHead from '../../components/layout/head';
import ComLine from '../../components/line';
import ComFormLabel from '../../components/form/label';
import ComFormButton from '../../components/form/button';
import showComAlert from '../../components/modal/alert';

const MyLoginPassScreen: FC = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [pass, setPass] = useState('');
  const [rePass, setRePass] = useState('');
  const addEvent = {
    // 获取验证码
    getCode: () => {
    },
    // 验证
    verifyForm: () => {
      addEvent.postForm();
    },
    // 提交
    postForm: () => {
      showComAlert({
        title: '修改成功',
        desc: '登录密码修改成功，请但会重新登录',
        success: {
          text: '重新登录',
          onPress: () => {},
        },
      });
    },
  };
  useEffect(() => {
    setPhone('188****8888');
  }, []);
  return (
    <ComLayoutHead title="修改登录密码">
      <ComLine />
      <ComFormLabel
        disabled
        title="手机号/邮箱"
        placeholder="获取中"
        value={phone}
        onChangeText={value => setPhone(value)} />
      <ComLine />
      <ComFormLabel
        title="验证码"
        placeholder="请输入验证码"
        getCode={addEvent.getCode}
        value={code}
        onChangeText={value => setCode(value)} />
      <ComLine />
      <ComFormLabel
        title="登录密码"
        password
        keyboardType="ascii-capable"
        placeholder="请输入登录密码"
        value={pass}
        onChangeText={value => setPass(value)} />
      <ComLine />
      <ComFormLabel
        title="确认密码"
        password
        keyboardType="ascii-capable"
        placeholder="请再次确认登录密码"
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

export default MyLoginPassScreen;
