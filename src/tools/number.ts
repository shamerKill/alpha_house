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
  const M = 10 ** 5;
  if (value > M) return `${parseFloat((data / M).toFixed(2)).toString()}万`;
  // K
  const K = 10 ** 3;
  if (value > K) return `${parseFloat((data / K).toFixed(2)).toString()}千`;
  return data.toString();
};
export const biNumberToSymbol = (value: number|string): string => {
  let data = value;
  if (typeof data === 'string') data = parseFloat(data) || 0;
  // 亿
  const Y = 10 ** 8;
  if (value >= Y) return `${parseFloat((data / Y).toFixed(2)).toString()}亿`;
  // M
  const M = 10 ** 4;
  if (value >= M) return `${parseFloat((data / M).toFixed(2)).toString()}万`;
  // K
  const K = 10 ** 3;
  if (value >= K) return `${parseFloat((data / K).toFixed(2)).toString()}千`;
  return data.toString();
};

// 计算小数点后位数
export const numberOtherLength = (value: number): number => {
  if (Number.isNaN(value)) return 0;
  const data = value.toString();
  const point = data.split('.')[1];
  if (!point) return 0;
  return point.length;
};

// 数字向下取余
export const numberToFixed = (value: number, fix: number): string => {
  const count = Math.floor(value * 10 ** fix);
  return `${count / 10 ** fix}`;
};
// 两数相减
export const towNumCut = (prev: number, after: number) => {
  const prevLength = numberOtherLength(prev);
  const afterLength = numberOtherLength(after);
  const bigLength = prevLength > afterLength ? prevLength : afterLength;
  return (
    Math.floor(prev * 10 ** bigLength)
    - Math.floor(after * 10 ** bigLength)
  ) / 10 ** bigLength;
};

export default {
  positive: positiveNumber,
};
