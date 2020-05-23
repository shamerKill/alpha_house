import React, { FC, useState, useEffect } from 'react';
import { ListItem } from 'react-native-elements';
import ComLayoutHead from '../../components/layout/head';

const MySafeScreen: FC = () => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  useEffect(() => {
    setPhone('188****8888');
    setEmail('');
  }, []);
  return (
    <ComLayoutHead title="安全中心">
      <ListItem
        containerStyle={{
          marginTop: 10,
          height: 50,
        }}
        title="修改登录密码"
        bottomDivider
        chevron />
      <ListItem
        containerStyle={{
          height: 50,
        }}
        title="修改交易密码"
        chevron />
      <ListItem
        containerStyle={{
          marginTop: 10,
          height: 50,
        }}
        title="绑定手机号"
        rightSubtitle={
          phone || '未绑定'
        }
        bottomDivider
        chevron />
      <ListItem
        containerStyle={{
          height: 50,
        }}
        rightSubtitle={
          email || '未绑定'
        }
        title="绑定邮箱"
        chevron />
    </ComLayoutHead>
  );
};

export default MySafeScreen;
