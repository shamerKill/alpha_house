import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, StyleSheet, Image, Dimensions, Animated, TouchableNativeFeedback, TextInput,
} from 'react-native';
import { Text } from 'react-native-elements';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import {
  themeWhite, themeGray, defaultThemeBgColor, defaultThemeColor, themeTextGray,
} from '../../../config/theme';
import ajax from '../../../data/fetch';

const AccountVerfiyCodeScreen: FC = () => {
  const screenWidth = Math.floor(Dimensions.get('window').width) - 20;

  const route = useRoute<RouteProp<{verfiyCode: { type: 'register' | 'forget', data: { account: string } }}, 'verfiyCode'>>();

  const navigation = useNavigation();

  const timer = useRef(0);
  const codeLineOpacity = useRef(new Animated.Value(0));
  const codeLineOpacityValue = useRef(0);
  const codeInput = useRef<TextInput>(null);
  const isLoading = useRef(false);

  const [account, setAccount] = useState('');
  const [time, setTime] = useState(60);
  const [code, setCode] = useState('');
  const [codeArr, setCodeArr] = useState<string[]>([]);

  const addEvent = {
    // 对焦输入框
    focusInput: () => {
      if (!codeInput.current) return;
      codeInput.current.blur();
      codeInput.current.focus();
    },
    // 输入内容
    inputChange: (value: string) => {
      setCode(value.replace(/[^\d]/g, '').substr(0, 6));
    },
    // 提交验证码
    send: () => {
      // 验证验证码
      const accountArr = route.params.data.account.split(' ');
      ajax.post('/v1/power/check_sms', {
        mobile: accountArr.length === 1 ? accountArr[0] : accountArr[1],
        type: 1,
        mobile_area: accountArr.length === 1 ? '00' : accountArr[0],
        code,
      }).then(data => {
        console.log(data);
        if (data.status === 200) {
          navigation.navigate('AccountSetPass', {
            type: route.params.type,
            data: {
              ...route.params.data,
              verifyCode: code,
            },
          });
        } else {
          console.log(data.message);
        }
      }).catch(err => {
        console.log(err);
      });
    },
    sendCode: () => {
      if (isLoading.current) return;
      isLoading.current = true;
      const accountArr = route.params.data.account.split(' ');
      // 发送验证码
      ajax.post('/v1/power/send_sms', {
        mobile: accountArr.length === 1 ? accountArr[0] : accountArr[1],
        type: 1, // 注册短信
        mobile_area: accountArr.length === 1 ? accountArr[0] : accountArr[0],
      }).then(data => {
        if (data.status === 200) {
          addEvent.setTimer();
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
        isLoading.current = false;
      });
    },
    // 发送验证码倒计时
    setTimer: () => {
      setTime(60);
      timer.current = Number(setInterval(() => {
        setTime(state => {
          if (state <= 1) clearInterval(timer.current);
          return state - 1;
        });
      }, 1000));
    },
    // 开始竖线动画
    lineAimate: (): Animated.CompositeAnimation => {
      if (codeLineOpacityValue.current === 0) codeLineOpacityValue.current = 1;
      else codeLineOpacityValue.current = 0;
      const animate = Animated.timing(codeLineOpacity.current, {
        toValue: codeLineOpacityValue.current,
        useNativeDriver: true,
        duration: 800,
      });
      animate.start(() => addEvent.lineAimate());
      return animate;
    },
  };

  useEffect(() => {
    setCodeArr(code.split(''));
    if (code.length === 6) addEvent.send();
  }, [code]);

  useEffect(() => {
    setAccount(route.params.data?.account || '');
    setCode('');
    addEvent.setTimer();
    const lineAimate = addEvent.lineAimate();
    return () => {
      clearInterval(timer.current);
      lineAimate.stop();
    };
  }, []);

  return (
    <ComLayoutHead
      overScroll
      position
      positionTop={80}
      scrollStyle={{ backgroundColor: themeWhite, padding: 10 }}>
      <Text h4>输入验证码</Text>
      <Text style={style.codeDesc}>验证码已发至{account}</Text>
      <Text style={style.codeNoneDesc}>如果未收到验证码，请前往垃圾站查看信息是否被过滤</Text>
      <TouchableNativeFeedback onPress={() => addEvent.focusInput()}>
        <View style={style.codeView}>
          {
          codeArr.map((item, index) => (
            <View style={style.codeTextView} key={index}>
              <Text style={style.codeText}>{item}</Text>
            </View>
          ))
        }
          <Animated.View style={[
            style.codeTextLine,
            {
              left: (screenWidth / 6) * (codeArr.length + 0.5),
              opacity: codeLineOpacity.current,
            },
          ]} />
        </View>
      </TouchableNativeFeedback>
      <TextInput
        ref={codeInput}
        keyboardType="number-pad"
        style={style.codeTextInput}
        value={code}
        onChange={e => addEvent.inputChange(e.nativeEvent.text)} />
      <View>
        {
          time > 0
            ? (<Text style={style.timeTextStyle}>{time}s后可重新发送</Text>)
            : (
              <TouchableNativeFeedback onPress={() => addEvent.sendCode()}>
                <View style={style.timeTextView}>
                  <Text style={[style.timeTextStyle, style.timeTextAgain]}>重新发送</Text>
                </View>
              </TouchableNativeFeedback>
            )
        }
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
  codeDesc: {
    paddingTop: 10,
    fontSize: 16,
    paddingBottom: 10,
  },
  codeNoneDesc: {
    fontSize: 12,
    color: themeGray,
    paddingBottom: 20,
  },
  codeView: {
    borderBottomWidth: 1,
    borderBottomColor: defaultThemeBgColor,
    marginBottom: 20,
    flexDirection: 'row',
    position: 'relative',
    height: 60,
  },
  codeTextView: {
    width: `${100 / 6}%`,
    alignItems: 'center',
    height: 60,
  },
  codeText: {
    lineHeight: 60,
    fontSize: 22,
    color: defaultThemeColor,
    fontWeight: 'bold',
  },
  codeTextLine: {
    width: 2,
    height: 30,
    position: 'absolute',
    top: 15,
    backgroundColor: defaultThemeColor,
  },
  codeTextInput: {
    position: 'absolute',
    top: -100,
    right: -100,
  },
  timeTextStyle: {
    color: themeTextGray,
    lineHeight: 40,
  },
  timeTextView: {
    width: 100,
  },
  timeTextAgain: {
    color: defaultThemeColor,
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

export default AccountVerfiyCodeScreen;
