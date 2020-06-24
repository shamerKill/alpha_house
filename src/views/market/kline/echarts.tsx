/* eslint-disable prefer-template */
import React, {
  FC, useRef, useEffect, useState,
} from 'react';
import {
  StyleProp, ViewStyle, View, StyleSheet, Platform, Text,
} from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { EChartOption } from 'echarts';
import {
  themeGreen, themeRed, themeMoreBlue, defaultThemeColor, getThemeOpacity, defaultThemeBgColor, themeWhite, themeGray,
} from '../../../config/theme';
import mockData from './mock';
import toString from '../../../tools/toStrting';

// 折线数据类型
type TypeKlineValue = {
  time: string; // 时间
  maxValue: string; // 最高价
  minValue: string; // 最低价
  openValue: string; // 开盘价
  closeValue: string; // 关盘价
  volume: string; // 成交量
};

const data = mockData.map(item => {
  const result = { ...item };
  result.volume = (Number(item.volume) + (Math.random() * 10000)).toString();
  return result;
});

// 日线获取
function calculateMA(dayCount: number, inData: TypeKlineValue[], type: keyof TypeKlineValue = 'closeValue') {
  const result = [];
  for (let i = 0, len = inData.length; i < len; i++) {
    if (i < dayCount) {
      result.push('-');
    } else {
      let sum = 0;
      for (let j = 0; j < dayCount; j++) {
        sum += parseFloat(inData[i - j][type]);
      }
      result.push((sum / dayCount).toFixed(2));
    }
  }
  return result;
}
// MACD/DIFF/DEA获取
// 公式如下所示：
// 加权平均指数（DI）=（当日最高指数+当日收盘指数+2倍的当日最低指数）
// 十二日平滑系数（L12）=2/（12+1）=0.1538
// 二十六日平滑系数（L26）=2/（26+1）=0.0741
// 十二日指数平均值（12日EMA）=L12×当日收盘指数+11/（12+1）×昨日的12日EMA
// 二十六日指数平均值（26日EMA）=L26×当日收盘指数+25/（26+1）×昨日的26日EMA
// 差离率（DIF）=12日EMA-26日EMA 九日DIF
// 平均值（DEA） =最近9日的DIF之和/9
// 柱状值（BAR）=DIF-DEA
// MACD=（当日的DIF-昨日的DIF）×0.2+昨日的MACD
function getMACD(inData: TypeKlineValue[]) {
  const result: {
    macd: number[];
    diff: number[];
    dea: number[];
  } = {
    macd: [],
    diff: [],
    dea: [],
  };
  // 十二日平滑系数
  const l12 = 2 / (12 + 1);
  const l12EMAArr: number[] = [];
  // 二十六日平滑系数
  const l26 = 2 / (26 + 1);
  const l26EMAArr: number[] = [];
  // DIFF数组
  const DIFFArr: number[] = [];
  // macd
  const MACDArr: number[] = [];
  // 计算DEA
  const DEAarr: number[] = [];
  // 计算12riEMA和26日EMA 和diff
  let prevDIFF = 0;
  let prevMACD = 0;
  inData.forEach((item, index) => {
    let addl12;
    let addl26;
    if (index < 12) {
      addl12 = 0;
      l12EMAArr.push(addl12);
    } else {
      addl12 = l12 * parseFloat(item.closeValue) + ((12 - 1) / (12 + 1)) * l12EMAArr[l12EMAArr.length - 1];
      l12EMAArr.push(addl12);
    }
    if (index < 26) {
      addl26 = 0;
      l26EMAArr.push(addl26);
    } else {
      addl26 = l26 * parseFloat(item.closeValue) + ((26 - 1) / (26 + 1)) * l26EMAArr[l26EMAArr.length - 1];
      l26EMAArr.push(addl26);
    }
    const diffItem = addl12 - addl26;
    DIFFArr.push(diffItem);
    DEAarr.push((2 / (9 + 1)) * diffItem + ((9 - 1) / (9 + 1)) * prevDIFF);
    const macdItem = (diffItem - prevDIFF) * 0.2 + prevMACD;
    MACDArr.push(prevMACD);
    prevMACD = macdItem;
    prevDIFF = diffItem;
  });
  result.diff = DIFFArr;
  result.dea = DEAarr;
  result.macd = MACDArr;
  return result;
}

