import React, { FC, useState, useEffect } from 'react';
import { Text } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import ComLine from '../../../components/line';
import ComFormLabel from '../../../components/form/label';
import showComAlert from '../../../components/modal/alert';
import { defaultThemeColor } from '../../../config/theme';
import ComFormButton from '../../../components/form/button';
import { isEmail, isPhone } from '../../../tools/verify';
import ajax from '../../../data/fetch';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState, ActionsType } from '../../../data/redux/state';

const MyBindAccountScreen: FC = () => {
  const [, dispatchUserInfo] = useGetDispatch<InState['userState']['userInfo']>('userState', 'userInfo');
  const route = useRoute<RouteProp<{bindAccount: { state: 'phone'|'email' }|undefined}, 'bindAccount'>>();
  const navigation = useNavigation();
  if (!route.params) {
    navigation.goBack();
    return null;
  }
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [canGetCode, setCanGetCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const typeTitle = route.params.state === 'phone' ? '手机' : '邮箱';
  const typeDesc = route.params.state === 'phone' ? '手机号' : '邮箱地址';
  const addEvent = {
    // 获取验证码
    getCode: () => {
      ajax.post('/v1/power/send_sms', {
        mobile: account,
        type: 4, // 注册短信
        mobile_area: '86',
      }).then(data => {
        if (data.status !== 200) {
          showMessage({
            position: 'bottom',
            type: 'warning',
            message: data.message,
          });
        }
      }).catch(err => {
        console.log(err);
      });
    },
    // 验证
    verifyForm: () => {
      if (loading) return;
      if (route.params?.state === 'email') {
        if (!isEmail(account)) {
          showMessage({
            position: 'bottom',
            type: 'warning',
            message: '邮箱输入有误',
          });
          return;
        }
      } else if (route.params?.state === 'phone') {
        if (!isPhone(account)) {
          showMessage({
            position: 'bottom',
            type: 'warning',
            message: '手机号输入有误',
          });
          return;
        }
      }
      setLoading(true);
      ajax.post('/v1/power/bind_account', {
        account, code,
      }).then(data => {
        if (data.status === 200) addEvent.postForm();
        else {
          showMessage({
            position: 'bottom',
            type: 'warning',
            message: data.message,
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        setLoading(false);
      });
    },
    // 提交
    postForm: () => {
      dispatchUserInfo({
        type: ActionsType.CHANGE_USER_INFO,
        data: {
          spareAccount: account,
        },
      });
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

  useEffect(() => {
    if (route.params?.state === 'email') {
      if (isEmail(account)) setCanGetCode(true);
    } else if (route.params?.state === 'phone') {
      if (isPhone(account)) setCanGetCode(true);
    }
  }, [account]);

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
        canGetCode={canGetCode}
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
        loading={loading}
        style={{
          marginTop: 40,
          marginBottom: 30,
        }} />
    </ComLayoutHead>
  );
};

export default MyBindAccountScreen;
