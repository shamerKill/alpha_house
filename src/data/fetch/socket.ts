import onlyData from '../../tools/onlyId';

export class SocketClass {
  // 传入配置
  options: {
      // 基础路径
      baseURI: string,
  };

  // 初始化的socket
  // 如果是null表示创建失败
  private socket: WebSocket|null = null;

  // socket错误提示
  private socketErrorMessage: string = '';

  // socket是否是开启状态
  private isOpen: boolean = false;

  // socket是否链接出错
  private isError: boolean = false;

  // socket在开启成功前发送数据成功数组
  private sendList: {data: any, type?: 'sub'|'unsub'|'req'}[] = [];

  // 接受数据数组是否有值，如果没值，启动判断心跳包执行次数后关闭链接,单位s
  private checkPingPongLinkTime: number = 20;

  // 心跳包倒计时
  private pingPongTime: NodeJS.Timeout| null = null;

  // 心跳包类型
  private pingPongArr: [string, string] = ['{"ping":""}', 'pong'];

  // 接受数据方法数组
  private onMessageList: {
    id: string;
    func: (data: string) => any;
  }[] = [];

  constructor(
    options: {
      // 基础路径
      baseURI: string,
    },
  ) {
    this.options = options;
  }

  private createSocket = () => {
    // 创建socket
    try {
      this.socket = new WebSocket(this.options.baseURI);
    } catch (err) {
      this.socketErrorMessage = err.message;
    }
    // 为socket添加方法
    if (this.socket) {
      this.socket.onerror = this.onError;
      this.socket.onopen = this.onOpened;
      this.socket.onmessage = this.onMessage;
      this.socket.onclose = this.onClose;
    }
  };

  // 心跳包
  private pingPong = () => {
    // 上次心跳是否的有监听函数，两次心跳过程都没有监听函数，关闭链接
    let prevCheckedType = this.onMessageList.length;
    this.pingPongTime = setInterval(() => {
      this.send(this.pingPongArr[0]);
      if (prevCheckedType === 0 && this.onMessageList.length === 0) {
        // FIXME: 不需要断开socket，但是我觉得不对
        // this.close();
      } else {
        prevCheckedType = this.onMessageList.length;
      }
    }, 1000 * this.checkPingPongLinkTime);
  }

  // 开启失败
  private onError: WebSocket['onerror'] = () => {
    this.isOpen = false;
    this.isError = true;
  }

  // 开启成功
  private onOpened = () => {
    this.isOpen = true;
    // 发送列表中的所有数据
    this.sendList.forEach(item => this.send(item.data, item.type));
    // 执行心跳
    this.pingPong();
  }

  // 关闭
  private onClose: WebSocket['onclose'] = (ev: Event) => {
    console.log('close');
    this.isOpen = false;
    // 清除定时器
    if (this.pingPongTime !== null) clearInterval(this.pingPongTime);
  }  

  // 接受数据
  private onMessage = (event: MessageEvent) => {
    if (event.data === this.pingPongArr[1]) return;
    // 循环传出数据
    let data = event.data;
    try {
      data = JSON.parse(data);
    } catch (e) {
      data = event.data;
    }
    this.onMessageList.forEach(item => {
      if (data.ch === item.id && item.func) {
        item.func(data);
      }
    });
  }

  // 链接
  createConnect(): Promise<void> {
    this.createSocket();
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (this.isOpen) {
          resolve();
          clearInterval(timer);
        } else if (this.isError) {
          reject(new Error(this.socketErrorMessage));
        }
      }, 100);
    });
  }

  // 获取socket
  getSocket = (): Promise<this> => {
    return new Promise((reslove, reject) => {
      if (this.isOpen) reslove(this);
      else {
        this.createConnect().then(() => {
          reslove(this);
        }).catch((err) => {
          reject(err);
        });
      }
    });
  }
  
  // 成功链接后回调
  successConnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (this.isOpen) {
          resolve();
          clearInterval(timer);
        } else if (this.isError) {
          reject();
          clearInterval(timer);
        }
      }, 100);
    });
  }

  // 返回是否成功链接
  isConnect() {
    return this.isOpen;
  }

  // 主动关闭
  close() {
    try {
      this.socket?.close();
      return true;
    } catch (_err) {
      return false;
    }
  }

  // 发送数据
  send(data: any, type?: 'sub'|'unsub'|'req') {
    let insetData = SocketClass.valueToString(data);
    if (type) insetData = `{"${type}":"${insetData}"}`;
    const sendData = insetData;
    // 如果没有开启
    if (!this.isOpen) {
      this.sendList.push({data, type});
      return false;
    } else {
      // 如果已经开启，发送所有数据
      this.socket?.send(sendData);
      return true;
    }
  }

  // 添加接受数据的函数
  addListener(func: (data: string|object) => any, tip?: string): boolean | string {
    // 去重判断
    let hasFunc = false;
    this.onMessageList.forEach(item => {item.func === func && (hasFunc = true)});
    if (!hasFunc) {
      const id = tip || onlyData.getOnlyData();
      this.onMessageList.push({
        id,
        func,
      });
      // 返回函数句柄
      return id;
    } else {
      return false;
    }
  }

  // 删除接受数据的函数
  removeListener(func: ((data: string|object) => any) | string) {
    let funcNumber = -1;
    // 如果传入的是函数句柄
    if (typeof func === 'string') {
      this.onMessageList.forEach((item, index) => {item.id === func && (funcNumber = index)});
    } else {
      this.onMessageList.forEach((item, index) => {item.func === func && (funcNumber = index)});
    }
    // 判断删除数据
    if (funcNumber !== -1) {
      this.onMessageList.splice(funcNumber, 1);
      return true;
    } else {
      return false;
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

export const marketSocket = new SocketClass({
  baseURI: 'ws://192.168.3.17:3001/ws/market',
});
export const CoinToCoinSocket = new SocketClass({
  baseURI: 'ws://192.168.3.10:3004/ws/market',
});

type Socket = SocketClass;

export default Socket;
