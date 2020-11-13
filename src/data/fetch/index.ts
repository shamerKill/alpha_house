import { showMessage } from 'react-native-flash-message';
import { ActionsType } from '../redux/state/index';
import rootStore from '../store';
import { defaultUserInfoState } from '../redux/state/user';

interface TypeClassFetchFuncOptions {
  token?: string;
  headers?: { [key: string]: string };
  noHeaders?: boolean;
}

export class Fetch {
  // 声明fetch方法
  private promise: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

  // 请求等待记录
  private reqLoadList: {[key: string]: number|null} = {};

  // 声明token
  private token: string = '';

  // 链接根路径
  private baseURI: string;

  // 初始化
  constructor(
    options: {
      // 基础路径
      baseURI: string,
    } = {
      baseURI: '',
    },
  ) {
    this.promise = fetch;
    this.baseURI = options.baseURI;
  }

  // 获取token方法
  getToken() {
    return this.token;
  }

  // 获取根路径方法
  getBaseURI() {
    return this.baseURI;
  }

  // get方法
  async get<T = any>(
    uri: string, // 请求路径
    options?: TypeClassFetchFuncOptions,
  ): Promise<{ data?: T, message: string; status: number }> {
    const token = options?.token || rootStore.getState().userState.userInfo.token || this.token;
    this.token = token;
    // 添加头部信息
    const fetchHeader: { [key: string]: string } = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (token) fetchHeader.cookie = `JAVASESSID=${token}`;
    try {
      // 等待计时
      if (!await this.waitReq(uri)) {
        return {
          status: 10086,
          message: '等待中',
        };
      }
      const result = await this.promise(
        // 链接
        `${this.baseURI}${Fetch.checkUri(uri)}`,
        // 设置
        {
          method: 'GET',
          // 头部信息
          headers: new Headers(fetchHeader),
        },
      );
      const resultJson = await result.json();
      if (token && resultJson.status === 2000) {
        Fetch.noLogin();
      }
      return resultJson;
    } catch (err) {
      return {
        status: -10086,
        message: err.meesage || '请检查您的网络后重试当前操作',
      };
    }
  }

  // post方法
  async post<T = any>(
    uri: string, // 请求路径
    body: {
      [key: string]: any;
    }, // 请求内容
    options?: TypeClassFetchFuncOptions & { setToken?: true; },
  ): Promise<{ data?: T, message: string; status: number }> {
    const token = options?.token || rootStore.getState().userState.userInfo.token || this.token;
    this.token = token;
    // 处理传入数据
    const fdBody = options?.noHeaders ? body : Object.keys(body).map(key => `${key}=${typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key].toString()}`).join('&');
    // 添加头部信息
    let fetchHeader: { [key: string]: string } = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (token) fetchHeader.cookie = `JAVASESSID=${token}`;
    if (options?.headers) {
      fetchHeader = {
        ...fetchHeader,
        ...options.headers,
      };
    }
    try {
      const req: RequestInit = {
        method: 'POST',
        body: fdBody as string,
      };
      if (!options?.noHeaders) {
        // 头部信息
        req.headers = new Headers(fetchHeader);
      }
      // 等待计时
      if (!await this.waitReq(uri)) {
        return {
          status: 10086,
          message: '等待中',
        };
      }
      const result = await this.promise(
        // 链接
        `${this.baseURI}${Fetch.checkUri(uri)}`,
        // 设置
        req,
      );
      const resultJson = await result.json();
      if (token && resultJson.status === 2000) Fetch.noLogin();
      if (options?.setToken) {
        this.token = resultJson.data;
        rootStore.dispatch({
          type: ActionsType.CHANGE_USER_INFO,
          data: {
            token: resultJson.data,
          },
        });
      }
      return resultJson;
    } catch (err) {
      return {
        status: -10086,
        message: err.meesage || '请检查您的网络后重试当前操作',
      };
    }
  }

  // 等待方法
  waitReq(req: string): Promise<boolean> {
    const date = new Date().getTime();
    this.reqLoadList[req] = date;
    return new Promise(resolve => {
      setTimeout(() => {
        if (this.reqLoadList[req] === date) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, 200);
    });
  }

  // 工具函数-tostring
  static valueToString(value: any): string {
    let result: string;
    if (typeof value === 'string') result = value;
    else if (typeof value === 'function') result = value.toString();
    else if (typeof value === 'object') result = JSON.stringify(value);
    else result = '';
    return result;
  }

  // 判断uri方法
  static checkUri(uri: string) {
    if (!/^\/contract/.test(uri) && !/^\/coin/.test(uri)) {
      return `/user/api${uri}`;
    }
    return uri;
  }

  // 统一处理未登录状态
  static noLogin() {
    rootStore.dispatch({
      type: ActionsType.CHANGE_USER_INFO,
      data: {
        ...defaultUserInfoState,
      },
    });
    rootStore.dispatch({
      type: ActionsType.CHANGE_USER_LOGIN,
      data: false,
    });
    showMessage({
      position: 'bottom',
      message: '登录状态已失效,请重新登录',
      type: 'warning',
    });
  }
}

const ajax = new Fetch({
  // baseURI: 'https://testapi.alfaex.pro',
  baseURI: 'https://serve.alfaex.pro',
});
export default ajax;
