import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { Button } from 'react-native-elements';
import { modalOutBg } from './outBg';
import { themeWhite, defaultThemeColor, themeGray } from '../../config/theme';

type TypeComAlert = {
  title?: string;
  desc?: string|React.ReactElement;
  success?: {
    text: string;
    onPress: () => void;
  };
  close?: TypeComAlert['success']
};

const closeComAlert = () => {
  modalOutBg.outBgsetShow(false);
  modalOutBg.outBgsetChildren(null);
};

const ComAlert: FC<TypeComAlert> = ({
  title,
  desc,
  success,
  close,
}) => {
  return (
    <View style={{
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 20,
      paddingRight: 20,
      backgroundColor: themeWhite,
      borderRadius: 5,
      width: 300,
    }}>
      {
        title && (
          <Text style={{
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 'bold',
            paddingBottom: 10,
          }}>
            {title}
          </Text>
        )
      }
      {
        desc && (
          <View style={{
            paddingTop: 10,
            paddingBottom: 10,
          }}>
            {
              typeof desc === 'string'
                ? <Text>{desc}</Text>
                : desc
            }
          </View>
        )
      }
      <View style={{ flexDirection: 'row-reverse' }}>
        {
          success
          && (
            <Button
              title={success.text}
              onPress={success.onPress}
              buttonStyle={{
                backgroundColor: 'transparent',
              }}
              titleStyle={{
                color: defaultThemeColor,
                fontSize: 16,
              }} />
          )
        }
        {
          close
          && (
            <Button
              title={close.text}
              onPress={close.onPress}
              buttonStyle={{
                backgroundColor: 'transparent',
              }}
              titleStyle={{
                color: themeGray,
                fontSize: 16,
              }} />
          )
        }
      </View>
    </View>
  );
};

const showComAlert = (data: TypeComAlert) => {
  modalOutBg.outBgsetChildren(<ComAlert {...data} />);
  modalOutBg.outBgsetShow(true);
  return closeComAlert;
};

export default showComAlert;