// echarts配置
const option: EChartOption = {
  animation: false,
  textStyle: {
    fontSize: 10,
    lineHeight: 10,
  },
  // 标题
  title: [
    {
      text: `{a|MA5:${9234.12}}  {b|MA10:${9512.12}}  {c|MA20:${9124.12}}`,
      textStyle: {
        rich: {
          a: { color: '#ddc680' },
          b: { color: '#61d2c0' },
          c: { color: '#ca93fb' },
        },
      },
    },
    {
      text: `{o|VOL:${9234.12}}  {a|MA5:${9512.12}}  {b|MA10:${9124.12}}`,
      textStyle: {
        rich: {
          a: { color: '#ddc680' },
          b: { color: '#61d2c0' },
          o: { color: themeGray },
        },
      },
      top: '65%',
    },
    {
      text: `{o|MACD[12,26,9]}  {o|MACD:${-10.2}} {a|DIF:${9124.12}}  {b|DEA:${9124.12}}`,
      textStyle: {
        rich: {
          a: { color: '#ddc680' },
          b: { color: '#61d2c0' },
          o: { color: themeGray },
        },
      },
      top: '80%',
    },
  ],
  grid: [
    {
      left: 0,
      top: '0%',
      right: '10%',
      height: '65%',
    },
    {
      left: 0,
      top: '65%',
      right: '10%',
      height: '15%',
    },
    {
      left: 0,
      top: '80%',
      right: '10%',
      height: '15%',
    },
  ],
  xAxis: [
    {
      type: 'category',
      gridIndex: 0,
      data: data.map(item => item.time),
      splitLine: { show: true, lineStyle: { color: getThemeOpacity(defaultThemeBgColor, 0.1) } },
      axisLine: { lineStyle: { color: getThemeOpacity(defaultThemeBgColor, 0.1) } },
      axisTick: { show: false },
      axisLabel: { show: false },
      axisPointer: { label: { show: false } },
    },
    {
      type: 'category',
      gridIndex: 1,
      data: data.map(item => item.time),
      splitLine: { show: true, lineStyle: { color: getThemeOpacity(defaultThemeBgColor, 0.1) } },
      axisLine: { lineStyle: { color: getThemeOpacity(defaultThemeBgColor, 0.1) } },
      axisTick: { show: false },
      axisLabel: { show: false },
      axisPointer: { label: { show: false } },
    },
    {
      type: 'category',
      gridIndex: 2,
      data: data.map(item => item.time),
      splitLine: { show: true, lineStyle: { color: getThemeOpacity(defaultThemeBgColor, 0.1) } },
      axisLine: { show: false, lineStyle: { color: getThemeOpacity(defaultThemeBgColor, 0.1) } },
      axisTick: { show: false },
      axisLabel: {
        show: true,
        color: getThemeOpacity(themeWhite, 0.6),
      },
      axisPointer: { show: true },
    },
  ],
  yAxis: [
    {
      scale: true,
      gridIndex: 0,
      position: 'right',
      splitLine: { show: true, lineStyle: { color: getThemeOpacity(defaultThemeBgColor, 0.1) } },
      splitNumber: 3,
      axisLine: { lineStyle: { color: getThemeOpacity(defaultThemeBgColor, 0.1) } },
      axisTick: { show: false },
      axisLabel: {
        show: true,
        margin: 1,
        color: getThemeOpacity(themeWhite, 0.6),
        fontSize: 10,
        padding: [15, 0, 0, 0],
      },
    },
    {
      scale: true,
      gridIndex: 1,
      position: 'right',
      splitLine: { show: false },
      axisLine: { lineStyle: { color: getThemeOpacity(defaultThemeBgColor, 0.1) } },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
    {
      scale: true,
      gridIndex: 2,
      position: 'right',
      splitLine: { show: false },
      axisLine: { lineStyle: { color: getThemeOpacity(defaultThemeBgColor, 0.1) } },
      axisTick: { show: false },
      axisLabel: { show: false },
    },
  ],
  dataZoom: [
    {
      type: 'inside',
      xAxisIndex: [0, 1, 2],
      minValueSpan: 40,
      start: 100,
    },
  ],
  tooltip: {
    trigger: 'axis',
    triggerOn: 'click',
    axisPointer: {
      type: 'cross',
      lineStyle: {
        color: defaultThemeColor,
        opacity: 0.5,
        type: 'dashed',
      },
      crossStyle: {
        color: defaultThemeColor,
        opacity: 0.5,
      },
      label: {
        precision: 2,
        color: defaultThemeColor,
        shadowBlur: 0,
        padding: 2,
        backgroundColor: getThemeOpacity(defaultThemeBgColor, 0.9),
      },
    },
    position(point, _params, _dom, _rect, size) {
      const obj: { [key: string]: number } = { top: 0 };
      obj[['left', 'right'][Number(point[0] < (size as {viewSize: number[]}).viewSize[0] / 2)]] = 5;
      return obj;
    },
    // TODO: formatter没有写
    // formatter(params) {
    //   let paramsData: EChartOption.Tooltip.Format[];
    //   if (Array.isArray(params)) {
    //     // eslint-disable-next-line prefer-destructuring
    //     paramsData = params;
    //   } else {
    //     paramsData = [params];
    //   }
    //   // let value = '';
    //   // value += '<p style="color: ' + paramsData.color + '; margin: 0; font-size: 12px;">时间: ' + paramsData.name + '</p>';
    //   // value += '<div style="color: #ccc; font-size: 12px;">';
    //   // value += '开盘价: ' + paramsData.data[1] + '<br />';
    //   // value += '关盘价: ' + paramsData.data[2] + '<br />';
    //   // value += '最高价: ' + paramsData.data[3] + '<br />';
    //   // value += '最低价: ' + paramsData.data[4];
    //   // value += '</div>';
    //   window.ReactNativeWebView.postMessage(JSON.stringify(paramsData.map(item => ({ name: item.seriesName, value: item.value })), null, 2));
    //   return '';
    // },
  },
  axisPointer: {
    link: [{
      xAxisIndex: 'all',
    }],
  },
  visualMap: [
    {
      show: false,
      seriesIndex: 4,
      dimension: 2,
      pieces: [{
        value: 1,
        color: themeGreen,
      }, {
        value: -1,
        color: themeRed,
      }],
    },
    {
      show: false,
      seriesIndex: 7,
      dimension: 2,
      pieces: [{
        value: 1,
        color: themeGreen,
      }, {
        value: -1,
        color: themeRed,
      }],
    },
  ],
  series: [
    // k线
    {
      name: 'kLine',
      type: 'candlestick',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: data.map(item => ([item.openValue, item.closeValue, item.minValue, item.maxValue])),
      itemStyle: {
        color: themeGreen,
        color0: themeRed,
        borderColor: themeGreen,
        borderColor0: themeRed,
      },
      markLine: {
        silent: true,
        symbolSize: 0,
        animation: false,
        label: { position: 'insideEndTop' },
        lineStyle: { color: defaultThemeColor },
        data: [{ yAxis: parseFloat(data[data.length - 1].closeValue) }],
      },
      markPoint: {
        symbol: 'circle',
      },
      tooltip: {
        formatter(params) {
          let paramsData;
          if (Array.isArray(params)) {
            // eslint-disable-next-line prefer-destructuring
            paramsData = params[0];
          } else {
            paramsData = params;
          }
          let value = '';
          value += '<p style="color: ' + paramsData.color + '; margin: 0; font-size: 12px;">时间: ' + paramsData.name + '</p>';
          value += '<div style="color: #ccc; font-size: 12px;">';
          value += '开盘价: ' + paramsData.data[1] + '<br />';
          value += '关盘价: ' + paramsData.data[2] + '<br />';
          value += '最高价: ' + paramsData.data[3] + '<br />';
          value += '最低价: ' + paramsData.data[4];
          value += '</div>';
          return value;
        },
        backgroundColor: themeMoreBlue,
        borderColor: 'rgba(44, 39, 88, 0.8)',
        borderWidth: 2,
      },
    },
    // ma5日线
    {
      name: 'MA5',
      type: 'line',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: calculateMA(5, data),
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#ddc680',
      },
    },
    // ma10日线
    {
      name: 'MA10',
      type: 'line',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: calculateMA(10, data),
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#61d2c0',
      },
    },
    // ma15日线
    {
      name: 'MA15',
      type: 'line',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: calculateMA(15, data),
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#ca93fb',
      },
    },
    // 量能
    {
      name: 'volume',
      type: 'bar',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: data.map((item, index) => ([index, item.volume, (Number(item.volume) - Number(data[index - 1]?.volume)) > 0 ? 1 : -1])),
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#ca93fb',
      },
    },
    // 量能MA5日线
    {
      name: 'volumeMA5',
      type: 'line',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: calculateMA(5, data, 'volume'),
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#ddc680',
      },
    },
    // 量能MA10日线
    {
      name: 'volumeMA5',
      type: 'line',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: calculateMA(10, data, 'volume'),
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#61d2c0',
      },
    },
    // MACD列
    {
      name: 'macd',
      type: 'bar',
      xAxisIndex: 2,
      yAxisIndex: 2,
      data: (() => {
        const { macd } = getMACD(data);
        return macd.map((item, index) => ({
          value: ([index, item, item > 0 ? 1 : -1]),
        }));
      })(),
      barWidth: 1,
    },
    // DIF线
    {
      name: 'DIF',
      type: 'line',
      xAxisIndex: 2,
      yAxisIndex: 2,
      data: getMACD(data).diff.map(item => (item === 0 ? '-' : item)),
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#ddc680',
      },
    },
    // DEA线
    {
      name: 'DIF',
      type: 'line',
      xAxisIndex: 2,
      yAxisIndex: 2,
      data: getMACD(data).dea.map(item => (item === 0 ? '-' : item)),
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#61d2c0',
      },
    },
  ],
};
// 传入view的echarts.js
const ecahrtJs = `
  if (window.ReactNativeWebView) {
    document.getElementById('main').style.height = '100%';
    document.getElementById('main').style.width = '100%';
    document.getElementById('main').style.backgroundColor = '${themeMoreBlue}';
    var myChart = echarts.init(document.getElementById('main'));
    var option = ${toString(option)};
    try {
      myChart.setOption(option);
    } catch (err) {
      window.ReactNativeWebView.postMessage(err.message);
    }
    window.ReactNativeWebView.postMessage('renderClose');
    window.document.addEventListener('message', function(e) {
      try {
        var option = JSON.parse(e.data);
        myChart.setOption(option);
      } catch (e) {}
    });
  }
`;

// k线图
const MarketKlineHtml: FC<{style: StyleProp<ViewStyle>}> = ({
  style: propStyle,
}) => {
  const webRef = useRef<WebView&{postMessage:(str: string) => void;}>(null);

  const [viewShow, setViewShow] = useState(false);

  const addEvent = {
    // 获取信息
    onMessage: (event: WebViewMessageEvent) => {
      console.log(event.nativeEvent.data);
      // 如果是渲染完毕
      if (event.nativeEvent.data === 'renderClose') setTimeout(() => setViewShow(true), 10);
    },
    // 加载完成
    onLoad: () => {
      if (webRef.current) webRef.current.postMessage('服务器内容');
    },
  };

  // 开发刷新
  useEffect(() => {
    if (webRef.current) webRef.current.reload();
  }, []);

  return (
    <View
      style={[
        propStyle,
        style.webViewBox,
      ]}>
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
        !viewShow && <View style={style.webViewOver}><Text style={{ color: '#fff', textAlign: 'center' }}>加载中</Text></View>
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
});

export default MarketKlineHtml;
