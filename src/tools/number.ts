export const positiveNumber = (value: number|string): boolean => {
  if (typeof value === 'string') {
    return parseFloat(value) > 0;
  }
  return value > 0;
};
export const numberToFormatString = (value: number|string): string => {
  let data = value;
  if (typeof data === 'string') data = parseFloat(data);
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
