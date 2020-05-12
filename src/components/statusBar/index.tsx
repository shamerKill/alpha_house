import React, { FC } from 'react';
import { StatusBar } from 'react-native';
import { defaultThemeBarColor } from '../../config/theme';

const StatusBarTheme: FC<{ bgColor?: string; }> = ({ bgColor }) => {
  return (
    <StatusBar
      animated
      translucent
      barStyle="dark-content"
      backgroundColor={bgColor || defaultThemeBarColor} />
  );
};

export default StatusBarTheme;
