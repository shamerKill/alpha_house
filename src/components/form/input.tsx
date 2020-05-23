import React, { FC } from 'react';
import { Text } from 'react-native';
import { Input, InputProps } from 'react-native-elements';
import { defaultThemeBgColor, themeBlack } from '../../config/theme';

interface InComInputForm {
  value?: string;
  onChange?: InputProps['onChangeText'];
  placeholder?: string;
  labelText?: string;
  right?: string|React.ReactElement;
  password?: true;
  noError?: true;
  errorMessage?: string;
  keyboardType?: InputProps['keyboardType'];
  disabled?: true;
}
export const ComInputForm: FC<InComInputForm> = ({
  value,
  onChange,
  placeholder,
  labelText,
  right,
  password,
  noError,
  errorMessage,
  keyboardType,
  disabled,
}) => {
  let Right: React.ReactElement|null = null;
  if (typeof right === 'string') Right = <Text>{right}</Text>;
  else if (right) Right = right;
  return (
    <Input
      value={value}
      disabled={disabled}
      keyboardType={keyboardType}
      onChangeText={onChange}
      errorMessage={errorMessage}
      errorStyle={noError ? {
        height: 0,
        padding: 0,
        margin: 0,
      } : null}
      inputContainerStyle={{
        borderBottomColor: defaultThemeBgColor,
      }}
      inputStyle={{
        fontSize: 16,
        paddingLeft: 0,
        color: themeBlack,
      }}
      label={
        labelText ? (
          <Text style={{
            lineHeight: 24,
            fontSize: 15,
            paddingTop: 10,
            color: themeBlack,
          }}>
            {labelText}
          </Text>
        ) : undefined
      }
      placeholder={placeholder}
      secureTextEntry={password}
      rightIcon={
        Right || undefined
      } />
  );
};

export default {
  ComInputForm,
};
