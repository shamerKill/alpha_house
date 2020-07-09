import { ImageSourcePropType } from 'react-native';

const getHeadImage = (): ImageSourcePropType[] => {
  const result: ImageSourcePropType[] = [
    require('../assets/images/headimg/01.png'),
    require('../assets/images/headimg/02.png'),
    require('../assets/images/headimg/03.png'),
    require('../assets/images/headimg/04.png'),
    require('../assets/images/headimg/05.png'),
    require('../assets/images/headimg/06.png'),
  ];
  return result;
};
export default getHeadImage;
