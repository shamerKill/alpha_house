import asyncStorage from '@react-native-community/async-storage';

const valueToString = (value: any): string => {
  let result: string;
  if (typeof value === 'string') result = value;
  else if (typeof value === 'function') result = value.toString();
  else if (typeof value === 'object') result = JSON.stringify(value);
  else if (typeof value === 'number') result = value.toString();
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
    return new Promise((resolve, reject) => {
      if (result === null) reject(new Error('no Data'));
      else {
        try {
          resolve(JSON.parse(result));
        } catch (err) {
          resolve(result as unknown as T);
        }
      }
    });
  },
  // 清除
  clear() {
    return asyncStorage.clear();
  },
};

export default storage;
