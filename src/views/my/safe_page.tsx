import React, { FC, useState, useEffect } from 'react';
import { ListItem } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../components/layout/head';
import ComLine from '../../components/line';

const MySafeScreen: FC = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  useEffect(() => {
    setPhone('188****8888');
    setEmail('');
  }, []);
  return (
    <ComLayoutHead title="安全中心">
      <ComLine />
      <ListItem
        onPress={() => navigation.navigate('changePass', { state: 'login' })}
        containerStyle={{
          height: 50,
        }}
        title="修改登录密码"
        bottomDivider
        chevron />
      <ListItem
        onPress={() => navigation.navigate('changePass', { state: 'pay' })}
        containerStyle={{
          height: 50,
        }}
        title="修改交易密码"
        chevron />
      <ComLine />
      <ListItem
        onPress={() => navigation.navigate('bindAccount', { state: 'phone' })}
        containerStyle={{
          height: 50,
        }}
        title="绑定手机号"
        rightSubtitle={
          phone || '未绑定'
        }
        bottomDivider
        chevron />
      <ListItem
        onPress={() => navigation.navigate('bindAccount', { state: 'email' })}
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
