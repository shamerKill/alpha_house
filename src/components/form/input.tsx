import React, { FC } from 'react';
import { Text } from 'react-native';
import { Input } from 'react-native-elements';
import { defaultThemeBgColor, themeBlack } from '../../config/theme';

interface InComInputForm {
  placeholder?: string;
  labelText?: string;
  right?: string|React.ReactElement;
  password?: true;
  noError?: true;
  errorMessage?: string;
}
export const ComInputForm: FC<InComInputForm> = ({
  placeholder,
  labelText,
  right,
  password,
  noError,
  errorMessage,
}) => {
  let Right: React.ReactElement|null = null;
  if (typeof right === 'string') Right = <Text>{right}</Text>;
  else if (right) Right = right;
  return (
    <Input
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
