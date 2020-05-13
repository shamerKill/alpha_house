import React, { FC } from 'react';
import { View } from 'react-native';
import StatusBarTheme from '../../components/statusBar';
import { themeWhite } from '../../config/theme';
import homeStyle from './style';

const HomeScreen: FC = () => {
  return (
    <View style={homeStyle.homeView}>
      <StatusBarTheme bgColor={themeWhite} />
    </View>
  );
};

export default HomeScreen;
