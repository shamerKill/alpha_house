import React, {
  FC, useRef, useEffect, useState,
} from 'react';
import {
  StyleProp, ViewStyle, View, StyleSheet, Platform, Text,
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { EChartOption } from 'echarts';
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
  themeMoreBlue, getThemeOpacity, defaultThemeBgColor, themeWhite,
} from '../../../config/theme';
import toString from '../../../tools/toStrting';
import getOption, { TypeKlineValue, getOptionSerise, getOptionTitle } from './getOptions';
// import mockData from './mock';
import useGetDispatch from '../../../data/redux/dispatch';
import { InState } from '../../../data/redux/state';
import Socket, { CoinToCoinSocket } from '../../../data/fetch/socket';
import formatTime from '../../../tools/time';


// const demoData = mockData.map(item =`> {
//   const result = { ...item };
//   result.volume = (Number(item.volume) + (Math.random() * 10000)).toString();
//   return result;
// });
// 传入view的echarts.js
const ecahrtJs = `
  if (window.ReactNativeWebView) {
    document.getElementById('main').style.height = '100%';
    document.getElementById('main').style.width = '100%';
    document.getElementById('main').style.backgroundColor = '${themeMoreBlue}';
    var myChart = echarts.init(document.getElementById('main'));
    var option = ${toString(getOption([]))};
    try {
      myChart.setOption(option);
    } catch (err) {
      window.ReactNativeWebView.postMessage(err.message);
    }
    window.addEventListener('message', function(e) {
      try {
        var option = JSON.parse(e.data);
        myChart.setOption(option);
      } catch (err) {
        window.ReactNativeWebView.postMessage(err.message);
      }
    });
    window.onload = function () {
      window.ReactNativeWebView.postMessage('renderClose');
    }
  }
`;

