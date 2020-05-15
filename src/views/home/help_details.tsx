import React, { FC, useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Text, View, Image } from 'react-native';
import ComLayoutHead from '../../components/layout/head';
import { themeWhite, defaultThemeBgColor } from '../../config/theme';
import { webViewStackResize, webViewStackImage } from '../../web/tools';

const HomeHelpDetails: FC = () => {
  const { params: { id } } = useRoute<RouteProp<{'Details': { id: string }}, 'Details'>>();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  useEffect(() => {
    setTitle('收不到短信怎么办？');
    setDesc('<p>收不到短信怎么办？</p><p>情况一：可能是短信通道暂时拥堵，您需稍等片刻，刷新手机短信</p>');
  });
  return (
    <ComLayoutHead
      border
      overScroll
      scrollStyle={{ backgroundColor: themeWhite }}
      title="帮助详情">
      <View style={{
        flexDirection: 'row',
        padding: 10,
        borderBottomColor: defaultThemeBgColor,
        borderBottomWidth: 1,
        height: 50,
        alignItems: 'center',
      }}>
        <Image
          resizeMode="contain"
          style={{ width: 20, height: 20 }}
          source={require('../../assets/images/icons/help_icon.png')} />
        <Text style={{ paddingLeft: 5, fontSize: 16 }}>{title}</Text>
      </View>
      <WebView
        style={{ flex: 1 }}
        source={{ html: `${webViewStackResize}${webViewStackImage}${desc}` }} />
    </ComLayoutHead>
  );
};

export default HomeHelpDetails;
