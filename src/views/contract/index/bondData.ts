import { NumberTools } from '../../../tools/number';
/**
 * @description 将数字变为 [1],[[000],[000]] 类型
 * @param value 逗号前面的数字
 * @param powValue 逗号数量
**/
const powValue = (value: number, powValueData: number = 0): number => {
  let result = value;
  for (let i = 0; i < powValueData; i++) {
    result *= (10 ** 3);
  }
  return result;
};

/**
 * @description 将10%变为 0.1 类型
 * @param value %号前的数字
**/
const perValue = (value: number): number => {
  const result = new NumberTools(value).divides(100, 5).get();
  return result;
};

/**
 * @description 维持保证金计算率
**/
const bondData: {
  symbols: string[]; // 币种类型
  data: {
    min: number; // 最小名义价值
    max: number; // 最大名义价值
    ratio: number; // 维持保证金率
  }[];
}[] = [
  { // 125x
    symbols: ['BTC'],
    data: [
      { min: 0, max: powValue(50, 1), ratio: perValue(0.4) },
      { min: powValue(50, 1), max: powValue(250, 1), ratio: perValue(0.5) },
      { min: powValue(250, 1), max: powValue(1, 2), ratio: perValue(1) },
      { min: powValue(1, 2), max: powValue(5, 2), ratio: perValue(2.5) },
      { min: powValue(5, 2), max: powValue(20, 2), ratio: perValue(5) },
      { min: powValue(20, 2), max: powValue(50, 2), ratio: perValue(10) },
      { min: powValue(50, 2), max: powValue(100, 2), ratio: perValue(12.5) },
      { min: powValue(100, 2), max: powValue(200, 2), ratio: perValue(15) },
      { min: powValue(200, 2), max: powValue(1, 5), ratio: perValue(25) },
    ],
  },
  { // 100x
    symbols: ['ETH'],
    data: [
      { min: 0, max: powValue(10, 1), ratio: perValue(0.5) },
      { min: powValue(10, 1), max: powValue(100, 1), ratio: perValue(0.65) },
      { min: powValue(100, 1), max: powValue(500, 1), ratio: perValue(1) },
      { min: powValue(500, 1), max: powValue(1, 2), ratio: perValue(2) },
      { min: powValue(1, 2), max: powValue(2, 2), ratio: perValue(5) },
      { min: powValue(2, 2), max: powValue(5, 2), ratio: perValue(10) },
      { min: powValue(5, 2), max: powValue(10, 2), ratio: perValue(12.5) },
      { min: powValue(10, 2), max: powValue(20, 2), ratio: perValue(15) },
      { min: powValue(20, 2), max: powValue(1, 5), ratio: perValue(25) },
    ],
  },
  { // 75x
    symbols: [
      'XRP', 'EOS', 'LTC', 'TRX', 'ETC', 'LINK',
      'XLM', 'ADA', 'XMR', 'XTZ', 'DOT', 'BNB', 'BCH',
    ],
    data: [
      { min: 0, max: powValue(10, 1), ratio: perValue(0.65) },
      { min: powValue(10, 1), max: powValue(50, 1), ratio: perValue(1) },
      { min: powValue(50, 1), max: powValue(250, 1), ratio: perValue(2) },
      { min: powValue(250, 1), max: powValue(1, 2), ratio: perValue(5) },
      { min: powValue(1, 2), max: powValue(2, 2), ratio: perValue(10) },
      { min: powValue(2, 2), max: powValue(5, 2), ratio: perValue(12.5) },
      { min: powValue(5, 2), max: powValue(10, 2), ratio: perValue(15) },
      { min: powValue(10, 2), max: powValue(1, 5), ratio: perValue(25) },
    ],
  },
  { // 50x
    symbols: [
      'DASH', 'ATOM', 'ONT', 'IOTA', 'BAT', 'VET',
      'NEO', 'QTUM', 'IOST', 'THETA', 'ALGO', 'ZIL',
      'KNC', 'ZRX', 'COMP', 'OMG', 'DOGE', 'SXP',
      'KAVA', 'BAND', 'RLC', 'WAVES', 'MKR', 'SNX',
      'DOT', 'DEFI', 'YFI', 'BAL', 'CRV', 'TRB', 'YFII',
      'RUNE', 'SUSHI', 'SRM', 'BZRX', 'EGLD', 'UNI',
      'AVAX', 'FTM', 'HNT', 'ENJ', 'FLM', 'TOMO', 'REN',
      'KSM', 'NEAR', 'AAVE', 'FIL', 'RSR', 'LRC', 'MATIC', 'OCEAN',
    ],
    data: [
      { min: 0, max: powValue(5, 1), ratio: perValue(1) },
      { min: powValue(5, 1), max: powValue(25, 1), ratio: perValue(2.5) },
      { min: powValue(25, 1), max: powValue(100, 1), ratio: perValue(5) },
      { min: powValue(100, 1), max: powValue(250, 1), ratio: perValue(10) },
      { min: powValue(250, 1), max: powValue(1, 2), ratio: perValue(12.5) },
      { min: powValue(1, 2), max: powValue(1, 5), ratio: perValue(50) },
    ],
  },
];


/**
 * @descirption 获取维持保证金
**/
const getSymbolBond = (
  symbol: string, // 币种
  value: number, // 价值
) => {
  // 计算总维持保证金
  let result = 0;
  // 获取币种维持保证金率
  let symbolBondData = bondData.filter(coins => coins.symbols.includes(symbol))?.[0]?.data;
  if (!symbolBondData) return 0;
  // 顺序排列
  symbolBondData = symbolBondData.sort((a, b) => b.min - a.min);
  // 计算保证金
  symbolBondData.forEach(data => {
    if (value > data.min) { // 如果大于最小值
      // 需要计算数量
      let computValue = 0;
      if (value <= data.max) { // 如果小于最大值
        computValue = new NumberTools(value).cut(data.min);
      } else { // 否则，计算全部
        computValue = new NumberTools(data.max).cut(data.min);
      }
      // 计算当前区间计算保证金
      result += new NumberTools(computValue).pow(data.ratio);
    }
  });
  return result;
};

export default getSymbolBond;
