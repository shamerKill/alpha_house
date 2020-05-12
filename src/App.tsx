import React, { FC, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import DataScreen from './data';
import StatusBarTheme from './components/statusBar';
import theme from './config/theme';

// SplashScreen.show();
const App: FC = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <SafeAreaView style={{ ...theme.default, flex: 1 }}>
      <StatusBarTheme />
      <DataScreen />
    </SafeAreaView>
  );
};

export default App;
