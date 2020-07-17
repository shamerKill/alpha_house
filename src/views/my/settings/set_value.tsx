import React, {
  FC, useState, useEffect, useRef,
} from 'react';
import {
  View, StyleSheet, TouchableNativeFeedback, Text, Image as StaticImage, ImageSourcePropType,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-gesture-handler';
import { Image, CheckBox } from 'react-native-elements';
import { showMessage } from 'react-native-flash-message';
import ComLayoutHead from '../../../components/layout/head';
import { setListArr } from '.';
import { defaultThemeColor, themeWhite } from '../../../config/theme';
import showComAlert from '../../../components/modal/alert';
import getHeadImage from '../../../tools/getHeagImg';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState, ActionsType } from '../../../data/redux/state';
import ajax from '../../../data/fetch';

const MySettingValueScreen: FC = () => {
  // 0头像，1昵称，2简介，3所在地，4语言版本
  const { params: { type: settingState = 4 } } = useRoute<RouteProp<{settingValue: { type?: number }}, 'settingValue'>>();
  const navigation = useNavigation();

  const [userInfo, dispatchUserInfo] = useGetDispatch<InState['userState']['userInfo']>('userState', 'userInfo');

  // 默认值，判断是否进行了更改
  const defaultValue = useRef<string|number|null>(null);
  // 头像图片
  const [imagesArr, setImagesArr] = useState<ImageSourcePropType[]>([]);
  const [selectImage, setSelectImage] = useState(0);
  // 昵称/个人简介文字
  const [value, setValue] = useState('');
  // 地址
  const [siteArr, setSiteArr] = useState<string[]>([]);
  const [selectSite, setSelecSite] = useState(0);
  // 语言版本
  const [languageArr, setLanguageArr] = useState<string[]>([]);
  const [selectLanguage, setSelectLanguage] = useState(0);


  const addEvent = {
    save: () => {
      if (defaultValue.current === [selectImage, value, value, selectSite, selectLanguage][settingState]) {
        showMessage({
          position: 'bottom',
          message: '未更改',
          description: `${setListArr[settingState]}未进行修改无法进行提交`,
          type: 'warning',
        });
        return;
      }
      const close = showComAlert({
        title: '提交确认',
        desc: `是否提交${setListArr[settingState]}修改`,
        success: {
          text: '提交',
          onPress: () => {
            addEvent.submit(close);
          },
        },
        close: {
          text: '考虑一下',
          onPress: () => {
            close();
          },
        },
      });
    },
    submit: (close: () => void) => {
      const fm: {[key: string]: any} = {};
      if (settingState === 0) fm.avatar = selectImage;
      else if (settingState === 1) fm.nickname = value;
      else if (settingState === 2) fm.description = value;
      else if (settingState === 3) fm.location = siteArr[selectSite];
      ajax.post('/v1/user/edit_profile', fm).then(data => {
        close();
        if (data.status === 200) {
          showMessage({
            position: 'bottom',
            message: '修改成功',
            type: 'success',
          });
          if (settingState === 0) dispatchUserInfo({ type: ActionsType.CHANGE_USER_INFO, data: { avatar: imagesArr[selectImage] } });
          else if (settingState === 1) dispatchUserInfo({ type: ActionsType.CHANGE_USER_INFO, data: { nickname: value } });
          else if (settingState === 2) dispatchUserInfo({ type: ActionsType.CHANGE_USER_INFO, data: { introduce: value } });
          else if (settingState === 3) dispatchUserInfo({ type: ActionsType.CHANGE_USER_INFO, data: { location: siteArr[selectSite] } });
          navigation.goBack();
        } else {
          showMessage({
            position: 'bottom',
            message: data.message,
            type: 'warning',
          });
        }
      }).catch(err => {
        console.log(err);
      });
    },
    closeText: () => setValue(''),
  };

  useEffect(() => {
    switch (settingState) {
      case 0:
        setImagesArr(getHeadImage());
        defaultValue.current = 0;
        break;
      case 1:
        setValue(userInfo.nickname);
        defaultValue.current = userInfo.nickname;
        break;
      case 2:
        setValue(userInfo.introduce);
        defaultValue.current = userInfo.introduce;
        break;
      case 3:
        ajax.get('/v1/power/region').then(data => {
          if (data.status === 200) {
            setSiteArr(data?.data?.map((item: any) => {
              return item.name;
            }) || []);
          } else {
            console.log(data);
          }
        }).catch(err => {
          console.log(err);
        });
        break;
      case 4:
        setLanguageArr(['简体中文']);
        setSelectLanguage(0);
        defaultValue.current = 0;
        break;
      default:
        break;
    }
  }, []);
  useEffect(() => {
    imagesArr.forEach((item, index) => {
      if (userInfo.avatar === item) {
        setSelectImage(index);
        defaultValue.current = index;
      }
    });
  }, [imagesArr]);
  useEffect(() => {
    siteArr.forEach((item, index) => {
      if (userInfo.location === item) {
        setSelecSite(index);
        defaultValue.current = index;
      }
    });
  }, [siteArr]);

  return (
    <ComLayoutHead
      title={`${setListArr[settingState]}修改`}
      rightComponent={(
        <TouchableNativeFeedback onPress={addEvent.save}>
          <Text style={style.titleRight}>保存</Text>
        </TouchableNativeFeedback>
      )}>
      {
        // 头像设置
        settingState === 0
          ? (
            <View style={style.imageBox}>
              {
                imagesArr.map((item, index) => (
                  <View style={style.imageBoxIn} key={index + 1}>
                    <TouchableNativeFeedback
                      background={TouchableNativeFeedback.SelectableBackgroundBorderless()}
                      onPress={() => setSelectImage(index)}>
                      <View>
                        <Image
                          resizeMode="stretch"
                          style={style.imageBoxImage}
                          containerStyle={[
                            style.imageBoxImageBorder,
                            selectImage === index && {
                              borderWidth: 5,
                              margin: 0,
                              opacity: 1,
                            },
                          ]}
                          source={item} />
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                ))
              }
            </View>
          )
          : null
      }
      {
        // 昵称/个人简介设置
        (settingState === 1 || settingState === 2)
          ? (
            <View style={[
              style.textBox,
              settingState === 2 && style.areaTextBox,
            ]}>
              <TextInput
                style={[
                  style.textBoxText,
                  settingState === 2 && style.areaTextBoxText,
                ]}
                placeholder={`请输入您的${setListArr[settingState]}`}
                value={value}
                multiline
                onChange={e => setValue(e.nativeEvent.text)} />
              <TouchableNativeFeedback onPress={() => addEvent.closeText()}>
                <StaticImage
                  resizeMode="contain"
                  style={style.textBoxClose}
                  source={require('../../../assets/images/icons/close.png')} />
              </TouchableNativeFeedback>
            </View>
          )
          : null
      }
      {
        (settingState === 3 || settingState === 4)
          ? (
            <View>
              {
                [siteArr, languageArr][settingState - 3].map((item, index) => (
                  <CheckBox
                    key={index}
                    center
                    iconRight
                    title={item}
                    checkedIcon="dot-circle-o"
                    uncheckedIcon="circle-o"
                    checkedColor={defaultThemeColor}
                    wrapperStyle={{
                      justifyContent: 'space-between',
                    }}
                    onPress={() => [setSelecSite, setSelectLanguage][settingState - 3](index)}
                    checked={index === [selectSite, selectLanguage][settingState - 3]} />
                ))
              }
            </View>
          )
          : null
      }
    </ComLayoutHead>
  );
};

const style = StyleSheet.create({
  titleRight: {
    color: defaultThemeColor,
    textAlign: 'right',
    lineHeight: 50,
  },
  imageBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  imageBoxIn: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageBoxImage: {
    width: 80,
    height: 80,
    padding: 4,
  },
  imageBoxImageBorder: {
    borderColor: defaultThemeColor,
    borderWidth: 1,
    borderRadius: 80,
    margin: 4,
    opacity: 0.7,
  },
  textBox: {
    backgroundColor: themeWhite,
    marginTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  areaTextBox: {
    height: 80,
  },
  textBoxText: {
    flex: 1,
    paddingRight: 10,
    paddingTop: 15,
    paddingBottom: 15,
  },
  areaTextBoxText: {
    alignSelf: 'flex-start',
  },
  textBoxClose: {
    width: 20,
    height: 20,
    padding: 10,
  },
});

export default MySettingValueScreen;
