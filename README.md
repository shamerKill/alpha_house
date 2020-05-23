---
  time: 2020-05-09
  author: shamer
---

# alpha交易所

## 项目描述
使用react-native搭建的app项目

## 技术使用

### 代码规范
  - eslint
  - typescript-eslint

### 视图
  - react-native
  - react-native-elements (UI组件)
  - react-native-linear-gradient (渐变色)
  - react-native-vector-icons (图标)
  - react-native-swiper (轮播图)
  - react-native-webview (内嵌html)

### 路由
  - React Navigation (路由)
  - @react-navigation/stack (视图堆栈)
    - { cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS } 添加这一行会实现安卓下页面的左右切换，默认是从下到上
  
### 数据处理
  - redux
  - redux-observable
  - rxjs
  - realm

### 网络处理
  - fetch
  - WebSocket

### app升级
  - react-native-code-push
  - code-push

### 更改项目名
  - react-native-rename

### 启动图
  - react-native-splash-screen

### 安全处理
  - expo-local-authentication (指纹认证)
  - react-native-device-info (唯一设备码)
  - React Native Camera (二维码扫描)