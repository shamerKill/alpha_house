import React, { FC, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, defaultThemeBgColor, themeBlack, defaultThemeColor,
} from '../../../config/theme';
import MyRecommendLinkScreen, { TypeMyRecommendLink } from './link';
import MyRecommendListScreen, { TypeMyRecommendList } from './list';

const MyRecommendScreen: FC = () => {
  const topBtn = [
    { text: '推荐链接', link: '', id: 1 },
    { text: '推荐列表', link: '', id: 2 },
  ];
  // 头部状态
  const [select, setSelect] = useState(1);
  // 推广链接数据
  const [recommend, setRecommend] = useState<TypeMyRecommendLink>({ link: 'loading', pic: require('../../../assets/images/pic/share_bg.png') });
  // 推荐列表数据
  const [listValue, setListValue] = useState<TypeMyRecommendList>({ allNum: '-', listArr: [] });

  const addEvent = {
    getSearch: (search: string) => {
      console.log(search);
    },
  };

  useEffect(() => {
    setTimeout(() => {
      setRecommend({
        link: 'http://127.0.0.1:5500/memory/share.jpghttp://127.0.0.1:5500/memory/share.jpg',
        pic: { uri: 'http://192.168.3.4:5500/memory/share.jpg' },
      });
      setListValue({
        allNum: '1000',
        listArr: [
          {
            upAccount: '22159951', time: '2019-10-11', status: false, selfChildren: true, id: '0',
          },
          {
            upAccount: '22159951', time: '2019-10-11', status: true, selfChildren: false, id: '1',
          },
          {
            upAccount: '22159951', time: '2019-10-11', status: true, selfChildren: true, id: '2',
          },
          {
            upAccount: '22159951', time: '2019-10-11', status: false, selfChildren: false, id: '3',
          },
          {
            upAccount: '22159951', time: '2019-10-11', status: false, selfChildren: true, id: '4',
          },
        ],
      });
    }, 1000);
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
          : <MyRecommendListScreen input={{ ...listValue, searchFunc: addEvent.getSearch }} />
      }
    </ComLayoutHead>
  );
};

export default MyRecommendScreen;
