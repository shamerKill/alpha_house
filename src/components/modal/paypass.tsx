import React, { FC, useState, useEffect } from 'react';
import {
  View, StyleSheet, Text, TouchableNativeFeedback, Image, TextInput,
} from 'react-native';
import { modalOutBg } from './outBg';
import { themeWhite, defaultThemeBgColor, themeGray } from '../../config/theme';
import { useNavigation, NavigationProp, NavigationState } from '@react-navigation/native';

type TypeComPayPass = {
  submitPass: (pass: string) => void;
  navigation?: NavigationProp<Record<string, object | undefined>, string, NavigationState, {}, {}>;
};

const closeComPayPass = () => {
  modalOutBg.outBgsetShow(false);
  modalOutBg.outBgsetChildren(null);
};

const ComPayPassModal: FC<TypeComPayPass> = ({ submitPass, navigation }) => {
  const [value, setValue] = useState('');

  const addEvent = {
    changeValue: (text: string) => {
      setValue(text.replace(/[^\d]/g, ''));
    },
    goToPage: () => {
      navigation && navigation.navigate('changePass', { state: 'pay' });
    },
  };

  useEffect(() => {
    if (value.length === 6) {
      submitPass && submitPass(value);
      closeComPayPass();
    }
  }, [value]);

  return (
    <View style={style.boxView}>
      <View style={style.headView}>
        <Text style={style.headText}>输入交易密码</Text>
        <TouchableNativeFeedback onPress={() => modalOutBg.outBgsetShow(false)}>
          <View style={style.headIconView}>
            <Image
              resizeMode="contain"
              style={style.headIconImage}
              source={require('../../assets/images/icons/page_close_icon.png')} />
          </View>
        </TouchableNativeFeedback>
      </View>
      <View style={style.inputView}>
        <TextInput
          style={style.input}
          value={value}
          onChange={e => addEvent.changeValue(e.nativeEvent.text)}
          secureTextEntry
          keyboardType="number-pad"
          placeholder="请输入交易密码" />
      </View>
      <TouchableNativeFeedback onPress={addEvent.goToPage}>
        <View style={style.moreView}>
          <Text style={style.moreText}>忘记密码？</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
};

const showPayPass = (data: TypeComPayPass) => {
  modalOutBg.outBgsetChildren(<ComPayPassModal {...data} />);
  modalOutBg.outBgsetShow(true);
  return closeComPayPass;
};

const style = StyleSheet.create({
  boxView: {
    backgroundColor: themeWhite,
    width: '80%',
    padding: 10,
  },
  headView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headText: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    paddingLeft: 25,
  },
  headIconView: {
    padding: 10,
    marginRight: -10,
  },
  headIconImage: {
    width: 15,
    height: 15,
  },
  inputView: {
    backgroundColor: defaultThemeBgColor,
    paddingLeft: 10,
    justifyContent: 'center',
    height: 40,
    borderRadius: 3,
    marginTop: 10,
  },
  input: {
    margin: 0,
    padding: 0,
  },
  moreView: {
    marginTop: 10,
    alignItems: 'flex-end',
    paddingTop: 5,
    paddingBottom: 5,
  },
  moreText: {
    color: themeGray,
    fontSize: 12,
  },
});

export default showPayPass;
