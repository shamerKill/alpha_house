import React, {
  FC, useEffect, useCallback, useRef,
} from 'react';
import SplashScreen from 'react-native-splash-screen';
import { View, AppState, AppStateStatus } from 'react-native';
import FlashMessage, { showMessage } from 'react-native-flash-message';
// import KeyboardSpacer from 'react-native-keyboard-spacer';
import DataScreen from './data';
import ComModalOutBg from './components/modal/outBg';
import ComScanView from './components/scan';
import ComPhotoView from './components/scan/photo';
import CheckVersion from './components/hot_up';
import { marketSocket, CoinToCoinSocket } from './data/fetch/socket';


const App: FC = () => {
  const fristIn = useRef(true);
  const closeSplash = useCallback(() => {
    // 关闭启动图
    Promise.all([CoinToCoinSocket.successConnect(), marketSocket.successConnect()]).then(() => {
    }).catch(() => {
      showMessage({
        position: 'bottom',
        message: '请检查您的网络',
        type: 'warning',
      });
    }).finally(() => {
      SplashScreen.hide();
    });
  }, []);
  const listenerApp = useCallback((state: AppStateStatus) => {
    if (state === 'active') {
      if (fristIn.current) {
        fristIn.current = false;
        return;
      }
      if (!marketSocket.isConnect() || !CoinToCoinSocket.isConnect()) {
        SplashScreen.show();
      }
      Promise.all([
        marketSocket.sendMessageAgain(),
        CoinToCoinSocket.sendMessageAgain(),
      ]).finally(() => {
        setTimeout(SplashScreen.hide, 500);
      });
    } else {
      marketSocket.sendMessageWite();
      CoinToCoinSocket.sendMessageWite();
    }
  }, []);
  useEffect(() => {
    // 监听app是否在前台显示
    closeSplash();
    AppState.removeEventListener('change', listenerApp);
    AppState.addEventListener('change', listenerApp);
    return () => {
      AppState.removeEventListener('change', listenerApp);
    };
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
      {/* {
        Platform.OS === 'ios'
          ? <KeyboardSpacer />
          : null
      } */}
      {/* 版本号检查 */}
      <CheckVersion />
    </View>
  );
};

export default App;