// k线图
const MarketKlineHtml: FC<{style: StyleProp<ViewStyle>}> = ({
  style: propStyle,
}) => {
  const [routePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const route = useRoute<RouteProp<{markLine: { name: string }}, 'markLine'>>();
  const routeCoinType = route.params.name.split(' ')[0].replace('/', '');
  const webRef = useRef<WebView&{postMessage:(str: string) => void}>(null);
  const socket = useRef<Socket|null>(null);
  const subSocket = useRef(false);
  const viewShowTimer = useRef(setTimeout(() => {}, 0));
  const viewShowRef = useRef(false);

  const [viewShow, setViewShow] = useState(false);
  const [gotData, setGotData] = useState(false);
  const [showType, setShowType] = useState<'1m'|'5m'|'15m'|'1h'|'4h'|'1d'>('1m');

  const addEvent = {
    // 获取信息
    onMessage: (event: WebViewMessageEvent) => {
      console.log(event.nativeEvent.data);
      // 如果是渲染完毕
      if (event.nativeEvent.data === 'renderClose') {
        setTimeout(() => setViewShow(true), 10);
        viewShowRef.current = true;
      }
    },
    // 加载完成
    onLoad: () => {
      // if (webRef.current) webRef.current.postMessage('');
    },
  };

  // 开发刷新
  useEffect(() => {
    if (webRef.current) {
      webRef.current.reload();
    }
  }, []);
  useEffect(() => {
    const getTimeValue = 500;
    const timeType: typeof showType = showType;
    const coinType = routeCoinType;
    const endTime = new Date().getTime();
    let startTime = 0;
    let fmTimeStr = 'MM-DD';
    if (timeType === '1m') {
      startTime = endTime - 500 * 60 * 1000;
      fmTimeStr = 'hh:mm';
    } else if (timeType === '5m') {
      startTime = endTime - 500 * 5 * 60 * 1000;
      fmTimeStr = 'hh:mm';
    } else if (timeType === '15m') {
      startTime = endTime - 500 * 15 * 60 * 1000;
      fmTimeStr = 'hh:mm';
    } else if (timeType === '1h') {
      startTime = endTime - 500 * 60 * 60 * 1000;
      fmTimeStr = 'MM-DD hh';
    } else if (timeType === '4h') {
      startTime = endTime - 500 * 4 * 60 * 60 * 1000;
      fmTimeStr = 'MM-DD hh';
    } else if (timeType === '1d') {
      startTime = endTime - 500 * 24 * 60 * 60 * 1000;
      fmTimeStr = 'MM-DD';
    }
    const useData: TypeKlineValue[] = [];
    const tickerImg = `cash.market.${coinType}.kline.${timeType}`;
    const tickerReq = `{"req":"gold.market.${coinType}.kline.${timeType}","create_time":"${startTime}","end_time":"${endTime}","limit":"${getTimeValue}"}`;
    const socketListener = (message: any) => {
      const resultData: {
        [key: string]: string;
      } | {
        [key: string]: string;
      }[] = message.Tick;
      if (Array.isArray(resultData)) {
        setGotData(true);
        resultData.forEach((item: any) => {
          useData.push({
            time: formatTime(fmTimeStr, Number(item.create_unix)),
            maxValue: item.height,
            minValue: item.low,
            openValue: item.open,
            closeValue: item.close,
            volume: item.quo,
            create_unix: item.create_unix,
          });
        });
      } else {
        if (useData.length && resultData.create_unix === useData[useData.length - 1].create_unix) {
          useData.splice(-1, 1);
        }
        useData.push({
          time: formatTime(fmTimeStr, Number(resultData.create_unix)),
          maxValue: resultData.height,
          minValue: resultData.low,
          openValue: resultData.open,
          closeValue: resultData.close,
          volume: resultData.quo,
          create_unix: resultData.create_unix,
        });
      }
      const newOptions: EChartOption = {
        xAxis: [
          { data: useData.map(item => item.time) },
          { data: useData.map(item => item.time) },
          { data: useData.map(item => item.time) },
        ],
        series: getOptionSerise(useData),
      };
      newOptions.title = getOptionTitle(newOptions.series);
      webRef.current?.postMessage(toString(newOptions));
    };
    if (routePage === 'TranscationKline') {
      CoinToCoinSocket.getSocket().then(ws => {
        socket.current = ws;
        ws.addListener(socketListener, tickerImg);
        ws.send(tickerReq);
        ws.send(tickerImg, 'sub');
        subSocket.current = false;
      }).catch(err => {
        console.log(err);
      });
    } else if (socket.current) {
      if (!subSocket.current) {
        console.log('close');
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(socketListener);
      }
    }
    return () => {
      if (socket.current) {
        subSocket.current = true;
        socket.current.send(tickerImg, 'unsub');
        socket.current.removeListener(tickerImg);
      }
      clearInterval(viewShowTimer.current);
    };
  }, [routePage, showType]);
  return (
    <View
      style={[
        propStyle,
        style.webViewBox,
      ]}>
      <View style={style.tebsView}>
        <TouchableNativeFeedback onPress={() => showType !== '1m' && setShowType('1m')}>
          <View style={style.tebViewBtn}>
            <Text style={[
              style.tabViewText,
              showType === '1m' && { color: themeWhite },
            ]}>
              1min
            </Text>
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => showType !== '5m' && setShowType('5m')}>
          <View style={style.tebViewBtn}>
            <Text style={[
              style.tabViewText,
              showType === '5m' && { color: themeWhite },
            ]}>
              5min
            </Text>
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => showType !== '15m' && setShowType('15m')}>
          <View style={style.tebViewBtn}>
            <Text style={[
              style.tabViewText,
              showType === '15m' && { color: themeWhite },
            ]}>
              15min
            </Text>
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => showType !== '1h' && setShowType('1h')}>
          <View style={style.tebViewBtn}>
            <Text style={[
              style.tabViewText,
              showType === '1h' && { color: themeWhite },
            ]}>
              1hour
            </Text>
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => showType !== '4h' && setShowType('4h')}>
          <View style={style.tebViewBtn}>
            <Text style={[
              style.tabViewText,
              showType === '4h' && { color: themeWhite },
            ]}>
              4hour
            </Text>
          </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={() => showType !== '1d' && setShowType('1d')}>
          <View style={style.tebViewBtn}>
            <Text style={[
              style.tabViewText,
              showType === '1d' && { color: themeWhite },
            ]}>
              1day
            </Text>
          </View>
        </TouchableNativeFeedback>
      </View>
      <WebView
        style={{ backgroundColor: themeMoreBlue }}
        ref={webRef}
        scrollEnabled={false}
        onMessage={addEvent.onMessage}
        onLoadEnd={addEvent.onLoad}
        injectedJavaScript={ecahrtJs}
        scalesPageToFit={Platform.OS !== 'ios'}
        originWhitelist={['*']}
        domStorageEnabled
        javaScriptEnabled
        source={Platform.OS === 'ios' ? require('../../../assets/html/echarts.html') : { uri: 'file:///android_asset/html/echarts.html' }} />
      {
        (!viewShow || !gotData) && <View style={style.webViewOver}><Text style={{ color: '#fff', textAlign: 'center' }}>加载中</Text></View>
      }
    </View>
  );
};

const style = StyleSheet.create({
  webViewBox: {
    backgroundColor: themeMoreBlue,
    position: 'relative',
  },
  webViewOver: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: themeMoreBlue,
  },
  tebsView: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tebViewBtn: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: getThemeOpacity(defaultThemeBgColor, 0.1),
  },
  tabViewText: {
    color: getThemeOpacity(themeWhite, 0.5),
  },
});

export default MarketKlineHtml;
