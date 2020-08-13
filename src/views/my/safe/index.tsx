import React, { FC, useState } from 'react';
import { ListItem } from 'react-native-elements';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import ComLine from '../../../components/line';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';

const MySafeScreen: FC = () => {
  const [userInfo] = useGetDispatch<InState['userState']['userInfo']>('userState', 'userInfo');
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useFocusEffect(() => {
    if (userInfo.accountType === 'email') {
      setEmail(userInfo.account);
      setPhone(userInfo.spareAccount);
    } else {
      setPhone(userInfo.account);
      setEmail(userInfo.spareAccount);
    }
  });
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
        onPress={() => {
          if (!phone) navigation.navigate('bindAccount', { state: 'phone' });
        }}
        containerStyle={{
          height: 50,
        }}
        title="绑定手机号"
        rightSubtitle={
          phone || '未绑定'
        }
        rightSubtitleStyle={{
          width: 200,
          textAlign: 'right',
        }}
        bottomDivider
        chevron />
      <ListItem
        onPress={() => {
          if (!email) navigation.navigate('bindAccount', { state: 'email' });
        }}
        containerStyle={{
          height: 50,
        }}
        rightSubtitle={
          email || '未绑定'
        }
        rightSubtitleStyle={{
          width: 200,
          textAlign: 'right',
        }}
        title="绑定邮箱"
        chevron />
    </ComLayoutHead>
  );
};

export default MySafeScreen;
