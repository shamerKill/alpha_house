import React, { FC, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import DataScreen from './data';
import StatusBarTheme from './components/statusBar';
import theme from './config/theme';

// SplashScreen.show();
const App: FC = () => {
  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
  }, []);
  return (
    <SafeAreaView style={{ ...theme.default, flex: 1 }}>
      <StatusBarTheme />
      <DataScreen />
    </SafeAreaView>
  );
};

export default App;
