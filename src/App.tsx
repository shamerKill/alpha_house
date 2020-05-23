import React, { FC, useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { View } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import DataScreen from './data';
import ComModalOutBg from './components/modal/outBg';
import ComScanView from './components/scan';

const App: FC = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <DataScreen />
      {/* message弹出框 */}
      <FlashMessage position="top" />
      {/* 弹出框 */}
      <ComModalOutBg />
      {/* 扫码 */}
      <ComScanView />
    </View>
  );
};

export default App;
