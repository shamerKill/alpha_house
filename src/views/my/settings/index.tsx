import React, { FC, useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ImageSourcePropType, Image as StaticImage, TouchableNativeFeedback,
} from 'react-native';
import { Image } from 'react-native-elements';
import ComLayoutHead from '../../../components/layout/head';
import ComFormButton from '../../../components/form/button';
import { themeWhite, defaultThemeBgColor } from '../../../config/theme';
import ComLine from '../../../components/line';
import { useGoToWithLogin } from '../../../tools/routeTools';
import showComAlert from '../../../components/modal/alert';

export const setListArr = [
  '头像', '昵称', '个人简介', '所在地', '语言版本',
];

const MySettingScreen: FC = () => {
  const moreImageSource = require('../../../assets/images/icons/list_more.png');
  const goToWithLogin = useGoToWithLogin();

  const [head, setHead] = useState<ImageSourcePropType>(require('../../../assets/images/memory/user_head.png'));
  const [nickName, setNickName] = useState('');
  const [desc, setDesc] = useState('');
  const [site, setSite] = useState('');
  const [language, setLanguage] = useState('');

  const mapArrAdd = [
    { pic: head },
    { text: nickName },
    { text: desc },
    { text: site },
    { text: language },
  ];
  const mapArr = setListArr.map((item, index) => ({
    title: item,
    ...mapArrAdd[index],
  }));

  const addEvent = {
    signOut: () => {
      const close = showComAlert({
        title: '退出确认',
        desc: '是否需要退出当前账号？',
        success: {
          text: '退出登录',
          onPress: () => {
            console.log('退出登录');
          },
        },
        close: {
          text: '保持登录',
          onPress: () => {
            close();
          },
        },
      });
    },
  };

  useEffect(() => {
    setHead(require('../../../assets/images/memory/user_head.png'));
    setNickName('这是我的昵称');
    setDesc('这是我的个人简介你的简介是什么这是我的个人简介你的简介是什么');
    setSite('中国');
    setLanguage('中文简体');
  }, []);

  return (
    <ComLayoutHead title="设置">
      <View style={style.whiteView}>
        {
          mapArr.map((item, index) => (
            <View key={index} style={style.lineView}>
              <Text style={style.lineViewTitle}>{item.title}</Text>
              <TouchableNativeFeedback onPress={() => goToWithLogin('settingValue', { type: index })}>
                <View style={style.lineViewContext}>
                  {
                  item.pic ? (
                    <Image
                      resizeMode="stretch"
                      style={style.linViewPic}
                      source={item.pic} />
                  ) : null
                }
                  {
                  item.text ? (
                    <Text
                      numberOfLines={1}
                      style={style.linViewText}>
                      {item.text}
                    </Text>
                  ) : null
                }
                  <StaticImage
                    style={style.lineViewMore}
                    resizeMode="contain"
                    source={moreImageSource} />
                </View>
              </TouchableNativeFeedback>
            </View>
          ))
        }
      </View>
      <ComLine />
      <ComFormButton
        onPress={() => addEvent.signOut()}
        style={style.submitButton}
        title="退出登录" />
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  whiteView: {
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: themeWhite,
  },
  lineView: {
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 5,
    justifyContent: 'space-between',
  },
  lineViewTitle: {
    fontSize: 16,
    flex: 2,
  },
  lineViewContext: {
    flex: 7,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
  },
  linViewPic: {
    width: 40,
    height: 40,
  },
  linViewText: {
    flex: 1,
    textAlign: 'right',
  },
  lineViewMore: {
    marginLeft: 5,
    width: 14,
    height: 14,
  },
  submitButton: {
    marginTop: 30,
  },
});

export default MySettingScreen;
