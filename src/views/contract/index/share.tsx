import React, {
  FC, useCallback, useRef,
} from 'react';
import {
  View, Image, Text, PermissionsAndroid, Platform, TouchableNativeFeedback, Dimensions,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { useRoute, RouteProp } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';
import CameraRoll from '@react-native-community/cameraroll';
import ComLayoutHead from '../../../components/layout/head';
import {
  defaultThemeColor, themeRed, themeGreen, themeGray, themeBlack,
} from '../../../config/theme';

const ContractLogsShareScreen: FC = () => {
  const route = useRoute<RouteProp<{share: { closePrice: string; openPrice: string; ratio: string; symbol: string; type: 0|1 }}, 'share'>>();
  const routeParams = route.params;
  const viewRef = useRef<View>(null);
  const { width } = Dimensions.get('window');

  const download = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if (granted !== 'granted') {
          showMessage({
            position: 'bottom',
            message: '权限不足',
            description: '请打开应用储存权限后点击下载',
            type: 'warning',
          });
          return;
        }
      } catch (err) {
        console.log(err);
      }
    }
    captureRef(viewRef, {
      format: 'jpg',
      quality: 0.8,
    }).then(
      uri => {
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
        CameraRoll.save(uri).then(() => {
          showMessage({
            position: 'bottom',
            message: '保存成功',
            description: '图片已保存至手机，请前往图库查看',
            type: 'success',
          });
        }).catch((err) => {
          console.log(err);
          errFunc(err);
        });
      },
      error => {
        console.error('Oops, snapshot failed', error);
        showMessage({
          position: 'bottom',
          type: 'warning',
          message: '收益截图保存失败，请手动截图',
        });
      },
    );
  }, []);

  return (
    <ComLayoutHead
      title="持仓收益分享"
      overScroll
      scrollStyle={{
        backgroundColor: '#3ca8f4',
      }}
      rightComponent={(
        <TouchableNativeFeedback onPress={() => download()}>
          <Text style={{ color: defaultThemeColor, fontSize: 15 }}>海报下载</Text>
        </TouchableNativeFeedback>
      )}>
      <View
        ref={viewRef}
        collapsable={false}
        style={{
          height: width * 1.7,
          width,
          alignSelf: 'center',
          position: 'relative',
        }}>
        <Image
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1,
          }}
          resizeMode="stretch"
          source={require('../../../assets/images/pic/order_share_bg.jpg')} />
        <Image
          style={{
            position: 'absolute',
            top: width * 0.28,
            left: width * 0.3,
            width: width * 0.4,
            height: width * 0.55,
          }}
          resizeMode="stretch"
          source={
            parseFloat(routeParams.ratio) < 0 ? require('../../../assets/images/pic/order_low.png') : require('../../../assets/images/pic/order_win.png')
          } />
        {/* 收益率 */}
        <View style={{
          marginTop: width * 0.86,
          height: width * 0.3,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            color: parseFloat(routeParams.ratio) < 0 ? themeRed : themeGreen,
            fontSize: 34,
            fontWeight: 'bold',
          }}>
            {routeParams.ratio}
          </Text>
          <Text style={{
            color: themeGray,
            fontSize: 16,
            marginTop: '2%',
          }}>
            收益率
          </Text>
        </View>
        {/* 更多信息 */}
        <View style={{
          flexDirection: 'row',
          paddingLeft: width * 0.07,
          paddingRight: width * 0.07,
          justifyContent: 'space-between',
          alignItems: 'center',
          height: width * 0.24,
        }}>
          <View>
            <Text style={{ fontSize: 18, color: themeBlack }}>
              {routeParams.symbol.replace('USDT', '/USDT')}
            </Text>
            <Text style={{ fontSize: 14, color: [themeRed, themeGreen][routeParams.type], paddingTop: 10 }}>
              {['开空', '开多'][routeParams.type]}
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, color: themeBlack, textAlign: 'center' }}>
              {routeParams.openPrice}
            </Text>
            <Text style={{ fontSize: 14, color: themeGray, paddingTop: 10 }}>
              开仓价格
            </Text>
          </View>
          <View>
            <Text style={{ fontSize: 18, color: themeBlack, textAlign: 'right' }}>
              {routeParams.closePrice}
            </Text>
            <Text style={{ fontSize: 14, color: themeGray, paddingTop: 10 }}>
              当前价格
            </Text>
          </View>
        </View>
      </View>
    </ComLayoutHead>
  );
};

export default ContractLogsShareScreen;
