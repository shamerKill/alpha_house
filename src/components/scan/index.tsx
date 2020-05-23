// 扫码
import React, { FC, useState, useEffect } from 'react';
import { View, StatusBar, Text, BackHandler, Animated, Easing } from 'react-native';
import { RNCamera, RNCameraProps } from 'react-native-camera';
import { defaultThemeColor } from '../../config/theme';

let changeViewScan: React.Dispatch<React.SetStateAction<boolean>> | null = null;
let timer = 0;
let changeViewData: { data: string } = {
  data: ''
};

const ComScanView: FC = () => {
  const viewLife = new Animated.Value(0);
  const moveAnim = new Animated.Value(0);
  const [viewScan, setViewScan] = useState(false);
  changeViewScan = setViewScan;
  const onBarCodeRead: RNCameraProps['onBarCodeRead'] = (result) => {
    changeViewData.data = result.data;
  };
  const startAnimation = () => {
    moveAnim.setValue(0);
    Animated.timing(
      moveAnim,
      {
          toValue: -250,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
      }
    ).start(() => startAnimation());
  };
  useEffect(() => {
    if (viewScan) {
      Animated.timing(
        viewLife, {
          toValue: 1,
          useNativeDriver: true,
          duration: 200,
        }
      ).start();
      startAnimation();
    } else {
      clearInterval(timer);
    }
    const onListener = () => {
      if (viewScan) {
        setViewScan(false);
        return true;
      } else {
        return false;
      }
    };
    BackHandler.addEventListener('hardwareBackPress', onListener);
    return () => BackHandler.removeEventListener('hardwareBackPress', onListener);
    ;
  }, [viewScan]);
  if (!viewScan) return null;
  return (
    <Animated.View style={{
      flex: 1,
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1,
      opacity: viewLife,
    }}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.4)" />
      <RNCamera
        style={{ flex: 1 }}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.on}
        onBarCodeRead={onBarCodeRead}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent'
        }}>
          <View style={{
            height: 250,
            width: 250,
            borderWidth: 2,
            borderColor: defaultThemeColor,
            backgroundColor: 'transparent'
          }}/>
          <Animated.View style={{
            flex: 0,
            width: 250,
            height: 2,
            backgroundColor: defaultThemeColor,
            transform: [{translateY: moveAnim}]}}/>
          <Text style={{
            flex: 0,
            color: '#fff',
            marginTop: 10
          }}>将二维码放入框内，即可自动扫描</Text>
        </View>
      </RNCamera>
    </Animated.View>
  );
};

export const showScan: () => Promise<string> = () => {
  changeViewScan && changeViewScan(true);
  changeViewData.data = '';
  return new Promise((resolve) => {
    timer = setInterval(() => {
      if (changeViewData.data) {
        resolve(changeViewData.data);
        changeViewScan && changeViewScan(false);
        clearInterval(timer);
      }
    }, 300);
  });
};

export default ComScanView;
