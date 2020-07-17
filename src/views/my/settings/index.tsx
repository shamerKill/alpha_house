import React, { FC, useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, ImageSourcePropType, Image as StaticImage, TouchableNativeFeedback,
} from 'react-native';
import { Image } from 'react-native-elements';
import { useNavigation, StackActions } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import ComFormButton from '../../../components/form/button';
import { themeWhite, defaultThemeBgColor } from '../../../config/theme';
import ComLine from '../../../components/line';
import { useGoToWithLogin } from '../../../tools/routeTools';
import showComAlert from '../../../components/modal/alert';
import ajax from '../../../data/fetch';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState, ActionsType } from '../../../data/redux/state';
import { defaultUserInfoState } from '../../../data/redux/state/user';
import getHeadImage from '../../../tools/getHeagImg';

export const setListArr = [
  '头像', '昵称', '个人简介', '所在地', '语言版本',
];

const MySettingScreen: FC = () => {
  const moreImageSource = require('../../../assets/images/icons/list_more.png');
  const goToWithLogin = useGoToWithLogin();
  const navigation = useNavigation();


  const [userInfoState, dispatchUserInfo] = useGetDispatch<InState['userState']['userInfo']>('userState', 'userInfo');
  const [, dispatchUserIsLogin] = useGetDispatch<InState['userState']['userIsLogin']>('userState', 'userIsLogin');
  const [pageRoute] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');

  const [head, setHead] = useState<ImageSourcePropType|null>(null);
  const [nickName, setNickName] = useState(userInfoState.nickname);
  const [desc, setDesc] = useState(userInfoState.introduce);
  const [site, setSite] = useState(userInfoState.location);
  const [language, setLanguage] = useState(userInfoState.language);

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
            addEvent.signOutSend();
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
    signOutSend: () => {
      ajax.get('/v1/power/login_out').then(data => {
        if (data.status === 200) {
          navigation.dispatch(StackActions.replace('Login'));
          showMessage({
            position: 'bottom',
            message: '退出成功',
            type: 'success',
          });
          dispatchUserInfo({
            type: ActionsType.CHANGE_USER_INFO,
            data: {
              ...defaultUserInfoState,
            },
          });
          dispatchUserIsLogin({
            type: ActionsType.CHANGE_USER_LOGIN,
            data: false,
          });
        } else {
          showMessage({
            position: 'bottom',
            message: data.message,
            type: 'warning',
          });
          navigation.navigate('Login');
        }
      }).catch((err) => {
        console.log(err);
      });
    },
  };

  useEffect(() => {
    // 获取数据
    ajax.get('/v1/user/profile').then(data => {
      if (data.status === 200) {
        setHead(getHeadImage()[Number(data.data.headimg)]);
        setNickName(data.data.nickname);
        setDesc(data.data.description);
        setSite(data.data.location);
        setLanguage('中文简体');
        dispatchUserInfo({
          type: ActionsType.CHANGE_USER_INFO,
          data: {
            avatar: getHeadImage()[Number(data.data.headimg)],
            nickname: data.data.nickname,
            introduce: data.data.description,
            location: data.data.location,
          },
        });
      }
    }).catch(err => {
      console.log(err);
    });
  }, []);

  useEffect(() => {
    if (pageRoute === 'settings') {
      setHead(userInfoState.avatar);
      setNickName(userInfoState.nickname);
      setDesc(userInfoState.introduce);
      setSite(userInfoState.location);
    }
  }, [pageRoute]);

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
                    <View style={{ borderRadius: 20, overflow: 'hidden' }}>
                      <Image
                        resizeMode="stretch"
                        style={style.linViewPic}
                        source={item.pic} />
                    </View>
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
