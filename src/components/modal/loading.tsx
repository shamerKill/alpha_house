import React, { FC } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { modalOutBg } from './outBg';
import { defaultThemeColor, getThemeOpacity, defaultThemeBgColor } from '../../config/theme';

const closeComLoading = () => {
  modalOutBg.outBgsetShow(false);
  modalOutBg.outBgsetChildren(null);
};

const ComModalLoading: FC<{ text: string }> = ({ text }) => {
  return (
    <View style={{
      width: '100%',
      height: '100%',
      backgroundColor: getThemeOpacity(defaultThemeBgColor, 0.7),
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <ActivityIndicator size="large" color={defaultThemeColor} />
      <Text style={{
        fontSize: 20,
        color: defaultThemeColor,
        paddingTop: 10,
      }}>
        {text}
      </Text>
    </View>
  );
};

const showComLoading = (text: string) => {
  modalOutBg.outBgsetChildren(<ComModalLoading text={text} />);
  modalOutBg.outBgsetShow(true);
  return closeComLoading;
};


export default showComLoading;
