// 充值
import React, { FC, useState, useEffect } from 'react';
import {
  View, TouchableNativeFeedback, Text, ImageSourcePropType, Image as StaticImage, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import Clipboard from '@react-native-community/clipboard';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import { defaultThemeColor, themeWhite, themeGray } from '../../../config/theme';
import showSelector from '../../../components/modal/selector';
import ajax from '../../../data/fetch';

const MyRechargeScreen: FC = () => {
  const navigation = useNavigation();
  const descArr = [
    '1、该地址仅接受BTC,请勿往该地址转入非BTC资产，包括其相关联资产，否则您的资产将无法找回。',
    '2、最小充值金额：0.001 BTC，小于该金额的充值将无法上账且无法退回。',
    '3、您充值至上述地址后，需要整个网络节点的确认，1次网络确认后到账，6次后方可提币，我们将以短信形式通知您到账情况',
  ];
  const [loading, setLoading] = useState(false);
  const [coinName, setCoinName] = useState('');
  // const [coinIcon, setCoinIcon] = useState<ImageSourcePropType>(0);
  const [qrcode, setQrcode] = useState<ImageSourcePropType>(0);
  const [address, setAddress] = useState('');
  const [coinList, setCoinList] = useState<{name: string; icon: ImageSourcePropType}[]>([
    { name: 'BTC', icon: require('../../../assets/images/coin/BTC.png') },
    { name: 'USDT', icon: require('../../../assets/images/coin/BTC.png') },
    { name: 'ETH', icon: require('../../../assets/images/coin/BTC.png') },
  ]);
  // 复制地址
  const copyAddress = (value: string) => {
    if (value) {
      Clipboard.setString(value);
      showMessage({
        message: '',
        description: '充值地址复制成功',
        type: 'success',
      });
    } else {
      showMessage({
        message: '',
        description: '数据加载中，请等待',
        type: 'warning',
      });
    }
  };
  // 选择币种
  const changeCoin = () => {
    if (loading) {
      showMessage({
        message: '数据获取中,请稍后重试',
        type: 'info',
      });
      return;
    }
    const close = showSelector({
      data: coinList.map(item => item.name),
      selected: coinName,
      onPress: (value) => {
        if (typeof value !== 'string') return;
        coinList.filter(item => item.name === value).forEach(item => {
          setCoinName(item.name);
          // setCoinIcon(item.icon);
        });
        close();
      },
    });
  };
  useEffect(() => {
    ajax.get('/v1/recharge/coin_list').then(data => {
      if (data.status === 200) {
        setCoinList(data?.data?.list?.map((item: any) => {
          return {
            name: item,
            icon: { uri: '' },
          };
        }) || []);
      } else {
        showMessage({
          message: data.message,
          type: 'warning',
        });
      }
    }).catch(err => {
      console.log(err);
    }).finally(() => {});
  }, []);
  useEffect(() => {
    setCoinName(coinList[0].name);
  }, [coinList]);
  useEffect(() => {
    setLoading(true);
    ajax.get(`/v1/recharge/get_coin?symbol=${coinName}`).then(data => {
      if (data.status === 200) {
        setAddress(data.data.address);
        setQrcode({
          uri: data.data.link,
        });
      } else {
        showMessage({
          message: data.message,
          type: 'warning',
        });
      }
    }).catch(err => {
      console.log(err);
    }).finally(() => {
      setLoading(false);
    });
  }, [coinName]);
  return (
    <ComLayoutHead
      title="充值"
      rightComponent={(
        <TouchableNativeFeedback onPress={() => navigation.navigate('rechargeLog')}>
          <Text style={{ color: defaultThemeColor, fontSize: 15 }}>充值记录</Text>
        </TouchableNativeFeedback>
      )}>
      {/* 充值 */}
      <TouchableNativeFeedback onPress={changeCoin}>
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
            {/* <Image style={{ width: 40, height: 40 }} source={coinIcon} /> */}
            <Text style={{ color: themeWhite, fontSize: 18, paddingLeft: 10 }}>{coinName}</Text>
          </View>
          <StaticImage
            resizeMode="contain"
            style={{ width: 20, height: 20 }}
            source={require('../../../assets/images/icons/list_more.png')} />
        </LinearGradient>
      </TouchableNativeFeedback>

      {/* 二维码 */}
      <View style={{
        alignSelf: 'center',
        width: 200,
        height: 200,
        padding: 10,
        marginTop: 20,
        marginBottom: 10,
        backgroundColor: themeWhite,
      }}>
        {
          loading
            ? (
              <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
              }}>
                <ActivityIndicator color={defaultThemeColor} />
              </View>
            )
            : (
              <Image
                source={qrcode}
                resizeMode="stretch"
                style={{
                  width: '100%',
                  height: '100%',
                }} />
            )
        }
      </View>

      {/* 地址 */}
      <TouchableNativeFeedback onPress={() => copyAddress(address)}>
        <View style={{
          backgroundColor: themeWhite,
          margin: 10,
          borderRadius: 5,
          paddingTop: 15,
          paddingBottom: 15,
          paddingLeft: 20,
          paddingRight: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
          <Text
            numberOfLines={1}
            style={{
              width: '70%',
              fontSize: 16,
            }}>
            { address }
          </Text>
          <Text style={{ color: defaultThemeColor, fontSize: 16 }}>复制地址</Text>
        </View>
      </TouchableNativeFeedback>

      {/* 更多说明 */}
      <View style={{ padding: 10 }}>
        {
          descArr.map((item, index) => (
            <Text
              key={index}
              style={{
                color: themeGray,
                lineHeight: 22,
                paddingTop: 5,
              }}>
              { item }
            </Text>
          ))
        }
      </View>

    </ComLayoutHead>
  );
};

export default MyRechargeScreen;
