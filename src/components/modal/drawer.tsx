import React, { FC, useEffect } from 'react';
import {
  ViewStyle, Animated, View, StyleProp, SafeAreaView,
} from 'react-native';
import { Header } from 'react-native-elements';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import { modalOutBg } from './outBg';
import { themeWhite } from '../../config/theme';

type TypeComDrawer = {
  context: React.ReactElement;
  noClose?: true;
  width?: ViewStyle['width'];
  style?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
};

const changeDrawer = {
  close: () => {},
};

const ComDrawer: FC<TypeComDrawer> = ({
  context,
  width,
  noClose,
  style,
}) => {
  const insertBoxStart = new Animated.Value(500);
  const addEvent = {
    closePage: () => {
      Animated.timing(
        insertBoxStart,
        {
          duration: 200,
          toValue: 500,
          useNativeDriver: true,
        },
      ).start(() => {
        modalOutBg.outBgsetShow(false);
        modalOutBg.outBgsetChildren(null);
      });
    },
  };
  useEffect(() => {
    insertBoxStart.setValue(500);
    Animated.timing(
      insertBoxStart,
      {
        duration: 300,
        toValue: 0,
        useNativeDriver: true,
      },
    ).start();
    changeDrawer.close = addEvent.closePage;
  }, []);
  return (
    <View style={{
      flex: 1,
      width: '100%',
    }}>
      <Animated.View style={[
        {
          backgroundColor: themeWhite,
          width: width || '70%',
          flex: 1,
          alignSelf: 'flex-end',
          transform: [
            { translateX: insertBoxStart },
          ],
        },
        style,
      ]}>
        <Header containerStyle={{ height: 0, backgroundColor: themeWhite }} />
        <SafeAreaView style={{ flex: 1 }}>
          { context }
        </SafeAreaView>
      </Animated.View>
      <TouchableNativeFeedback onPress={() => !noClose && addEvent.closePage()}>
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
        }} />
      </TouchableNativeFeedback>
    </View>
  );
};

const showComDrawer = (data: TypeComDrawer): typeof changeDrawer => {
  modalOutBg.outBgsetChildren(<ComDrawer {...data} />);
  modalOutBg.outBgsetShow(true);
  return changeDrawer;
};

export default showComDrawer;
