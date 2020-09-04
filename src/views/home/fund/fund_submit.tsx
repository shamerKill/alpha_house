import React, {
  FC, useState, useCallback, useEffect,
} from 'react';
import {
  View, Text, TextInput, Image,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useRoute, RouteProp } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import ComFormButton from '../../../components/form/button';
import { themeTextGray, defaultThemeColor, defaultThemeBgColor } from '../../../config/theme';
import showComAlert from '../../../components/modal/alert';
import { biNumberToSymbol } from '../../../tools/number';
import ajax from '../../../data/fetch';

const HomeFundSubmit: FC = () => {
  const route = useRoute<RouteProp<{fund: { surplusNum: string; }}, 'fund'>>();
  const { surplusNum } = route.params;

  const [value, setValue] = useState('');
  const [canUse, setCanUse] = useState(0);
  const [loading, setLoading] = useState(false);

  const verfiyValue = useCallback(() => {
    if (loading) return;
    const valueNum = parseFloat(value);
    if (!(valueNum > 50000)) {
      showMessage({
        position: 'bottom',
        type: 'warning',
        message: '最小认购数量为50000USDT',
      });
    } else if (valueNum > canUse) {
      showMessage({
        position: 'bottom',
        type: 'warning',
        message: '可用余额不足',
      });
    } else {
      alertValue(valueNum);
    }
  }, [value]);
  const alertValue = useCallback((valueNum: number) => {
    const close = showComAlert({
      title: '认购确认',
      desc: `是否需要认购${valueNum}USDT的AlfaEX年化基金?`,
      success: {
        text: '认购',
        onPress: () => {
          close();
          submit(valueNum);
        },
      },
      close: {
        text: '考虑一下',
        onPress: () => close(),
      },
    });
  }, []);
  const submit = useCallback((valueNum: number) => {
    setLoading(true);
    ajax.post('/v1/fund/fund_buy', {
      number: valueNum,
    }).then(data => {
      if (data.status === 200) {
        showMessage({
          position: 'bottom',
          type: 'success',
          message: '认购成功',
        });
        setValue('');
        setCanUse(state => state - valueNum);
      } else {
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
  }, []);

  useEffect(() => {
    ajax.get('/v1/fund/coin_number').then(data => {
      if (data.status === 200) {
        setCanUse(data.data);
      }
    }).catch(err => {
      console.log(err);
    });
  }, []);

  return (
    <ComLayoutHead
      title="认购">
      <Text style={{
        padding: 10,
        paddingLeft: 20,
        fontSize: 14,
        color: themeTextGray,
      }}>
        AIfaEX年化基金(剩余额度：<Text style={{ color: defaultThemeColor }}>{biNumberToSymbol(surplusNum)}USDT</Text>)
      </Text>
      <View style={{
        position: 'relative',
        width: '100%',
        height: 100,
      }}>
        <View style={{
          position: 'absolute',
          top: 0,
          left: '5%',
          width: '90%',
          height: '100%',
        }}>
          <View style={{
            flexDirection: 'row',
            borderBottomColor: defaultThemeBgColor,
            borderBottomWidth: 1,
            height: 50,
            alignItems: 'center',
          }}>
            <TextInput
              style={{ flex: 1 }}
              value={value}
              onChange={e => setValue(e.nativeEvent.text.replace(/[^\d]/g, ''))}
              placeholder="请输入认购数量" />
            <Text style={{ fontSize: 16 }}>USDT</Text>
          </View>
          <Text style={{ fontSize: 16, lineHeight: 50 }}>账户可用余额：{canUse}</Text>
        </View>
        <Image
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
          }}
          source={require('../../../assets/images/pic/card_bg.png')} />
      </View>
      <ComFormButton
        containerStyle={{ marginTop: 30 }}
        title="立即认购"
        loading={loading}
        onPress={verfiyValue} />
    </ComLayoutHead>
  );
};

export default HomeFundSubmit;
