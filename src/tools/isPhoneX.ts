import { Dimensions, Platform } from 'react-native';

const screenW = Dimensions.get('window').width;
const screenH = Dimensions.get('window').height;
// iPhoneX
const X_WIDTH = [375, 414];
const X_HEIGHT = [812, 896];

export default function isIphoneX() {
  return (
    Platform.OS === 'ios'
        && ((X_HEIGHT.includes(screenH) && X_WIDTH.includes(screenW))
            || (X_WIDTH.includes(screenH) && X_HEIGHT.includes(screenW)))
  );
}
