import React, {
  FC, useState, useRef,
} from 'react';
import {
  View, Text, StyleSheet, TouchableNativeFeedback, Image, TextInput, Dimensions,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { CheckBox } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, themeGray, themeBlack, defaultThemeBgColor, themeTextGray, defaultThemeColor,
} from '../../../config/theme';
import showSelector from '../../../components/modal/selector';
import ComFormButton from '../../../components/form/button';
import { isPhone, isEmail } from '../../../tools/verify';

const RegisterScreen: FC = () => {
  const navigation = useNavigation();
  const screenWidth = Math.floor(Dimensions.get('window').width) - 20;

  const scrollRef = useRef<ScrollView>(null);
  const phoneRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const [accountType, setAccountType] = useState<'phone'|'email'>('phone');
  const [phone, setPhone] = useState('');
  const [phonePrefix, setPhonefix] = useState('+86');
  const [email, setEmail] = useState('');
  const [upUserCode, setUpUserCode] = useState('');
  const [agreement, setAgreement] = useState(false);
  // 是否在请求中
  const [loading, setLoading] = useState(false);

  const addEvent = {
    // 更改注册类型
    changeAccountType: (account: typeof accountType) => {
      setAccountType(account);
      enum accountObj {
        'phone',
        'email',
      }
      // 切换焦点
      [emailRef, phoneRef][accountObj[account]].current?.blur();
      // [phoneRef, emailRef][accountObj[account]].current?.focus();
      if (scrollRef.current) {
        try {
          (scrollRef.current as any).scrollTo({ x: accountObj[account] * screenWidth, y: 0 });
        } catch (err) { console.log(err); }
      }
    },
    // 更改手机区号
    changePrefix: () => {
      const close = showSelector({
        data: [
          { data: '+86', before: '中国 ' },
        ],
        selected: phonePrefix,
        onPress: (value) => {
          if (typeof value !== 'string') return;
          setPhonefix(value.split(' ')[1]);
          close();
        },
      });
    },
    // 下一步
    verfiyBeforeSend: () => {
      if (loading) return;
      let message = '';
      // 需要阅读并同意
      if (!agreement) message = '请同意用户注册协议';
      // 验证账号
      if (accountType === 'email' && !isEmail(email)) message = '请检查邮箱格式';
      if (accountType === 'phone' && !isPhone(phone)) message = '请检查手机号格式';
      if (message === '') {
        // 发送数据
        addEvent.send();
      } else {
        showMessage({
          message,
          type: 'warning',
        });
      }
    },
    // 提交
    send: () => {
      setLoading(true);
      // TODO: 没有验证码
      navigation.navigate('AccountVerfiyCode', {
        type: 'register',
        data: {
          accountType,
          account: accountType === 'email' ? email : `${phonePrefix} ${phone}`,
          upUserCode,
        },
      });
      setLoading(false);
    },
  };

  return (
    <ComLayoutHead
      overScroll
      scrollStyle={{
        backgroundColor: themeWhite,
        position: 'relative',
        justifyContent: 'center',
      }}>
      <View style={style.formView}>
        <View style={style.formSelect}>
          <TouchableNativeFeedback onPress={() => addEvent.changeAccountType('phone')}>
            <View style={style.formSelectTextView}>
              <Text style={[
                style.formSelectText,
                accountType === 'phone' && style.formSelectTextSelected,
              ]}>
                手机注册
              </Text>
            </View>
          </TouchableNativeFeedback>
          <TouchableNativeFeedback onPress={() => addEvent.changeAccountType('email')}>
            <View style={style.formSelectTextView}>
              <Text style={[
                style.formSelectText,
                accountType === 'email' && style.formSelectTextSelected,
              ]}>
                邮箱注册
              </Text>
            </View>
          </TouchableNativeFeedback>
        </View>
        {/* 输入框 */}
        <ScrollView
          horizontal
          pagingEnabled
          scrollEnabled={false}
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          style={style.formInputScroll}>
          {/* 手机号 */}
          <View style={[style.formInputView, { width: screenWidth }]}>
            <TouchableNativeFeedback onPress={addEvent.changePrefix}>
              <View style={style.formInputPrefix}>
                <Text style={style.formInputPrefixText}>{phonePrefix}</Text>
                <Image
                  resizeMode="contain"
                  style={style.formInputPrefixDown}
                  source={require('../../../assets/images/icons/down.png')} />
              </View>
            </TouchableNativeFeedback>
            <TextInput
              style={style.formInputInput}
              ref={phoneRef}
              keyboardType="number-pad"
              placeholder="请输入手机号码"
              value={phone}
              onChangeText={value => setPhone(value)} />
          </View>
          {/* 邮箱 */}
          <View style={[style.formInputView, { width: screenWidth }]}>
            <TextInput
              style={[
                style.formInputInput,
                {
                  paddingLeft: 0,
                },
              ]}
              ref={emailRef}
              keyboardType="email-address"
              placeholder="请输入邮箱"
              value={email}
              onChangeText={value => setEmail(value)} />
          </View>
        </ScrollView>
        <View style={[style.formInputView, { width: screenWidth }]}>
          <TextInput
            style={[
              style.formInputInput,
              {
                paddingTop: 20,
                paddingBottom: 10,
                paddingLeft: 0,
              },
            ]}
            ref={emailRef}
            keyboardType="email-address"
            placeholder="邀请码(选填)"
            value={upUserCode}
            onChangeText={value => setUpUserCode(value)} />
        </View>
        <CheckBox
          containerStyle={style.checkBoxView}
          checked={agreement}
          size={20}
          checkedColor={defaultThemeColor}
          onPress={() => setAgreement(state => !state)}
          title={(
            <View style={style.checkBoxViewInner}>
              <Text style={style.checkBoxViewText}>我已阅读并同意</Text>
              <TouchableNativeFeedback onPress={() => navigation.navigate('RegisterAgreement')}>
                <View>
                  <Text style={[style.checkBoxViewText, style.checkBoxViewLink]}>《用户注册协议》</Text>
                </View>
              </TouchableNativeFeedback>
            </View>
          )} />
        <ComFormButton
          containerStyle={style.formButton}
          title="下一步"
          onPress={() => addEvent.verfiyBeforeSend()} />
        <View style={style.formRegisterView}>
          <View style={style.formRegisterText}>
            <Text>已有账号?</Text>
            <TouchableNativeFeedback onPress={() => navigation.navigate('Login')}>
              <Text style={style.formRegisterTextLink}>马上登录</Text>
            </TouchableNativeFeedback>
          </View>
        </View>
      </View>
      <View style={style.bgImageView}>
        <Image
          resizeMode="stretch"
          style={style.bgImage}
          source={require('../../../assets/images/pic/login_bg.png')} />
      </View>
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  formView: {
    marginBottom: 140,
    paddingLeft: 10,
    paddingRight: 10,
  },
  formSelect: {
    flexDirection: 'row',
  },
  formSelectTextView: {
    width: '35%',
  },
  formSelectText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: themeGray,
    lineHeight: 50,
    textAlign: 'center',
  },
  formSelectTextSelected: {
    color: themeBlack,
    fontSize: 22,
  },
  formInputScroll: {
    flexDirection: 'row',
  },
  formInputView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
    alignItems: 'center',
  },
  formInputPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    borderRightColor: defaultThemeBgColor,
    borderRightWidth: 1,
    height: 30,
  },
  formInputPrefixText: {
    fontSize: 15,
    paddingRight: 5,
  },
  formInputPrefixDown: {
    width: 14,
    height: 14,
  },
  formInputInput: {
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10,
    fontSize: 15,
  },
  checkBoxView: {
    borderWidth: 0,
    backgroundColor: themeWhite,
    justifyContent: 'center',
  },
  checkBoxViewInner: {
    flexDirection: 'row',
    height: 30,
  },
  checkBoxViewText: {
    lineHeight: 28,
    fontSize: 13,
    color: themeTextGray,
  },
  checkBoxViewLink: {
    color: defaultThemeColor,
  },
  formButton: {
    width: '100%',
    marginTop: 30,
  },
  formRegisterView: {
    paddingTop: 10,
  },
  formRegisterText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formRegisterTextLink: {
    color: defaultThemeColor,
    paddingLeft: 10,
    lineHeight: 40,
  },
  bgImageView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
});

export default RegisterScreen;
