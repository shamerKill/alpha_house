import React, { FC } from 'react';
import {
  View, StyleProp, ViewStyle, TextProps, TouchableNativeFeedback, Image,
} from 'react-native';
import { Header } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import {
  themeBlack, themeWhite, defaultThemeBgColor,
} from '../../config/theme';

interface InLayoutHeadProps {
  title?: string;
  close?: true;
  barStyleLight?: true;
  headBg?: string;
  border?: true;
  scrollStyle?: ViewStyle;
  overScroll?: true;
}

const ComLayoutHead: FC<InLayoutHeadProps> = ({
  children,
  close,
  barStyleLight,
  headBg,
  border,
  title,
  scrollStyle,
  overScroll,
}) => {
  const navigation = useNavigation();
  // 返回事件
  const goBackPage = () => navigation.goBack();
  return (
    <View style={{ flex: 1 }}>
      <Header
        // 标题
        centerComponent={((): TextProps & { text: string } | {} => {
          return title ? {
            text: title,
            style: {
              color: themeBlack,
              fontSize: 20,
            },
          } : {};
        })()}
        // 左侧组件
        leftComponent={(() => {
          if (close) return undefined;
          return (
            <TouchableNativeFeedback onPress={goBackPage}>
              <View style={{
                width: 60, height: 40, justifyContent: 'center', marginLeft: -10, paddingLeft: 10,
              }}>
                <Image
                  style={{ width: 20, height: 20 }}
                  resizeMode="contain"
                  source={require('../../assets/images/icons/head_back.png')} />
              </View>
            </TouchableNativeFeedback>
          );
        })()}
        // 头部状态
        statusBarProps={
          {
            translucent: true,
            backgroundColor: headBg || '#00000000',
            barStyle: barStyleLight ? 'light-content' : 'dark-content',
          }
        }
        // 头部盒子样式
        containerStyle={(() => {
          const resultStyle: StyleProp<ViewStyle> = {
            backgroundColor: themeWhite,
          };
          if (close) {
            resultStyle.height = 0;
            resultStyle.backgroundColor = themeWhite;
          }
          if (headBg) {
            resultStyle.backgroundColor = headBg;
          }
          if (border) {
            resultStyle.borderBottomColor = defaultThemeBgColor;
            resultStyle.borderBottomWidth = 1;
          }
          return resultStyle;
        })()} />
      {
        overScroll
          ? (
            <View style={({ flex: 1, backgroundColor: defaultThemeBgColor, ...scrollStyle })}>
              { children }
            </View>
          )
          : (
            <ScrollView style={({ flex: 1, backgroundColor: defaultThemeBgColor, ...scrollStyle })}>
              { children }
            </ScrollView>
          )
      }

    </View>
  );
};

export default ComLayoutHead;
