import React, { FC } from 'react';
import { Image, ImageSourcePropType } from 'react-native';

const ComIconBotton: FC<{ image: ImageSourcePropType, focused: boolean; }> = ({ image, focused }) => {
  return (
    <Image
      style={{
        width: focused ? 22 : 20,
        height: focused ? 22 : 20,
      }}
      resizeMode="contain"
      source={image} />
  );
};

export default ComIconBotton;
