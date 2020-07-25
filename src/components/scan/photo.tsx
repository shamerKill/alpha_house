// 扫码
import React, { FC, useState, useEffect, useRef } from 'react';
import { View, StatusBar, BackHandler, Animated, Image, TouchableNativeFeedback } from 'react-native';
import { RNCamera } from 'react-native-camera';
import ComFormButton from '../form/button';

let changeViewPhoto: React.Dispatch<React.SetStateAction<boolean>> | null = null;
let changeViewPhotoChildren: React.Dispatch<React.SetStateAction<React.ReactElement>> | null = null;
let timer = 0;
let changeViewData: { data: string } = {
  data: ''
};

const ComPhotoView: FC = () => {
  const viewLife = new Animated.Value(0);
  const camera = useRef<RNCamera>(null);
  const [viewPhoto, setViewPhoto] = useState(false);
  const [viewPhotoChildren, setViewPhotoChildren] = useState<React.ReactElement>(<View />);
  changeViewPhoto = setViewPhoto;
  changeViewPhotoChildren = setViewPhotoChildren;
  const onGetPic = () => {
    if (camera.current === null) return;
    const options = { quality: 0.5 };
    camera.current.takePictureAsync(options).then(data => {
      changeViewData.data = data.uri;
    }).catch(err => {
      console.log(err);
    });
  };
  useEffect(() => {
    if (viewPhoto) {
      Animated.timing(
        viewLife, {
          toValue: 1,
          useNativeDriver: true,
          duration: 200,
        }
      ).start();
    } else {
      clearInterval(timer);
    }
    const onListener = () => {
      if (viewPhoto) {
        setViewPhoto(false);
        return true;
      } else {
        return false;
      }
    };
    BackHandler.addEventListener('hardwareBackPress', onListener);
    return () => BackHandler.removeEventListener('hardwareBackPress', onListener);
  }, [viewPhoto]);
  if (!viewPhoto) return null;
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
        ref={camera}
        type={RNCamera.Constants.Type.back}
        flashMode={RNCamera.Constants.FlashMode.on}>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          position: 'relative',
        }}>
          <View
            style={{
              position: 'absolute',
              top: 40,
              left: 30,
              width: 30,
              height: 30,
            }}>
            <TouchableNativeFeedback onPress={() => setViewPhoto(false)}>
              <Image
                source={require('../../assets/images/icons/page_close.png')}
                resizeMode="stretch"
                style={{
                  width: 30,
                  height: 30,
                }} />
            </TouchableNativeFeedback>
          </View>
          { viewPhotoChildren }
          <ComFormButton
            containerStyle={{
              width: '50%',
              position: 'absolute',
              bottom: 20,
            }}
            onPress={() => onGetPic()}
            title="拍摄" />
        </View>
      </RNCamera>
    </Animated.View>
  );
};

export const showPhoto: (content: React.ReactElement) => Promise<string> = (content) => {
  changeViewPhoto && changeViewPhoto(true);
  changeViewPhotoChildren && changeViewPhotoChildren(content);
  changeViewData.data = '';
  return new Promise((resolve) => {
    timer = setInterval(() => {
      if (changeViewData.data) {
        resolve(changeViewData.data);
        changeViewPhoto && changeViewPhoto(false);
        clearInterval(timer);
      }
    }, 300) as any;
  });
};

export default ComPhotoView;
