type TypeClassFetchFuncOptions = {
  token?: string;
};

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
  async get(
    uri: string, // 请求路径
    options?: TypeClassFetchFuncOptions,
  ) {
    const token = options?.token || this.token;
    // 添加头部信息
    const fetchHeader: { [key: string]: string } = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (token) fetchHeader['Content-Token'] = token;
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
  async post(
    uri: string, // 请求路径
    body: {
      [key: string]: any;
    }, // 请求内容
    options?: TypeClassFetchFuncOptions,
  ) {
    const token = options?.token || this.token;
    // 处理传入数据
    const fdBody = Object.keys(body).map(key => `${key}=${Fetch.valueToString(body[key])}`).join('&');
    // 添加头部信息
    const fetchHeader: { [key: string]: string } = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    if (token) fetchHeader['Content-Token'] = token;
    try {
      const result = await this.promise(
        // 链接
        `${this.baseURI}${uri}`,
        // 设置
        {
          method: 'POST',
          body: fdBody,
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
  baseURI: 'http://192.168.3.39:3001',
});
export default ajax;
