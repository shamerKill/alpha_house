import React, { FC, useState, useEffect } from 'react';
import {
  View, ScrollViewProps, ImageSourcePropType, Text, TouchableNativeFeedback, Image as StaticImage,
} from 'react-native';
import { Image, ListItem } from 'react-native-elements';
import { showMessage } from 'react-native-flash-message';
import Clipboard from '@react-native-community/clipboard';
import { useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../components/layout/head';
import { themeGray } from '../../config/theme';


const MyScreen: FC = () => {
  // 头部颜色
  const [statusBar, setStatusBar] = useState('#ccc9fe');
  const navigation = useNavigation();
  // 个人资产按钮
  const userMoneyBtns = [
    { icon: require('../../assets/images/icons/user_center_add.png'), name: '充值', link: 'recharge' },
    { icon: require('../../assets/images/icons/user_center_cut.png'), name: '提币', link: 'withdraw' },
    { icon: require('../../assets/images/icons/user_center_change.png'), name: '转账', link: 'realname' },
  ];
  // 主要显示按钮
  const centerShowBtns = [
    { icon: require('../../assets/images/icons/user_center_center.png'), name: '安全中心', link: 'safePage' },
    { icon: require('../../assets/images/icons/user_center_order.png'), name: '账单明细', link: 'orderInfo' },
    { icon: require('../../assets/images/icons/user_center_friend.png'), name: '我的邀请', link: 'recommend' },
  ];
  // 更多链接
  const moreList = [
    { name: '跟单管理', link: 'Home' },
    { name: '在线客服', link: 'Home' },
    { name: '建议反馈', link: 'Home' },
  ];
  // 事件
  const addEvent: {
    onScroll: ScrollViewProps['onScroll']; // 页面滚动事件
    onCopy: (value: string) => void; // 复制内容事件
    goTo: (link: string) => void; // 前往页面
  } = {
    onScroll(e) {
      if (e.nativeEvent.contentOffset.y > 200) setStatusBar('#f6f6fd');
      else setStatusBar('#ccc9fe');
    },
    onCopy(value) {
      Clipboard.setString(value);
      showMessage({
        message: '',
        description: '个人ID复制成功',
        type: 'success',
      });
    },
    goTo(link) {
      navigation.navigate(link);
    },
  };
  // 用户信息
  const [userHead, setUserHead] = useState<ImageSourcePropType>(0);
  const [userPhone, setUserPhone] = useState('');
  const [userId, setUserId] = useState('');
  // 用户资产
  const [userBTC, setUserBTC] = useState('');
  const [userRMB, setUserRMB] = useState('');
  useEffect(() => {
    setUserHead(require('../../assets/images/memory/user_head.png'));
    setUserPhone('188****8888');
    setUserId('18556226');
    setUserBTC('10086');
  });
  useEffect(() => {
    setUserRMB((Number(userBTC) * 10000).toFixed(2));
  }, [userBTC]);
  return (
    <ComLayoutHead
      close
      animated
      headBg={statusBar}
      onScroll={addEvent.onScroll}
      scrollStyle={{ backgroundColor: '#f5f6fd' }}>
      {/* 头部背景 */}
      <View
        style={{
          height: 300,
          width: '100%',
          backgroundColor: '#f6f6fd',
          zIndex: -1,
          position: 'absolute',
        }}>
        <StaticImage
          style={{ width: '100%', height: '100%' }}
          source={require('../../assets/images/pic/user_center_bg.png')}
          resizeMode="stretch" />
      </View>
      {/* 头部 */}
      <View style={{
        paddingLeft: 20,
        paddingRight: 20,
        height: 150,
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
      }}>
        {/* 头像 */}
        <Image
          source={userHead}
          resizeMode="stretch"
          style={{
            width: 60, height: 60,
          }} />
        {/* 身份信息 */}
        <View>
          <Text style={{
            paddingLeft: 10,
            fontSize: 28,
          }}>{userPhone}
          </Text>
          <TouchableNativeFeedback onPress={() => addEvent.onCopy(userId)}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <StaticImage
                style={{
                  width: 100,
                  height: 40,
                }}
                resizeMode="contain"
                source={require('../../assets/images/icons/user_center_auth.png')} />
              <Text style={{
                marginLeft: -5,
                fontSize: 15,
                paddingRight: 5,
              }}>
                ID: {userId}
              </Text>
              <StaticImage
                style={{
                  width: 14,
                  height: 14,
                }}
                resizeMode="contain"
                source={require('../../assets/images/icons/user_center_copy.png')} />
            </View>
          </TouchableNativeFeedback>
        </View>
        {/* 设置 */}
        <TouchableNativeFeedback onPress={() => addEvent.goTo('Home')}>
          <View style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 35,
            right: 10,
          }}>
            <StaticImage
              style={{
                width: 20,
                height: 20,
              }}
              source={require('../../assets/images/icons/user_center_setting.png')} />
          </View>
        </TouchableNativeFeedback>
      </View>

      {/* 资产显示 */}
      <View style={{
        position: 'relative',
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: -20,
        width: '100%',
      }}>
        <View style={{
          position: 'absolute',
          top: 0,
          left: 10,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}>
          <StaticImage
            style={{
              width: '100%',
              height: '100%',
            }}
            resizeMode="stretch"
            source={require('../../assets/images/pic/user_center_bg_box.png')} />
        </View>

        {/* 个人资产 */}
        <View style={{ paddingLeft: 20, paddingRight: 20 }}>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#7b85b2' }}>
              总折合资产
            </Text>
            <StaticImage style={{ width: 12, height: 12 }} source={require('../../assets/images/icons/list_more.png')} />
          </View>

          <Text style={{
            fontWeight: '700',
            fontSize: 24,
            paddingTop: 10,
          }}>
            {userBTC}&nbsp;&nbsp;BTC
          </Text>
          <Text style={{
            fontSize: 15,
            color: themeGray,
          }}>
            &asymp;{userRMB}CNY
          </Text>

          <View style={{
            flexDirection: 'row',
            paddingTop: 10,
            justifyContent: 'space-between',
            paddingBottom: 20,
          }}>
            {
              userMoneyBtns.map((item, index) => (
                <TouchableNativeFeedback key={index} onPress={() => addEvent.goTo(item.link)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingLeft: 10,
                      paddingRight: 10,
                      paddingTop: 5,
                      paddingBottom: 5,
                    }}>
                    <StaticImage
                      style={{
                        width: 20,
                        height: 20,
                      }}
                      resizeMode="contain"
                      source={item.icon} />
                    <Text style={{
                      fontSize: 16,
                      paddingLeft: 5,
                    }}>
                      {item.name}
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              ))
            }
          </View>
        </View>
      </View>

      {/* 图标链接 */}
      <View style={{
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        {
          centerShowBtns.map((item, index) => (
            <TouchableNativeFeedback key={index} onPress={() => addEvent.goTo(item.link)}>
              <View style={{
                width: '30%',
                position: 'relative',
                alignItems: 'center',
                marginTop: 10,
              }}>
                <StaticImage
                  source={item.icon}
                  resizeMode="contain"
                  style={{
                    width: 30,
                    height: 50,
                  }} />
                <StaticImage
                  source={require('../../assets/images/icons/user_center_bt_bg.png')}
                  resizeMode="contain"
                  style={{
                    width: 50,
                    height: 50,
                    marginTop: -18,
                  }} />
                <Text style={{
                  fontSize: 16,
                  paddingBottom: 10,
                }}>
                  {item.name}
                </Text>
                <StaticImage
                  source={require('../../assets/images/pic/user_center_btns_bg.png')}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: -1,
                  }} />
              </View>
            </TouchableNativeFeedback>
          ))
        }
      </View>

      {/* 跟单按钮 */}
      <TouchableNativeFeedback onPress={() => addEvent.goTo('Home')}>
        <StaticImage
          source={require('../../assets/images/pic/user_center_with.png')}
          resizeMode="contain"
          style={{
            width: '100%',
            height: 120,
            marginTop: -10,
          }} />
      </TouchableNativeFeedback>

      {/* 更多链接 */}
      <View style={{
        paddingLeft: 10,
        paddingRight: 10,
      }}>
        {
          moreList.map((item, index) => (
            <TouchableNativeFeedback onPress={() => addEvent.goTo(item.link)} key={index}>
              <ListItem
                title={item.name}
                titleStyle={{ fontSize: 16 }}
                containerStyle={{ backgroundColor: 'rgba(255,255,255,0)' }}
                bottomDivider
                rightAvatar={(
                  <StaticImage
                    style={{ width: 14, height: 14 }}
                    resizeMode="contain"
                    source={require('../../assets/images/icons/list_more.png')} />
              )} />
            </TouchableNativeFeedback>
          ))
        }
      </View>
    </ComLayoutHead>
  );
};

export default MyScreen;
