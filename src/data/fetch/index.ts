import { ActionsType } from '../redux/state/index';
import rootStore from '../store';

interface TypeClassFetchFuncOptions {
  token?: string;
  headers?: { [key: string]: string };
  noHeaders?: boolean;
}

export class Fetch {
  // 声明fetch方法
  private promise: (input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

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
      const result = await this.promise(
        // 链接
        `${this.baseURI}${uri}`,
        // 设置
        {
          method: 'GET',
          // 头部信息
          headers: new Headers(fetchHeader),
        },
      );
      return await result.json();
    } catch (err) {
      return {
        status: -10086,
        message: err.meesage || 'no message',
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
      const result = await this.promise(
        // 链接
        `${this.baseURI}${uri}`,
        // 设置
        req,
      );
      const resultJson = await result.json();
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
        message: err.meesage || 'no message',
      };
    }
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
}

const ajax = new Fetch({
  baseURI: 'http://192.168.3.17:3001',
});
export default ajax;
