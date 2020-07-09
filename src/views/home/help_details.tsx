import React, { FC, useState, useEffect } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { Text, View, Image } from 'react-native';
import ComLayoutHead from '../../components/layout/head';
import { themeWhite, defaultThemeBgColor } from '../../config/theme';
import { webViewStackResize, webViewStackImage } from '../../web/tools';
import ajax from '../../data/fetch';

const HomeHelpDetails: FC = () => {
  const { params: { id } } = useRoute<RouteProp<{'Details': { id: string }}, 'Details'>>();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  useEffect(() => {
    ajax.get(`/v1/help/help_detail?id=${id}`).then(data => {
      if (data.status === 200) {
        setTitle(data.data.title);
        setDesc(data.data.content);
      }
    }).catch(err => console.log(err));
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
