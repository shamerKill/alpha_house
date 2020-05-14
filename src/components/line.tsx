import React, { FC } from 'react';
import { View } from 'react-native';
import { defaultThemeBgColor } from '../config/theme';

const ComLine: FC<{margin?: number, color?: string, height?: number}> = ({
  color = defaultThemeBgColor,
  height = 10,
}) => {
  return (
    <View style={{
      backgroundColor: color,
      height,
    }} />
  );
};

export default ComLine;
