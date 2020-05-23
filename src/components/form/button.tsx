import React, { FC } from 'react';
import { ButtonProps, Button } from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

const ComFormButton: FC<{
  title: string;
  onPress?: ButtonProps['onPress'],
  style?: ButtonProps['buttonStyle']
}> = ({
  title,
  onPress,
  style,
}) => {
  return (
    <Button
      onPress={onPress}
      ViewComponent={LinearGradient}
      linearGradientProps={{
        start: { x: 0, y: 0 },
        end: { x: 1, y: 0 },
        colors: ['#826ffd', '#543dff'],
      }}
      buttonStyle={[{
        height: 40,
        width: '80%',
        alignSelf: 'center',
      }, style]}
      title={title} />
  );
};

export default ComFormButton;
