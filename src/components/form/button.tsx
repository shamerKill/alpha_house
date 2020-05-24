import React, { FC } from 'react';
import { ButtonProps, Button } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { themeWhite, defaultThemeBgColor, themeBlack } from '../../config/theme';

const ComFormButton: FC<{
  title: string;
  onPress?: ButtonProps['onPress'];
  style?: ButtonProps['buttonStyle'];
  fontStyle?: ButtonProps['titleStyle'];
  containerStyle?: ButtonProps['containerStyle'];
  gray?: boolean;
  disabled?: boolean;
}> = ({
  title,
  onPress,
  style,
  fontStyle,
  gray,
  disabled,
  containerStyle,
}) => {
  return (
    <Button
      disabled={disabled}
      onPress={onPress}
      ViewComponent={LinearGradient}
      containerStyle={containerStyle}
      disabledTitleStyle={{
        color: gray ? themeBlack : themeWhite,
      }}
      linearGradientProps={{
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        colors: gray ? [defaultThemeBgColor, defaultThemeBgColor] : ['#826ffd', '#543dff'],
      }}
      buttonStyle={[{
        height: 40,
        width: '80%',
        alignSelf: 'center',
      }, style]}
      titleStyle={[
        {
          color: gray ? themeBlack : themeWhite,
        },
        fontStyle,
      ]}
      title={title} />
  );
};

export default ComFormButton;
