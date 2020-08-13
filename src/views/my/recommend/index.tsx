import React, { FC, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, defaultThemeBgColor, themeBlack, defaultThemeColor,
} from '../../../config/theme';
import MyRecommendLinkScreen, { TypeMyRecommendLink } from './link';
import MyRecommendListScreen from './list';
import ajax from '../../../data/fetch';

const MyRecommendScreen: FC = () => {
  const topBtn = [
    { text: '邀请链接', link: '', id: 1 },
    { text: '邀请人列表', link: '', id: 2 },
  ];
  // 头部状态
  const [select, setSelect] = useState(1);
  // 推广链接数据
  const [recommend, setRecommend] = useState<TypeMyRecommendLink>({ link: 'loading', pic: require('../../../assets/images/pic/share_bg.jpg') });

  useEffect(() => {
    ajax.get('/v1/user/invite').then(data => {
      if (data.status === 200) {
        setRecommend({
          link: data.data.qrcodeUrl,
          pic: { uri: `${data.data.qrcodeFile}?type=1` },
        });
      } else {
        showMessage({
          position: 'bottom',
          message: data.message,
          type: 'warning',
        });
      }
    }).catch(err => {
      console.log(err);
    });
  }, []);
  return (
    <ComLayoutHead
      title="我的邀请"
      overScroll
      scrollStyle={{
        backgroundColor: themeWhite,
      }}>
      <View style={{
        height: 50,
        flexDirection: 'row',
        borderBottomColor: defaultThemeBgColor,
        borderBottomWidth: 1,
      }}>
        {
          topBtn.map(item => (
            <View
              style={{
                height: 50,
                flex: 1,
              }}
              key={item.id}>
              <TouchableNativeFeedback
                onPress={() => setSelect(item.id)}>
                <Text style={[{
                  lineHeight: 50,
                  textAlign: 'center',
                  fontSize: 16,
                  color: themeBlack,
                }, select === item.id && {
                  color: defaultThemeColor,
                  fontWeight: 'bold',
                }]}>
                  {item.text}
                </Text>
              </TouchableNativeFeedback>
            </View>
          ))
        }
      </View>
      {
        select === 1
          ? <MyRecommendLinkScreen input={recommend} />
          : <MyRecommendListScreen />
      }
    </ComLayoutHead>
  );
};

export default MyRecommendScreen;
