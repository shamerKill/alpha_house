import React, { FC, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableNativeFeedback,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import ComLayoutHead from '../../components/layout/head';
import ComFormButton from '../../components/form/button';
import { themeGray, themeWhite } from '../../config/theme';

const MyFeedBack: FC = () => {
  const areaInput = useRef<any>();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  return (
    <ComLayoutHead title="建议反馈">
      <Text style={style.titleDesc}>请填写以下内容以方便我们及时联系您</Text>
      <View style={style.labelView}>
        <Text style={style.labelViewText}>姓名</Text>
        <TextInput
          style={style.labelViewInput}
          placeholder="请输入姓名"
          value={name}
          onChange={e => setName(e.nativeEvent.text)} />
      </View>
      <View style={style.labelView}>
        <Text style={style.labelViewText}>电话</Text>
        <TextInput
          placeholder="请输入电话"
          keyboardType="phone-pad"
          style={style.labelViewInput}
          value={phone}
          onChange={e => setPhone(e.nativeEvent.text)} />
      </View>
      <View style={style.labelView}>
        <Text style={style.labelViewText}>邮箱</Text>
        <TextInput
          placeholder="请输入邮箱"
          keyboardType="email-address"
          style={style.labelViewInput}
          value={email}
          onChange={e => setEmail(e.nativeEvent.text)} />
      </View>
      <TouchableNativeFeedback onPress={() => areaInput.current?.focus()}>
        <View style={[
          style.labelView,
          style.labelViewAreaBox,
        ]}>
          <TextInput
            ref={areaInput}
            multiline
            placeholder="请输入留言"
            style={style.labelViewArea}
            value={message}
            onChange={e => setMessage(e.nativeEvent.text)} />
        </View>
      </TouchableNativeFeedback>
      <ComFormButton
        title="提交" />
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  titleDesc: {
    color: themeGray,
    padding: 10,
    lineHeight: 30,
  },
  labelView: {
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: themeWhite,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
    height: 50,
  },
  labelViewText: {
    paddingRight: 10,
  },
  labelViewInput: {
    textAlign: 'right',
    flex: 1,
  },
  labelViewAreaBox: {
    height: 100,
    marginBottom: 30,
    alignItems: 'flex-start',
  },
  labelViewArea: {
  },
});

export default MyFeedBack;
