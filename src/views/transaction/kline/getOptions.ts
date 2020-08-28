/* eslint-disable prefer-template */
import { EChartOption } from 'echarts';
import {
  themeGreen, themeRed, defaultThemeColor, themeGray,
} from '../../../config/theme';

// 折线数据类型
export type TypeKlineValue = {
  time: string; // 时间
  maxValue: string; // 最高价
  minValue: string; // 最低价
  openValue: string; // 开盘价
  closeValue: string; // 关盘价
  volume: string; // 成交量
  create_unix?: string; // 后台传入时间
};


// 日线获取
export function calculateMA(dayCount: number, inData: TypeKlineValue[], type: keyof TypeKlineValue = 'closeValue') {
  const result = [];
  for (let i = 0, len = inData.length; i < len; i++) {
    if (i < dayCount) {
      result.push('-');
    } else {
      let sum = 0;
      for (let j = 0; j < dayCount; j++) {
        sum += parseFloat(inData[i - j][type] || '');
      }
      let fixedLength = 4;
      if ((sum / dayCount) < 0) fixedLength = 6;
      result.push(parseFloat((sum / dayCount).toFixed(fixedLength)));
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
export function getMACD(inData: TypeKlineValue[]) {
  const result: {
    macd: string[];
    diff: string[];
    dea: string[];
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
  const DIFFArr: string[] = [];
  // macd
  const MACDArr: string[] = [];
  // 计算DEA
  const DEAarr: string[] = [];
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
    DIFFArr.push(`${parseFloat(diffItem.toFixed(4))}`);
    DEAarr.push(((2 / (9 + 1)) * diffItem + ((9 - 1) / (9 + 1)) * prevDIFF).toFixed(2));
    const macdItem = (diffItem - prevDIFF) * 0.2 + prevMACD;
    MACDArr.push(`${parseFloat(prevMACD.toFixed(4))}`);
    prevMACD = macdItem;
    prevDIFF = diffItem;
  });
  result.diff = DIFFArr;
  result.dea = DEAarr;
  result.macd = MACDArr;
  return result;
}


/*
 * 计算EMA指数平滑移动平均线，用于MACD
 * @param {number} n 时间窗口
 * @param {array} data 输入数据
 * @param {string} field 计算字段配置
 */
const calcEMA = (n?: any, data?: any, field?: any) => {
  let i; let l; let ema;
  const a = 2 / (n + 1);
  if (field) {
    //二维数组
    ema = [data[0][field]];
    for (i = 1, l = data.length; i < l; i++) {
      ema.push(a * data[i][field] + (1 - a) * ema[i - 1]);
    }
  } else {
    //普通一维数组
    ema = [data[0]];
    for (i = 1, l = data.length; i < l; i++) {
      ema.push(a * data[i] + (1 - a) * ema[i - 1]);
    }
  }
  return ema;
};
/*
 * 计算DIF快线，用于MACD
 * @param {number} short 快速EMA时间窗口
 * @param {number} long 慢速EMA时间窗口
 * @param {array} data 输入数据
 * @param {string} field 计算字段配置
 */
const calcDIF = (short: any, long: any, data: any, field: any) => {
  let i; let l;
  const dif = [];
  const emaShort = calcEMA(short, data, field);
  const emaLong = calcEMA(long, data, field);
  for (i = 0, l = data.length; i < l; i++) {
    dif.push(emaShort[i] - emaLong[i]);
  }
  return dif;
};
/*
 * 计算DEA慢线，用于MACD
 * @param {number} mid 对dif的时间窗口
 * @param {array} dif 输入数据
 */
const calcDEA = (mid:any, dif: any) => {
  return calcEMA(mid, dif);
};
/*
 * 计算MACD
 * @param {number} short 快速EMA时间窗口
 * @param {number} long 慢速EMA时间窗口
 * @param {number} mid dea时间窗口
 * @param {array} data 输入数据
 * @param {string} field 计算字段配置
 */
const calcMACD = (short: any, long: any, mid: any, data: any, field: any) => {
  if (data.length === 0) {
    return {
      dif: [],
      dea: [],
      macd: [],
    };
  }
  let i; let l;
  const result: any = {};
  const macd = [];
  const dif = calcDIF(short, long, data, field);
  const dea = calcDEA(mid, dif);
  for (i = 0, l = data.length; i < l; i++) {
    macd.push((dif[i] - dea[i]) * 2);
  }
  result.dif = dif.map(item => item.toFixed(4));
  result.dea = dea.map(item => item.toFixed(4));
  result.macd = macd.map(item => item.toFixed(4));
  return result;
};
// const input = [
//   {
//     open: 3.89, close: 3.89, low: 3.86, high: 3.93,
//   },
//   {
//     open: 3.88, close: 3.85, low: 3.81, high: 3.89,
//   },
//   {
//     open: 3.85, close: 3.91, low: 3.82, high: 3.95,
//   },
//   {
//     open: 3.89, close: 4.02, low: 3.89, high: 4.07,
//   },
//   {
//     open: 4.04, close: 4.05, low: 4.00, high: 4.08,
//   },
//   {
//     open: 4.05, close: 4.00, low: 3.98, high: 4.08,
//   },
//   {
//     open: 4.00, close: 4.00, low: 3.97, high: 4.04,
//   },
//   {
//     open: 3.99, close: 3.90, low: 3.88, high: 4.00,
//   },
//   {
//     open: 3.89, close: 3.90, low: 3.88, high: 3.92,
//   },
//   {
//     open: 3.89, close: 3.98, low: 3.88, high: 3.98,
//   },
//   {
//     open: 3.99, close: 3.98, low: 3.95, high: 4.03,
//   },
//   {
//     open: 3.98, close: 4.06, low: 3.96, high: 4.08,
//   },
//   {
//     open: 4.08, close: 4.08, low: 4.02, high: 4.08,
//   },
// ];
// console.log(calcMACD(12, 26, 9, input, 'close'));

export const getOptionSerise = (inputData: TypeKlineValue[]): EChartOption['series'] => {
  const macdInput = inputData.map(item => (
    {
      open: parseFloat(item.openValue),
      close: parseFloat(item.closeValue),
      low: parseFloat(item.minValue),
      high: parseFloat(item.maxValue),
    }
  ));
  return [
    // k线
    {
      name: 'kLine',
      type: 'candlestick',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: inputData.map(item => ([item.openValue, item.closeValue, item.minValue, item.maxValue])),
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
        data: [{ yAxis: inputData.length ? parseFloat(inputData[inputData.length - 1].closeValue) : 0 }],
      },
      markPoint: {
        symbol: 'rect',
        data: [
          {
            name: 'highest value',
            type: 'max',
            valueDim: 'highest',
          },
          {
            name: 'lowest value',
            type: 'min',
            valueDim: 'lowest',
          },
        ],
        label: {
          color: '#e7e7e7',
          fontWeight: '900',
        },
        itemStyle: {
          // color: '#e7e7e7',
        },
        symbolSize: [1, 1],
        symbolOffset: [0, 8],
      },
    },
    // ma5日线
    {
      name: 'MA5',
      type: 'line',
      xAxisIndex: 0,
      yAxisIndex: 0,
      data: calculateMA(5, inputData),
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
      data: calculateMA(10, inputData),
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
      data: calculateMA(15, inputData),
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
      data: inputData.map((item, index) => ([index, item.volume, (Number(item.volume) - Number(inputData[index - 1]?.volume)) > 0 ? 1 : -1])),
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
      data: calculateMA(5, inputData, 'volume'),
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#ddc680',
      },
    },
    // 量能MA10日线
    {
      name: 'volumeMA10',
      type: 'line',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: calculateMA(10, inputData, 'volume'),
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
        const { macd } = calcMACD(12, 26, 9, macdInput, 'close');
        return macd.map((item: number, index: number) => ({
          value: ([index, item, Number(item) > 0 ? 1 : -1]),
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
      data: calcMACD(12, 26, 9, macdInput, 'close').dif,
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#ddc680',
      },
    },
    // DEA线
    {
      name: 'DEA',
      type: 'line',
      xAxisIndex: 2,
      yAxisIndex: 2,
      data: calcMACD(12, 26, 9, macdInput, 'close').dea,
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 1.5,
        color: '#61d2c0',
      },
    },
  ];
};

export const getOptionTitle = (input: EChartOption['series']): EChartOption['title'] => {
  if (input === undefined) return [];
  return [
    {
      text: `{a|MA5:${input[1].data?.[input[1].data?.length - 1]}}  {b|MA10:${input[2].data?.[input[2].data?.length - 1]}}  {c|MA20:${input[3].data?.[input[3].data?.length - 1]}}`,
      textStyle: {
        rich: {
          a: { color: '#ddc680' },
          b: { color: '#61d2c0' },
          c: { color: '#ca93fb' },
        },
      },
    },
    {
      text: `{o|VOL:${input[4].data?.[input[4].data?.length - 1]}}  {a|MA5:${input[5].data?.[input[5].data?.length - 1]}}  {b|MA10:${input[6].data?.[input[6].data?.length - 1]}}`,
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
      text: `{o|MACD[12,26,9]}  {o|MACD:${
        (input[7].data?.[input[7].data?.length - 1] as any)?.value?.[1]
      }} {a|DIF:${
        input[8].data?.[input[8].data?.length - 1]
      }}  {b|DEA:${
        input[9].data?.[input[9].data?.length - 1]
      }}`,
      textStyle: {
        rich: {
          a: { color: '#ddc680' },
          b: { color: '#61d2c0' },
          o: { color: themeGray },
        },
      },
      top: '80%',
    },
  ];
};

// echarts配置
const getOption = (inputData: TypeKlineValue[]): EChartOption => {
  const macdInput = inputData.map(item => (
    {
      open: parseFloat(item.openValue),
      close: parseFloat(item.closeValue),
      low: parseFloat(item.minValue),
      high: parseFloat(item.maxValue),
    }
  ));
  return {
    animation: false,
    textStyle: {
      fontSize: 10,
      lineHeight: 10,
    },
    // 标题
    title: [
      {
        text: '{a|MA5:}  {b|MA10:}  {c|MA20:}',
        textStyle: {
          rich: {
            a: { color: '#ddc680' },
            b: { color: '#61d2c0' },
            c: { color: '#ca93fb' },
          },
        },
      },
      {
        text: '{o|VOL:}  {a|MA5:}  {b|MA10:}',
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
        text: '{o|MACD[12,26,9]}  {o|MACD: {a|DIF:}  {b|DEA:}',
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
        top: '5%',
        right: '10%',
        height: '60%',
      },
      {
        left: 0,
        top: '70%',
        right: '10%',
        height: '10%',
      },
      {
        left: 0,
        top: '85%',
        right: '10%',
        height: '10%',
      },
    ],
    xAxis: [
      {
        type: 'category',
        gridIndex: 0,
        data: inputData.map(item => item.time),
        splitLine: { show: true, lineStyle: { color: '#3c3769' } },
        axisLine: { lineStyle: { color: '#3c3769' } },
        axisTick: { show: false },
        axisLabel: { show: false },
        axisPointer: { label: { show: false } },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: inputData.map(item => item.time),
        splitLine: { show: true, lineStyle: { color: '#3c3769' } },
        axisLine: { lineStyle: { color: '#3c3769' } },
        axisTick: { show: false },
        axisLabel: { show: false },
        axisPointer: { label: { show: false } },
      },
      {
        type: 'category',
        gridIndex: 2,
        data: inputData.map(item => item.time),
        splitLine: { show: true, lineStyle: { color: '#3c3769' } },
        axisLine: { show: false, lineStyle: { color: '#3c3769' } },
        axisTick: { show: false },
        axisLabel: {
          show: true,
          color: '#8984b3',
        },
        axisPointer: { show: true },
      },
    ],
    yAxis: [
      {
        scale: true,
        gridIndex: 0,
        position: 'right',
        splitLine: { show: true, lineStyle: { color: '#3c3769' } },
        splitNumber: 3,
        axisLine: { lineStyle: { color: '#3c3769' } },
        axisTick: { show: false },
        axisLabel: {
          show: true,
          margin: 1,
          color: '#8984b3',
          fontSize: 10,
          padding: [15, 0, 0, 0],
        },
      },
      {
        scale: true,
        gridIndex: 1,
        position: 'right',
        splitLine: { show: false },
        axisLine: { lineStyle: { color: '#3c3769' } },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
      {
        scale: true,
        gridIndex: 2,
        position: 'right',
        splitLine: { show: false },
        axisLine: { lineStyle: { color: '#3c3769' } },
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
          backgroundColor: '#e7e7e7',
        },
      },
      position(point, _params, _dom, _rect, size) {
        const obj: { [key: string]: number } = { top: 0 };
        obj[['left', 'right'][Number(point[0] < (size as {viewSize: number[]}).viewSize[0] / 2)]] = 5;
        return obj;
      },
      formatter(params) {
        let paramsData: EChartOption.Tooltip.Format[];
        if (Array.isArray(params)) {
          paramsData = params;
        } else {
          paramsData = [params];
        }
        let kLineData: any = [];
        for (let i = 0; i < paramsData.length; i++) {
          if (paramsData[i].seriesName === 'kLine') {
            kLineData = paramsData[i].value;
          }
        }
        let value = '';
        value += '<div style="color: #ccc; font-size: 12px;">';
        value += 'openPrice: ' + kLineData[1] + '<br />';
        value += 'closePrice: ' + kLineData[2] + '<br />';
        value += 'lowPrice: ' + kLineData[3] + '<br />';
        value += 'heightPrice: ' + kLineData[4];
        value += '</div>';
        return value;
      },
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
        data: inputData.map(item => ([item.openValue, item.closeValue, item.minValue, item.maxValue])),
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
          data: [{ yAxis: inputData.length ? parseFloat(inputData[inputData.length - 1].closeValue) : 0 }],
        },
        markPoint: {
          symbol: 'circle',
        },
      },
      // ma5日线
      {
        name: 'MA5',
        type: 'line',
        xAxisIndex: 0,
        yAxisIndex: 0,
        data: calculateMA(5, inputData),
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
        data: calculateMA(10, inputData),
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
        data: calculateMA(15, inputData),
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
        data: inputData.map((item, index) => ([index, item.volume, (Number(item.volume) - Number(inputData[index - 1]?.volume)) > 0 ? 1 : -1])),
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
        data: calculateMA(5, inputData, 'volume'),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1.5,
          color: '#ddc680',
        },
      },
      // 量能MA10日线
      {
        name: 'volumeMA10',
        type: 'line',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: calculateMA(10, inputData, 'volume'),
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
          const { macd } = calcMACD(12, 26, 9, macdInput, 'close');
          return macd.map((item: number, index: number) => ({
            value: ([index, item, Number(item) > 0 ? 1 : -1]),
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
        data: calcMACD(12, 26, 9, macdInput, 'close').dif,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1.5,
          color: '#ddc680',
        },
      },
      // DEA线
      {
        name: 'DEA',
        type: 'line',
        xAxisIndex: 2,
        yAxisIndex: 2,
        data: calcMACD(12, 26, 9, macdInput, 'close').dea,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1.5,
          color: '#61d2c0',
        },
      },
    ],
  };
};

export default getOption;
