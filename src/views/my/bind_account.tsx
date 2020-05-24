import React, { FC, useState } from 'react';
import { Text } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../components/layout/head';
import ComLine from '../../components/line';
import ComFormLabel from '../../components/form/label';
import showComAlert from '../../components/modal/alert';
import { defaultThemeColor } from '../../config/theme';
import ComFormButton from '../../components/form/button';

const MyBindAccountScreen: FC = () => {
  const route = useRoute<RouteProp<{bindAccount: { state: 'phone'|'email' }|undefined}, 'bindAccount'>>();
  const navigation = useNavigation();
  if (!route.params) {
    navigation.goBack();
    return null;
  }
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const typeTitle = route.params.state === 'phone' ? '手机' : '邮箱';
  const typeDesc = route.params.state === 'phone' ? '手机号' : '邮箱地址';
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
      const close = showComAlert({
        title: '绑定成功',
        desc: `${typeDesc}已成功绑定`,
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
    <ComLayoutHead
      title={`绑定${typeTitle}`}>
      <ComLine height={15} />
      <ComFormLabel
        title={typeDesc}
        placeholder={`请输入${typeDesc}`}
        keyboardType={route.params.state === 'phone' ? 'phone-pad' : 'email-address'}
        value={account}
        onChangeText={value => setAccount(value)} />
      <ComLine />
      <ComFormLabel
        title="验证码"
        placeholder="请输入验证码"
        keyboardType="default"
        getCode={addEvent.getCode}
        value={code}
        onChangeText={value => setCode(value)} />
      <Text style={{
        paddingTop: 10,
        color: defaultThemeColor,
        fontSize: 12,
        paddingLeft: 10,
        paddingRight: 10,
      }}>
        提示：请务必绑定常用{typeDesc}，一旦绑定不可修改
      </Text>
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

export default MyBindAccountScreen;
