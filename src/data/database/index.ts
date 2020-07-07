import asyncStorage from '@react-native-community/async-storage';

const valueToString = (value: any): string => {
  let result: string;
  if (typeof value === 'string') result = value;
  else if (typeof value === 'function') result = value.toString();
  else if (typeof value === 'object') result = JSON.stringify(value);
  else result = '';
  return result;
};

const storage = {
  // 数据储存
  save(key: string, value: any) {
    return asyncStorage.setItem(key, valueToString(value));
  },
  // 数据获取
  async get<T=any>(key: string): Promise<T> {
    const result = await asyncStorage.getItem(key);
    if (result === null) throw Error('no Data');
    try {
      return JSON.parse(result);
    } catch (err) {
      return result as unknown as T;
    }
  },
  // 清除
  clear() {
    return asyncStorage.clear();
  },
};

export default storage;
