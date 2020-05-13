import React, { FC, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import DataScreen from './data';
import StatusBarTheme from './components/statusBar';
import AppStyle from './style';

const App: FC = () => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
  }, []);
  return (
    <SafeAreaView style={AppStyle.AppView}>
      <StatusBarTheme />
      <DataScreen />
    </SafeAreaView>
  );
};

export default App;
