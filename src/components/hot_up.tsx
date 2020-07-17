import React, {
  FC, useEffect,
} from 'react';

import {
  Platform,
  Alert,
  Linking,
} from 'react-native';

import {
  isFirstTime,
  checkUpdate,
  downloadUpdate,
  switchVersion,
  switchVersionLater,
  markSuccess,
  CheckResult,
  UpdateAvailableResult,
} from 'react-native-update';

import _updateConfig from '../../update.json';

const CheckVersion: FC = () => {;
  const appKey = (_updateConfig as any)?.[Platform.OS]?.appKey;
  // 如果没有key，就返回
  if (!appKey) return null;
  // 如果是开发模式，返回
  if (__DEV__) return null;

  const addEvent = {
    // 检查是否有更新
    checkHasUploadInfo: async () => {
      let info: CheckResult;
      try {
        info = await checkUpdate(appKey);
      } catch (err) {
        console.warn(err);
        return;
      }
      if (info.update) {
        // 有新的更新
        Alert.alert('提示', '检查到新的版本需要下载更新\n'+ info.description?.split('\\n').join('\n'), [
          {text: '更新', onPress: ()=>{addEvent.doUpdate(info)}},
        ]);
      } else if (info.expired) {
        Alert.alert('提示', '您的应用版本已更新,请前往应用商店下载新的版本', [
          {text: '确定', onPress: ()=>{info.downloadUrl && Linking.openURL(info.downloadUrl)}},
        ]);
      }
    },
    // 下载更新
    doUpdate: async (info: CheckResult) => {
      try {
        const hash = await downloadUpdate(info as UpdateAvailableResult);
        if (!hash) return;
        Alert.alert('提示', '下载完毕,请重启应用?', [
          {text: '是', onPress: ()=>{switchVersion(hash);}},
          {text: '否',},
          {text: '下次启动时', onPress: ()=>{switchVersionLater(hash);}},
        ]);
      } catch(err) {
        Alert.alert('提示', '更新失败.');
      }
    },
    // 检查是否是第一次进入
    checkFrist: () => {
      if (isFirstTime) markSuccess();
    }
  };

  useEffect(() => {
    addEvent.checkHasUploadInfo();
    addEvent.checkFrist();
  }, []);

  return null;
}

export default CheckVersion;
