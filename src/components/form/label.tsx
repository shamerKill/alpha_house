import React, { FC, useState, useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import { Input, InputProps, Button } from 'react-native-elements';
import { themeWhite, defaultThemeColor } from '../../config/theme';

const ComFormLabel: FC<{
  title?: string;
  value?: string;
  onChangeText?: InputProps['onChangeText'];
  keyboardType?: InputProps['keyboardType'];
  placeholder?: string;
  disabled?: true;
  password?: true;
  // 验证码
  getCode?: (data: any) => void;
  codeTimer?: number;
  closeCode?: {clearTimer:() => void};
}> = ({
  closeCode,
  title,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  password,
  disabled,
  getCode,
  codeTimer = 61,
}) => {
  // 添加静态停止倒计时方法
  let timer = useRef(setTimeout(() => {}, 0));
  const [codeState, setCodeState] = useState(codeTimer);
  const startTimer = () => {
    setCodeState(codeTimer - 1);
    timer.current = setInterval(() => {
      setCodeState(state => {
        let result = state - 1;
        if (result > 0) return result;
        else {
          clearInterval(timer.current);
          return codeTimer;
        }
      });
    }, 1000);
    getCode && getCode(() => {
      setCodeState(codeTimer);
      clearInterval(timer.current);
    });
  };
  useEffect(() => {
    clearInterval(timer.current);
  }, []);
  if (closeCode) closeCode.clearTimer = () => {
    setCodeState(codeTimer);
    clearInterval(timer.current);
  };
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 10,
      backgroundColor: themeWhite,
    }}>
      <Text style={{
        height: 40,
        lineHeight: 40,
        width: 100,
        flex: 1,
        fontSize: 16,
      }}>
        {title}
      </Text>
      <Input
        placeholder={placeholder}
        disabled={disabled}
        containerStyle={{
          height: 40,
          flex: 3,
        }}
        inputContainerStyle={{
          borderBottomColor: '#fff',
        }}
        inputStyle={{
          textAlign: 'right',
          fontSize: 16,
        }}
        value={value}
        secureTextEntry={password}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        rightIcon={(
          getCode ? (
            <Button
              onPress={startTimer}
              title={
                codeState === 61
                  ? '获取' : codeState?.toString()
              }
              disabled={codeState !== 61}
              buttonStyle={{
                backgroundColor: '#f1f1fe',
                borderColor: defaultThemeColor,
                borderWidth: 1,
                width: 50,
                height: 28,
                paddingTop: 0,
                paddingBottom: 0,
                marginRight: 0,
                marginLeft: 5,
              }}
              disabledStyle={{
                backgroundColor: '#f1f1fe',
              }}
              titleStyle={{
                color: defaultThemeColor,
                fontSize: 13,
                lineHeight: 22,
              }} />
          ) : false
        )} />
    </View>
  );
};

export default ComFormLabel;
