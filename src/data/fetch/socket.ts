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

  // 储存当前所有的请求
  private nowSendReq: string[] = [];

  // 添加请求
  private saveSendReq = (value: string) => {
    if (!this.nowSendReq.includes(value)) {
      this.nowSendReq.push(value);
    }
  };

  // 删除请求
  private delSendReq = (value: string) => {
    let delIndex = 0;
    this.nowSendReq.forEach((item, index) => {
      if (item === value) delIndex = index;
    });
    this.nowSendReq.splice(delIndex, 1);
  };

  // 接受数据方法数组
  private onMessageList: {
    id: string;
    func: ((data: string) => any)[];
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
  };

  // 开启失败
  private onError: WebSocket['onerror'] = () => {
    this.isOpen = false;
    this.isError = true;
    // 重新开启
    console.log('Socket Error');
    console.log(this.nowSendReq);
    if (this.nowSendReq.length) {
      setTimeout(() => {
        this.sendMessageAgain();
      }, 300);
    }
  };

  // 开启成功
  private onOpened = () => {
    this.isOpen = true;
    // 发送列表中的所有数据
    this.sendList.forEach(item => this.send(item.data, item.type));
    // 执行心跳
    this.pingPong();
  };

  // 关闭
  private onClose: WebSocket['onclose'] = () => {
    console.log('Socket Close');
    console.log(this.nowSendReq);
    // 断线重连
    this.isOpen = false;
    this.sendMessageAgain();
    // 清除定时器
    if (this.pingPongTime !== null) clearInterval(this.pingPongTime);
  };

  // 接受数据
  private onMessage = (event: MessageEvent) => {
    if (event.data === this.pingPongArr[1]) return;
    // 循环传出数据
    let { data } = event;
    try {
      data = JSON.parse(data);
    } catch (e) {
      data = event.data;
    }
    this.onMessageList.forEach(item => {
      if (data.ch === item.id && item.func) {
        item.func.forEach(func => func(data));
      }
    });
  };

  // 链接
  createConnect(): Promise<void> {
    this.createSocket();
    return new Promise((resolve, reject) => {
      const timer = setInterval(() => {
        if (this.isOpen) {
          resolve();
          clearInterval(timer);
        } else if (this.isError) {
          reject(this.socketErrorMessage);
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
  };

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

  // 重新发送所有请求
  sendMessageAgain() {
    if (this.nowSendReq.length) {
      this.getSocket().then(ws => {
        this.nowSendReq.forEach((value) => {
          ws.send(value, 'sub');
        });
      }).catch(err => {
        console.log('重新发送失败', err);
      });
    }
  }

  // 取消所有请求
  sendMessageWite() {
    if (this.nowSendReq.length) {
      this.getSocket().then(ws => {
        this.nowSendReq.forEach((value) => {
          ws.socket?.send(`{"unsub":"${SocketClass.valueToString(value)}"}`);
        });
      }).catch(err => {
        console.log('重新发送失败', err);
      });
    }
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
      this.sendList.push({ data, type });
      return false;
    }
    // 添加到现有数据中
    if (type === 'sub') {
      this.saveSendReq(data);
    } else if (type === 'unsub') {
      this.delSendReq(data);
    }
    // 如果已经开启，发送所有数据
    this.socket?.send(sendData);
    return true;
  }

  // 添加接受数据的函数
  addListener(func: (data: string|object) => any, tip?: string): boolean | string {
    // 去重判断
    let hasFunc = false;
    let hasTip = false;
    let hasTipFuncs = [];
    let hasTipFuncIndex = 0;
    this.onMessageList.forEach((item, index) => {
      if (tip === item.id) {
        hasTip = true;
        hasTipFuncs = [...item.func];
        hasTipFuncIndex = index;
      }
      item.func.forEach(inF => {
        if (inF === func) hasFunc = true;
      });
    });
    if (!hasFunc) {
      const id = tip || onlyData.getOnlyData();
      if (hasTip) {
        hasTipFuncs.push(func);
        this.onMessageList.splice(
          hasTipFuncIndex,
          1,
          {
            id,
            func: hasTipFuncs,
          },
        );
      } else {
        this.onMessageList.push({
          id,
          func: [func],
        });
      }
      // 返回函数句柄
      return id;
    }
    return false;
  }

  // 删除接受数据的函数
  removeListener(func: ((data: string|object) => any) | string) {
    // 如果传入的是函数句柄
    if (typeof func === 'string') {
      let funcNumber = -1;
      this.onMessageList.forEach((item, index) => {
        if (item.id === func) funcNumber = index;
      });
      if (funcNumber !== -1) {
        this.onMessageList.splice(funcNumber, 1);
        return true;
      }
    } else {
      // 如果传入的是函数
      let funcNumber = -1;
      this.onMessageList = this.onMessageList.map((item, index) => {
        const result = { ...item };
        let inFuncNumber = -1;
        result.func.forEach((inF, ind) => {
          if (inF === func) inFuncNumber = ind;
        });
        if (inFuncNumber !== -1) {
          result.func.splice(inFuncNumber, 1);
        }
        if (result.func.length === 0) funcNumber = index;
        return result;
      });
      if (funcNumber !== -1) {
        this.onMessageList.splice(funcNumber, 1);
        return true;
      }
      return true;
    }
    // 判断删除数据
    return false;
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
  baseURI: 'wss://serve.alfaex.pro/contract/ws/market',
});
export const CoinToCoinSocket = new SocketClass({
  baseURI: 'wss://serve.alfaex.pro/cash/ws/market',
});

type Socket = SocketClass;

export default Socket;
