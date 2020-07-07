import { ImageSourcePropType } from 'react-native';

export type TypeImageData = {
  // 轮播图
  banner: {
    source: ImageSourcePropType;
    id: string | number;
    link?: string;
  }[];
};
