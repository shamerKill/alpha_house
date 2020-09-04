import React, { FC, useEffect, ReactElement } from 'react';
import {
  View, StyleProp, ViewStyle, TextProps, TouchableNativeFeedback, Image, ScrollViewProps, Dimensions,
} from 'react-native';
import { Header, HeaderSubComponent } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import {
  themeBlack, themeWhite, defaultThemeBgColor,
} from '../../config/theme';
import ComLine from '../line';
import { modalOutBg } from '../modal/outBg';

interface InLayoutHeadProps {
  title?: string;
  close?: true;
  barStyleLight?: true;
  headBg?: string;
  border?: true;
  scrollStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  overScroll?: true;
  animated?: true;
  onScroll?: ScrollViewProps['onScroll'],
  rightComponent?: HeaderSubComponent,
  leftComponent?: HeaderSubComponent,
  bottomCompoent?: ReactElement;
  line?: true;
  onMomentumScrollEnd?: ScrollViewProps['onMomentumScrollEnd'];
  // 页面是否定位
  position?: true;
  positionTop?: number;
}

const ComLayoutHead: FC<InLayoutHeadProps> = ({
  children,
  close,
  barStyleLight,
  headBg,
  border,
  title,
  scrollStyle,
  containerStyle,
  overScroll,
  onScroll,
  animated,
  rightComponent,
  leftComponent,
  line,
  onMomentumScrollEnd,
  position,
  positionTop,
  bottomCompoent,
}) => {
  const navigation = useNavigation();
  // 获取页面高度
  const windowHeight = Dimensions.get('window').height;
  // 返回事件
  const goBackPage = () => navigation.goBack();
  const containerStyleDefault = () => {
    const resultStyle: StyleProp<ViewStyle> = {
      backgroundColor: themeWhite,
      borderBottomColor: themeWhite,
      height: 90,
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
  };
  useEffect(() => {
    // 更改页面的时候隐藏弹窗
    const addListenerEvent = () => {
      modalOutBg.outBgsetShow(false);
    };
    navigation.addListener('state', addListenerEvent);
    return () => navigation.removeListener('state', addListenerEvent);
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: themeWhite, position: 'relative' }}>
      <Header
        // 标题
        rightComponent={rightComponent}
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
          if (leftComponent) return leftComponent;
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
            animated,
            backgroundColor: headBg || '#00000000',
            barStyle: barStyleLight ? 'light-content' : 'dark-content',
          }
        }
        // 头部盒子样式
        containerStyle={[
          containerStyleDefault(),
          containerStyle,
        ]} />
      {
        line
          ? <ComLine />
          : null
      }
      <View style={[
        {
          flex: 1,
        },
        position && {
          position: 'absolute',
          width: '100%',
          height: windowHeight - (positionTop || 40),
          top: (positionTop || 40),
          left: 0,
        },
      ]}>
        {
          overScroll
            ? (
              <View style={({ flex: 1, backgroundColor: defaultThemeBgColor, ...scrollStyle })}>
                { children }
              </View>
            )
            : (
              <ScrollView
                onMomentumScrollEnd={onMomentumScrollEnd}
                scrollEventThrottle={16}
                onScroll={onScroll}
                style={({ flex: 1, backgroundColor: defaultThemeBgColor, ...scrollStyle })}>
                { children }
              </ScrollView>
            )
        }
        {
          bottomCompoent
        }
      </View>
    </View>
  );
};

export default ComLayoutHead;
