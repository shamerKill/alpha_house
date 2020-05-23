// 弹窗框背景
import React, {
  FC, useState, useEffect,
} from 'react';
import { View } from 'react-native';

export const modalOutBg: {
  outBgsetShow: React.Dispatch<React.SetStateAction<boolean>>;
  outBgsetChildren: React.Dispatch<React.SetStateAction<React.FC<any> | undefined>>;
} = {
  outBgsetShow: () => {},
  outBgsetChildren: () => {},
};

const ComModalOutBg: FC = () => {
  const [children, setChildren] = useState<FC<any>>();
  const [show, setShow] = useState(false);
  useEffect(() => {
    modalOutBg.outBgsetShow = setShow;
    modalOutBg.outBgsetChildren = setChildren;
  }, []);
  if (!show) return null;
  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
      }}>
      { children }
    </View>
  );
};

export default ComModalOutBg;
