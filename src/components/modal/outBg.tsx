// 弹窗框背景
import React, {
  FC, useState, useEffect,
} from 'react';
import { Animated, TouchableNativeFeedback, View } from 'react-native';

export const modalOutBg: {
  outBgsetShow: React.Dispatch<React.SetStateAction<boolean>>;
  outBgsetChildren: React.Dispatch<React.ReactElement|null>;
  outBgCanClose: React.Dispatch<React.SetStateAction<boolean>>;
} = {
  outBgsetShow: () => {},
  outBgsetChildren: () => {},
  outBgCanClose: () => {},
};

const ComModalOutBg: FC = () => {
  const [children, setChildren] = useState<React.ReactElement|null>();
  const [show, setShow] = useState(false);
  const [bgCanClose, setBgCanClose] = useState(false);
  const insertBgStart = new Animated.Value(0);
  useEffect(() => {
    modalOutBg.outBgsetShow = setShow;
    modalOutBg.outBgsetChildren = setChildren;
    modalOutBg.outBgCanClose = setBgCanClose;
  }, []);
  useEffect(() => {
    if (show) {
      insertBgStart.setValue(0);
      Animated.timing(
        insertBgStart,
        {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        },
      ).start();
    }
  }, [show]);
  if (!show) return null;
  return (
    <Animated.View
      style={{
        opacity: insertBgStart,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      }}>
      { children }
      <TouchableNativeFeedback onPress={() => bgCanClose && setShow(false)}>
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: -1,
        }} />
      </TouchableNativeFeedback>
    </Animated.View>
  );
};

export default ComModalOutBg;
