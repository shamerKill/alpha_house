import React, { FC, useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { View, Platform } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import DataScreen from './data';
import ComModalOutBg from './components/modal/outBg';
import ComScanView from './components/scan';
import ComPhotoView from './components/scan/photo';
import CheckVersion from './components/hot_up';


const App: FC = () => {
  useEffect(() => {
    // 关闭启动图
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
      {/* 拍照 */}
      <ComPhotoView />
      {/* 处理ios输入键盘遮挡 */}
      {
        Platform.OS === 'ios'
          ? <KeyboardSpacer />
          : null
      }
      {/* 版本号检查 */}
      <CheckVersion />
    </View>
  );
};

export default App;
