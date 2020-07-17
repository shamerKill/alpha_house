import React, { FC, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableNativeFeedback,
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../components/layout/head';
import ComFormButton from '../../components/form/button';
import { themeGray, themeWhite } from '../../config/theme';
import { isRealName, isPhone, isEmail } from '../../tools/verify';
import ajax from '../../data/fetch';

const MyFeedBack: FC = () => {
  const areaInput = useRef<any>();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const addEvent = {
    submitVerfiy: () => {
      if (loading) return;
      let resultMessage = '';
      if (!isRealName(name)) resultMessage = '姓名输入有误';
      if (!isPhone(phone)) resultMessage = '手机号输入有误';
      if (!isEmail(email)) resultMessage = '邮箱输入有误';
      if (message.trim() === '') resultMessage = '请输入有效留言';
      if (resultMessage === '') addEvent.submit();
      else {
        showMessage({
          position: 'bottom',
          message: resultMessage,
          type: 'warning',
        });
      }
    },
    submit: () => {
      setLoading(true);
      ajax.post('/v1/user/feedback', {
        Mobile: phone,
        Email: email,
        Name: name,
        Content: message,
      }).then(data => {
        if (data.status === 200) {
          showMessage({
            position: 'bottom',
            message: '建议反馈提交成功，工作人员会及时联系您',
            type: 'success',
          });
        } else {
          showMessage({
            position: 'bottom',
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        setLoading(false);
      });
    },
  };

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
        <Text style={style.labelViewText}>手机号</Text>
        <TextInput
          placeholder="请输入手机号"
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
        onPress={addEvent.submitVerfiy}
        title={loading ? '正在提交...' : '提交'} />
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
