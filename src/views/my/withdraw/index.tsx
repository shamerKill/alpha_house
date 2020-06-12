import React, { FC, useState, useEffect } from 'react';
import {
  View, Text, TouchableNativeFeedback, ImageSourcePropType, Image as StaticImage,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Image } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../../components/layout/head';
import { defaultThemeColor, themeWhite, themeGray } from '../../../config/theme';
import showSelector from '../../../components/modal/selector';
import { ComInputForm } from '../../../components/form/input';
import { showScan } from '../../../components/scan';
import showComAlert from '../../../components/modal/alert';
import ComFormButton from '../../../components/form/button';

const MyWithdrawScreen: FC = () => {
  const navigation = useNavigation();
  // 说明文字
  const descTexts = [
    '1、单笔最小提币数量为：0.002BTC,每日提币累计限额为：5BTC。',
    '2、请勿往非BTC地址转出BTC资产，否则您的资产将不可找回。',
    '3、夜间(0点~8点）提币系统将提高资金风控等级，未自动审核的提币将于9：00前处理。',
  ];
  // 币种
  const [coinName, setCoinName] = useState('');
  const [coinIcon, setCoinIcon] = useState<ImageSourcePropType>(0);
  const [coinList] = useState<{name: string; icon: ImageSourcePropType}[]>([
    { name: 'BTC', icon: require('../../../assets/images/coin/BTC.png') },
    { name: 'USDT', icon: require('../../../assets/images/coin/BTC.png') },
    { name: 'ETH', icon: require('../../../assets/images/coin/BTC.png') },
  ]);
  // 输入内容
  const [address, setAddress] = useState('');
  const [num, setNum] = useState('');
  // 可用
  const [canUse, setCanUse] = useState('');
  // 手续费
  const [free, setFree] = useState('');
  // 到账数量
  const [toNum, setToNum] = useState('');
  // 事件
  const addEvent = {
    // 选择币种
    changeCoin: () => {
      const close = showSelector({
        data: coinList.map(item => item.name),
        selected: coinName,
        onPress: (value) => {
          if (typeof value !== 'string') return;
          coinList.filter(item => item.name === value).forEach(item => {
            setCoinName(item.name);
            setCoinIcon(item.icon);
          });
          close();
        },
      });
    },
    // 扫码
    clickScan: () => {
      showScan().then(data => setAddress(data));
    },
    // 全部提现
    allWithdraw: () => {
      setNum(canUse);
    },
    // 提币按钮
    wihtdrawBtnFunc: () => {
      console.log(coinName, address, num);
      addEvent.postMessage();
    },
    // 发送提币信息
    postMessage: () => {
      const closeAlert = showComAlert({
        title: '提币申请',
        desc: '您的提币申请已提交成功，请等待审核',
        success: {
          text: '确定',
          onPress: () => {
            closeAlert();
          },
        },
        close: {
          text: '取消',
          onPress: () => {
            closeAlert();
          },
        },
      });
    },
  };
  useEffect(() => {
    setCoinName(coinList[0].name);
    setCoinIcon(coinList[0].icon);
    setCanUse('900');
    setFree('5.00');
  }, []);
  useEffect(() => {
    const willNum = Number(num) - Number(free);
    setToNum((willNum > 0 ? willNum : 0).toString());
  }, [num, free]);
  return (
    <ComLayoutHead
      rightComponent={(
        <TouchableNativeFeedback onPress={() => navigation.navigate('withdrawLog')}>
          <Text style={{ color: defaultThemeColor, fontSize: 16 }}>提币记录</Text>
        </TouchableNativeFeedback>
      )}
      title="提币">
      {/* 充值 */}
      <TouchableNativeFeedback onPress={addEvent.changeCoin}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['#826ffd', '#543dff']}
          style={{
            margin: 10,
            borderRadius: 5,
            padding: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image style={{ width: 40, height: 40 }} source={coinIcon} />
            <Text style={{ color: themeWhite, fontSize: 18, paddingLeft: 10 }}>{coinName}</Text>
          </View>
          <StaticImage
            resizeMode="contain"
            style={{ width: 20, height: 20 }}
            source={require('../../../assets/images/icons/list_more.png')} />
        </LinearGradient>
      </TouchableNativeFeedback>
      {/* 提现表单 */}
      <View style={{
        backgroundColor: themeWhite,
        paddingLeft: 10,
        paddingRight: 10,
        marginBottom: 10,
      }}>
        <ComInputForm
          value={address}
          onChange={value => setAddress(value)}
          labelText="提现地址"
          placeholder="请输入提现地址"
          right={(
            <TouchableNativeFeedback onPress={addEvent.clickScan}>
              <StaticImage
                resizeMode="contain"
                style={{ width: 20, height: 20 }}
                source={require('../../../assets/images/icons/scan.png')} />
            </TouchableNativeFeedback>
          )}
          noError />
        <ComInputForm
          keyboardType="number-pad"
          value={num}
          onChange={value => setNum(value)}
          labelText="数量"
          placeholder="请输入提现数量"
          noError
          right={(
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{
                fontSize: 16,
                lineHeight: 26,
              }}>
                {coinName}
              </Text>
              <Text style={{
                paddingLeft: 5,
                color: themeGray,
                fontSize: 18,
                lineHeight: 26,
              }}>
                |
              </Text>
              <TouchableNativeFeedback onPress={addEvent.allWithdraw}>
                <Text style={{
                  color: defaultThemeColor,
                  fontSize: 16,
                  paddingLeft: 5,
                  lineHeight: 26,
                }}>
                  全部
                </Text>
              </TouchableNativeFeedback>
            </View>
          )} />
        <Text style={{
          paddingLeft: 10,
          lineHeight: 30,
          fontSize: 14,
          color: defaultThemeColor,
        }}>
          可用&nbsp;{ canUse }
        </Text>
        <ComInputForm
          noError
          disabled
          labelText="手续费"
          value={free} />
        <ComInputForm
          disabled
          noError
          labelText="到账数量"
          value={toNum}
          right={(
            <Text style={{ fontSize: 16 }}>{coinName}</Text>
          )} />
      </View>
      {
        descTexts.map((item, index) => (
          <Text
            key={index}
            style={{
              paddingLeft: 10,
              paddingRight: 10,
              fontSize: 14,
              color: themeGray,
              lineHeight: 20,
            }}>
            {item}
          </Text>
        ))
      }
      <ComFormButton
        title="提币"
        onPress={addEvent.wihtdrawBtnFunc}
        style={{
          marginTop: 30,
          marginBottom: 30,
        }} />
    </ComLayoutHead>
  );
};

export default MyWithdrawScreen;
