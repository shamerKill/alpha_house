import React, { FC } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Header } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import { defaultThemeBgColor, themeGray } from '../../config/theme';

interface InLayoutHeadProps {
  title?: string;
  close?: true;
  barStyleLight?: true;
  headBg?: string;
  border?: true;
}

// TODO: 需要写标题
const ComLayoutHead: FC<InLayoutHeadProps> = ({
  children,
  close,
  barStyleLight,
  headBg,
  border,
}) => {
  return (
    <View>
      <Header
        statusBarProps={
          {
            translucent: true,
            backgroundColor: headBg || '#00000000',
            barStyle: barStyleLight ? 'light-content' : 'dark-content',
          }
        }
        containerStyle={(() => {
          const resultStyle: StyleProp<ViewStyle> = {
            backgroundColor: defaultThemeBgColor,
          };
          if (close) {
            resultStyle.height = 0;
            resultStyle.backgroundColor = defaultThemeBgColor;
          }
          if (headBg) {
            resultStyle.backgroundColor = headBg;
          }
          if (border) {
            resultStyle.borderBottomColor = themeGray;
            resultStyle.borderBottomWidth = 1;
          }
          return resultStyle;
        })()} />
      <ScrollView>
        { children }
      </ScrollView>
    </View>
  );
};

export default ComLayoutHead;
