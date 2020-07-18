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
  loading?: boolean;
}> = ({
  title,
  onPress,
  style,
  fontStyle,
  gray,
  disabled,
  containerStyle,
  loading,
}) => {
  return (
    <Button
      disabled={disabled}
      loading={loading}
      onPress={onPress}
      ViewComponent={LinearGradient}
      containerStyle={[
        {
          width: '80%',
          alignSelf: 'center',
        },
        containerStyle,
      ]}
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
