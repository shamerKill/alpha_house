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
export const towNumCut = (prev: number|string, after: number|string) => {
  const prevNum = typeof prev === 'number' ? prev : parseFloat(prev);
  const afterNum = typeof after === 'number' ? after : parseFloat(after);
  const prevLength = numberOtherLength(prevNum);
  const afterLength = numberOtherLength(afterNum);
  const bigLength = prevLength > afterLength ? prevLength : afterLength;
  return (
    Math.floor(prevNum * 10 ** bigLength)
    - Math.floor(afterNum * 10 ** bigLength)
  ) / 10 ** bigLength;
};
export const towNumAdd = (prev: number|string, after: number|string) => {
  const prevNum = typeof prev === 'number' ? prev : parseFloat(prev);
  const afterNum = typeof after === 'number' ? after : parseFloat(after);
  const prevLength = numberOtherLength(prevNum);
  const afterLength = numberOtherLength(afterNum);
  const bigLength = prevLength > afterLength ? prevLength : afterLength;
  return (
    Math.floor(prevNum * 10 ** bigLength)
    + Math.floor(afterNum * 10 ** bigLength)
  ) / 10 ** bigLength;
};


export class NumberTools {
  // 将数字进行处理
  constructor(
    private num: number,
  ) {
    if (Number.isNaN(num)) this.num = 0;
  }

  // 将数字除以一个数，并选择保留小数位，向下取
  divides(div: number, length = 0) {
    const pow = 10 ** length;
    let result = this.num / div;
    result = Math.floor(result * pow);
    result /= pow;
    return new NumberTools(result);
  }

  // 乘法
  pow(num: number) {
    const numLength = numberSplitLength(this.num);
    const addLength = numberSplitLength(num) || 0;
    const MaxLength = numLength > addLength ? numLength : addLength;
    const pow = 10 ** MaxLength;
    const result = Math.round(num * pow * this.num * pow) / pow / pow;
    return result;
  }

  // 将数字加一个数
  add(add: number) {
    const numLength = numberSplitLength(this.num);
    const addLength = numberSplitLength(add) || 0;
    const MaxLength = numLength > addLength ? numLength : addLength;
    const pow = 10 ** MaxLength;
    const result = Math.round(add * pow + this.num * pow) / pow;
    return result;
  }

  // 减法
  cut(num: number) {
    const numLength = numberSplitLength(this.num);
    const addLength = numberSplitLength(num) || 0;
    const MaxLength = numLength > addLength ? numLength : addLength;
    const pow = 10 ** MaxLength;
    const result = Math.round(this.num * pow - num * pow) / pow;
    return result;
  }

  fixed(sub: number): number {
    let res: number = this.num;
    const pow = 10 ** sub;
    res = Math.floor(res * pow) / pow;
    return res;
  }

  // 获取当前数字
  get() {
    return this.num;
  }
}

// 获取数字最小位数
export const numberSplitLength = (num: number): number => {
  let length = 0;
  length = num.toString().split('.')?.[1]?.length || 0;
  return length;
};

export default {
  positive: positiveNumber,
};
