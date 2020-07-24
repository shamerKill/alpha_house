export const positiveNumber = (value: number|string): boolean => {
  if (typeof value === 'string') {
    return parseFloat(value) > 0;
  }
  return value > 0;
};
export const fiexedNumber = (value: number|string, sub: number): number => {
  let res: number = 0;
  if (typeof value === 'string') res = parseFloat(value);
  else res = value;
  const pow = 10 ** sub;
  res = Math.floor(res * pow) / pow;
  return res;
};
export const numberToFormatString = (value: number|string): string => {
  let data = value;
  if (typeof data === 'string') data = parseFloat(data);
  // 亿
  const Y = 10 ** 8;
  if (value > Y) return `${parseFloat((data / Y).toFixed(2)).toString()}亿`;
  // M
  const M = 10 ** 6;
  if (value > M) return `${parseFloat((data / M).toFixed(2)).toString()}M`;
  // K
  const K = 10 ** 3;
  if (value > K) return `${parseFloat((data / K).toFixed(2)).toString()}K`;
  return data.toString();
};
export const biNumberToSymbol = (value: number|string): string => {
  const val = typeof value === 'number' ? value : parseFloat(value);
  let result = `${val}`;
  if (val % 10000 > 10) result = `${(val / 10000).toFixed(2)}W`;
  if (val % 1000000 > 10) result = `${(val / 1000000).toFixed(2)}M`;
  return result;
};

export default {
  positive: positiveNumber,
};
