import React, { FC, useRef } from 'react';
import {
  View, Text, ImageSourcePropType, Dimensions, ImageURISource, TouchableNativeFeedback, Platform, PermissionsAndroid,
} from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, Image } from 'react-native-elements';
import Clipboard from '@react-native-community/clipboard';
import { showMessage } from 'react-native-flash-message';
import RNFS from 'react-native-fs';
import {
  defaultThemeBgColor, defaultThemeColor, themeBlack,
} from '../../../config/theme';
import ComFormButton from '../../../components/form/button';

export type TypeMyRecommendLink = {
  link: string;
  pic: ImageSourcePropType,
};
const MyRecommendLinkScreen: FC<{input: TypeMyRecommendLink}> = ({ input }) => {
  const isDownload = useRef(false);
  const addEvent = {
    copyLink: (str: string = input.link) => {
      Clipboard.setString(str);
      showMessage({
        position: 'bottom',
        message: '复制成功',
        description: '推广链接接成功',
        type: 'success',
      });
    },
    downloadCode: async () => {
      const { uri } = input.pic as ImageURISource;
      if (!uri) {
        showMessage({
          position: 'bottom',
          message: '加载中',
          description: '图片加载中，请耐心等待',
          type: 'info',
        });
        return;
      }
      if (isDownload.current) {
        showMessage({
          position: 'bottom',
          message: '已存在',
          description: '图片已保存至手机，请前往图库查看',
          type: 'info',
        });
        return;
      }
      const uriSplitArr = uri.split('/');
      const toFileName = `alpha_house_${uriSplitArr[uriSplitArr.length - 1]}`;
      const toFile = `${RNFS.DocumentDirectoryPath}/${toFileName}`;
      const errFunc = (err: any) => {
        if (err.message.match('Permission denied')) {
          showMessage({
            position: 'bottom',
            message: '权限不足',
            description: '请打开应用储存权限后点击下载',
            type: 'warning',
          });
        } else {
          showMessage({
            position: 'bottom',
            message: '下载失败',
            description: '二维码下载失败，请手动截屏',
            type: 'warning',
          });
        }
      };
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
          if (granted !== 'granted') {
            errFunc('Permission denied');
            return;
          }
        } catch (err) {
          errFunc('Permission denied');
        }
      }
      RNFS.downloadFile({
        fromUrl: uri,
        toFile,
      }).promise.then(() => {
        CameraRoll.getPhotos({ first: 1 }).then(data => {
          if (data.edges.filter(item => item.node.image.filename === toFileName).length === 0) {
            CameraRoll.save(`file://${toFile}`).then(() => {
              showMessage({
                position: 'bottom',
                message: '保存成功',
                description: '图片已保存至手机，请前往图库查看',
                type: 'success',
              });
              isDownload.current = true;
            }).catch((err) => errFunc(err));
          } else {
            showMessage({
              position: 'bottom',
              message: '已存在',
              description: '图片已保存至手机，请前往图库查看',
              type: 'info',
            });
          }
        }).catch(err => errFunc(err));
      }).catch((err) => errFunc(err));
    },
  };
  return (
    <ScrollView
      style={{
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
      }}>
      <View style={{
        marginTop: 20,
        borderWidth: 1,
        borderColor: defaultThemeBgColor,
        borderRadius: 5,
        flexDirection: 'row',
        height: 40,
      }}>
        <Text
          numberOfLines={1}
          style={{
            flex: 8,
            height: 40,
            lineHeight: 40,
            paddingLeft: 10,
            paddingRight: 10,
            fontSize: 14,
            color: themeBlack,
          }}>
          {
            input.link === 'loading'
              ? '请稍后' : input.link
          }
        </Text>
        <Button
          containerStyle={{
            flex: 3,
          }}
          buttonStyle={{
            backgroundColor: defaultThemeColor,
          }}
          onPress={() => addEvent.copyLink()}
          title="复制链接" />
      </View>
      <View style={{
        marginTop: 20,
        paddingBottom: 20,
      }}>
        <TouchableNativeFeedback onPress={() => addEvent.copyLink(input.link.split('invite_code=')[1])}>
          <View>
            <Image
              source={input.pic}
              resizeMode="contain"
              style={{
                width: '100%',
                height: Math.round(Dimensions.get('window').width) * 1.28,
              }} />
          </View>
        </TouchableNativeFeedback>
        <ComFormButton
          title="下载二维码"
          onPress={() => addEvent.downloadCode()}
          containerStyle={{
            marginTop: 20,
            width: '100%',
            alignSelf: 'center',
          }} />
      </View>
    </ScrollView>
  );
};

export default MyRecommendLinkScreen;
