import React, { FC, useRef, useState } from 'react';
import {
  View, TouchableNativeFeedback, StyleSheet, Animated,
} from 'react-native';
import { defaultThemeColor, themeWhite, themeGray } from '../../config/theme';

const ComFormCheckRadius: FC<{
  checkState: (state: boolean) => void;
  defaultValue: boolean;
}> = ({
  checkState,
  defaultValue,
}) => {
  const checkRaduis = useRef(new Animated.Value(defaultValue ? 30 : 0));
  const [checked, setChecked] = useState(defaultValue);

  let canDo = true;
  const addEvent = {
    check: (type?: boolean) => {
      if (!canDo) return;
      setChecked(state => {
        let result = state;
        if (type !== undefined) result = !type;
        canDo = false;
        Animated.timing(checkRaduis.current, {
          toValue: result ? 0 : 30,
          duration: 100,
          useNativeDriver: true,
        }).start(() => {
          canDo = true;
        });
        checkState(!result);
        return !result;
      });
    },
  };
  ComFormCheckRadius.prototype.setChecked = addEvent.check;

  return (
    <TouchableNativeFeedback
      background={{
        type: 'RippleAndroid',
        color: 0,
      }}
      onPress={() => addEvent.check()}>
      <View style={[
        style.tabChecked,
        {
          backgroundColor: checked ? defaultThemeColor : themeGray,
          borderColor: checked ? defaultThemeColor : themeGray,
        },
      ]}>
        <Animated.View style={[
          {
            transform: [
              { translateX: checkRaduis.current },
            ],
          },
          style.tabCheckedIn,
        ]} />
      </View>
    </TouchableNativeFeedback>
  );
};

const style = StyleSheet.create({
  tabChecked: {
    width: 60,
    height: 30,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: defaultThemeColor,
    borderColor: defaultThemeColor,
    borderWidth: 1,
    display: 'flex',
    position: 'relative',
  },
  tabCheckedIn: {
    width: 28,
    height: 28,
    backgroundColor: themeWhite,
    borderRadius: 30,
  },
});

export default ComFormCheckRadius;
