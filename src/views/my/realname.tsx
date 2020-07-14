import React, {
  FC, useState, useRef, useEffect,
} from 'react';
import {
  View, Image as StaticImage, StyleProp, ImageStyle, Dimensions, ImageSourcePropType, ViewStyle, Text, ImageURISource, Platform,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker';
import { showMessage } from 'react-native-flash-message';
import { useNavigation } from '@react-navigation/native';
import ComLayoutHead from '../../components/layout/head';
import ComLine from '../../components/line';
import {
  themeWhite, defaultThemeColor, defaultThemeBgColor, themeRed,
} from '../../config/theme';
import ComFormButton from '../../components/form/button';
import showSelector from '../../components/modal/selector';
import { showPhoto } from '../../components/scan/photo';
import showComAlert from '../../components/modal/alert';
import { IdentityCodeValid, isRealName } from '../../tools/verify';
import ajax from '../../data/fetch';
import showComLoading from '../../components/modal/loading';
import storage from '../../data/database';

const MyRealnameScreen: FC = () => {
  const navigation = useNavigation();
  const loading = useRef(false);
  const [imgBefore, setImageBefore] = useState<ImageSourcePropType>(require('../../assets/images/pic/real_name_before.png'));
  const [imgAfter, setImageAfter] = useState<ImageSourcePropType>(require('../../assets/images/pic/real_name_after.png'));
  const [realName, setRealName] = useState('');
  const [cardNum, setCardNum] = useState('');
  // 认证步骤，1可认证，2认证中，3驳回，4通过
  const [submitType, setSubmitType] = useState<'1'|'2'|'3'|'4'>('1');
  // 图片是否上传成功
  const imageIsUpload = useRef([false, false]);

  const addEvent = {
    selectImage: (type: number) => {
      if (submitType === '2' || submitType === '4') return;
      const selectType = ['相册', '拍照'];
      const close = showSelector({
        data: selectType,
        selected: '',
        onPress: (value) => {
          if (typeof value !== 'string') return;
          addEvent.addImage(type, selectType.indexOf(value));
          close();
        },
      });
    },
    addImage: (imageType: number, changeImageType: number) => {
      if (changeImageType === 0) {
        ImagePicker.openPicker({
          width: 300,
          height: 400,
          mediaType: 'photo',
          useFrontCamera: true,
        }).then((image) => {
          if (Array.isArray(image)) return;
          if (imageType === 0) setImageBefore({ uri: image.path });
          else setImageAfter({ uri: image.path });
          imageIsUpload.current[imageType] = true;
        }).catch(err => {
          console.log(err);
        });
      } else {
        showPhoto(
          <View style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1,
          }}>
            <Image
              style={{
                width: '100%',
                height: '100%',
              }}
              source={
              imageType === 0 ? require('../../assets/images/pic/real_name_caream_before.png')
                : require('../../assets/images/pic/real_name_caream_after.png')
            } />
          </View>,
        ).then(data => {
          if (imageType === 0) setImageBefore({ uri: data });
          else setImageAfter({ uri: data });
          imageIsUpload.current[imageType] = true;
          console.log(imageIsUpload);
        });
      }
    },
    changeText: (text: string, dispatch: typeof setRealName) => {
      if (submitType === '2' || submitType === '4') return;
      dispatch(text);
    },
    verifyForm: () => {
      if (submitType === '2' || submitType === '4') return;
      if (loading.current) return;
      let showError = '';
      if (imageIsUpload.current.filter(item => item === false).length !== 0) showError = '请选择身份证图片';
      if (!isRealName(realName)) showError = '请输入正确的真实姓名';
      if (!IdentityCodeValid(cardNum)) showError = '请输入正确的身份证号码';
      if (showError) {
        showMessage({
          message: '请检查',
          description: showError,
          type: 'warning',
        });
        return;
      }
      addEvent.submit();
    },
    upLoadPic: async (img: ImageSourcePropType) => {
      const fm = new FormData();
      const beforeUri = (img as ImageURISource).uri as string;
      const file = {
        uri: Platform.OS === 'android' ? beforeUri : beforeUri.replace('file://', ''),
        type: `image/${beforeUri.split('.').pop()?.[0]}`,
        name: beforeUri.split('/').pop()?.[0],
      };
      fm.append('file', file as any);
      const result = await ajax.post('/v1/upload/auth_photo', fm, {
        noHeaders: true,
      }).then(data => {
        return data.data.Data.filePath;
      }).catch(err => {
        console.log(err);
      });
      return result;
    },
    submit: async () => {
      loading.current = true;
      const closeLoading = showComLoading('上传中');
      try {
        const [beforeRemote, afterRemote] = await Promise.all([addEvent.upLoadPic(imgBefore), addEvent.upLoadPic(imgAfter)]);
        const token = await ajax.get('/v1/auth/auth_view').then(data => data.data.token);
        const result = await ajax.post('/v1/auth/action_auth', {
          // 正面
          positive_photo: beforeRemote,
          // 背面
          back_photo: afterRemote,
          real_name: realName,
          type: '1',
          id_card: cardNum,
          token,
        });
        if (result.status === 200) {
          showMessage({
            message: '提交成功，请等待审核',
            type: 'success',
          });
          setSubmitType('2');
        } else {
          showMessage({
            message: result.message,
            type: 'warning',
          });
        }
        loading.current = false;
        closeLoading();
      } catch (err) {
        console.log(err);
        closeLoading();
      }
      // addEvent.success();
    },
    success: () => {
      const close = showComAlert({
        title: '提交成功',
        desc: '个人信息已提交，请等待审核',
        success: {
          text: '确定',
          onPress: () => {
            navigation.goBack();
            close();
          },
        },
      });
    },
  };

  useEffect(() => {
    ajax.get('/v1/auth/auth_view').then(async data => {
      console.log(data);
      // 如果有类型
      if (data?.data?.data) {
        const user = data.data.data;
        if (user.status) setSubmitType(data.data.data.status);
        if (user.status !== '3') {
          if (user.positive_photo) setImageBefore({ uri: user.back_photo });
          if (user.back_photo) setImageAfter({ uri: user.back_photo });
          if (user.real_name) setRealName(user.real_name);
          if (user.id_card) setCardNum(user.id_card);
        }
        // 提示信息
        try {
          const tipType = `${await storage.get('realNameNews')}`;
          if (tipType !== user.status) {
            if (user.status === '3') {
              showMessage({
                message: '身份认证被驳回，请重新认证',
                type: 'warning',
                autoHide: false,
              });
            } else if (user.status === '4') {
              showMessage({
                message: '身份认证成功',
                type: 'success',
              });
            }
          }
          storage.save('realNameNews', user.status);
        } catch (err) {
          if (user.status === '3') {
            showMessage({
              message: '身份认证被驳回，请重新认证',
              type: 'warning',
              autoHide: false,
            });
          } else if (user.status === '4') {
            showMessage({
              message: '身份认证成功',
              type: 'success',
            });
          }
          storage.save('realNameNews', user.status);
          console.log(err);
        }
      }
    }).catch(err => console.log(err));
  }, []);

  return (
    <ComLayoutHead
      title="身份认证"
      scrollStyle={{
        backgroundColor: themeWhite,
      }}>
      <ComLine />
      {/* 身份证正面 */}
      <TouchableNativeFeedback onPress={() => addEvent.selectImage(0)}>
        <View
          style={{
            padding: 30,
            position: 'relative',
          }}>
          <StaticImage
            resizeMode="stretch"
            source={require('../../assets/images/pic/real_name_bg.png')}
            style={((): StyleProp<ImageStyle> => {
              const { width } = Dimensions.get('window');
              const picWidth = width * 0.7;
              return {
                width: picWidth,
                height: picWidth * 0.6,
                alignSelf: 'center',
              };
            })()} />
          <View style={((): StyleProp<ViewStyle> => {
            const { width } = Dimensions.get('window');
            const picWidth = width * 0.6;
            return {
              width: picWidth,
              height: picWidth * 0.6,
              alignSelf: 'center',
              position: 'absolute',
              top: 30 + picWidth * 0.05,
              left: width * 0.5,
              marginLeft: picWidth * -0.5,
              zIndex: -1,
            };
          })()}>
            <Image
              resizeMode="stretch"
              source={imgBefore}
              style={{
                width: '100%',
                height: '100%',
              }} />
          </View>
          <Text style={{
            textAlign: 'center',
            fontSize: 16,
            color: defaultThemeColor,
            paddingTop: 10,
          }}>
            点击上传带头像的一面
          </Text>
        </View>
      </TouchableNativeFeedback>
      {/* 身份证反面 */}
      <TouchableNativeFeedback onPress={() => addEvent.selectImage(1)}>
        <View
          style={{
            position: 'relative',
            paddingBottom: 10,
          }}>
          <StaticImage
            resizeMode="stretch"
            source={require('../../assets/images/pic/real_name_bg.png')}
            style={((): StyleProp<ImageStyle> => {
              const { width } = Dimensions.get('window');
              const picWidth = width * 0.7;
              return {
                width: picWidth,
                height: picWidth * 0.6,
                alignSelf: 'center',
              };
            })()} />
          <View style={((): StyleProp<ViewStyle> => {
            const { width } = Dimensions.get('window');
            const picWidth = width * 0.6;
            return {
              width: picWidth,
              height: picWidth * 0.6,
              alignSelf: 'center',
              position: 'absolute',
              top: picWidth * 0.05,
              left: width * 0.5,
              marginLeft: picWidth * -0.5,
              zIndex: -1,
            };
          })()}>
            <Image
              resizeMode="stretch"
              source={imgAfter}
              style={{
                width: '100%',
                height: '100%',
              }} />
          </View>
          <Text style={{
            textAlign: 'center',
            fontSize: 16,
            color: defaultThemeColor,
            paddingTop: 10,
          }}>
            点击上传带国徽一面
          </Text>
        </View>
      </TouchableNativeFeedback>

      <ComLine />

      <View style={{
        flexDirection: 'row',
        padding: 10,
        borderBottomColor: defaultThemeBgColor,
        borderBottomWidth: 1,
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 16,
          flex: 1,
        }}>
          真实姓名
        </Text>
        <Input
          containerStyle={{
            flex: 3,
            height: 40,
          }}
          errorStyle={{
            height: 0,
          }}
          inputContainerStyle={{
            borderBottomWidth: 0,
            height: 40,
          }}
          inputStyle={{
            fontSize: 16,
            padding: 0,
          }}
          placeholder="请输入您的真实姓名"
          value={realName}
          onChangeText={text => addEvent.changeText(text, setRealName)} />
      </View>
      <View style={{
        flexDirection: 'row',
        padding: 10,
        borderBottomColor: defaultThemeBgColor,
        borderBottomWidth: 1,
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 16,
          flex: 1,
        }}>
          身份证号
        </Text>
        <Input
          containerStyle={{
            flex: 3,
            height: 40,
          }}
          errorStyle={{
            height: 0,
          }}
          inputContainerStyle={{
            borderBottomWidth: 0,
            height: 40,
          }}
          inputStyle={{
            fontSize: 16,
            padding: 0,
          }}
          placeholder="请输入您的身份证号"
          value={cardNum}
          keyboardType="default"
          onChangeText={text => addEvent.changeText(text, setCardNum)} />
      </View>

      <ComFormButton
        containerStyle={{
          marginBottom: 20,
          marginTop: 20,
        }}
        onPress={addEvent.verifyForm}
        title={
          ['提交', '认证中', '提交', '已通过'][Number(submitType) - 1]
        } />
      {
        submitType === '3'
        && (
        <Text style={{
          textAlign: 'center',
          color: themeRed,
          fontSize: 14,
        }}>
          被驳回
        </Text>
        )
      }
    </ComLayoutHead>
  );
};

export default MyRealnameScreen;
