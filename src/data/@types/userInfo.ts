import { ImageURISource } from 'react-native';
import { TypeTransactionPairInfo } from './baseList';

/**
 * 用户是否已经登录了
**/
export type TypeUserIsLogin = boolean;

/**
 * 用户信息类型
**/
export interface TypeUserInfo {
  avatar: ImageURISource; // 用户头像数据
  account: string; // 用户账号
  accountType: 'email'|'phone'; // 用户账号类型
  upUserCode: string; // 上级邀请码
  token: string; // 登录token
  id: string; // 用户编号
  nickname: string; // 用户昵称
  introduce: string; // 个人简介
  location: string; // 所在地
  language: string; // 语言版本
  assets: string; // 折合总资产
  withAllValue: string; // 总计跟单数量
  withAllRange: string; // 跟单总收益%
}

/**
 * 用户搜索历史
**/
export type TypeUserSearchHistoryLogs = TypeTransactionPairInfo[];

/**
 * 用户自选列表
**/
export type TypeUserFollowCoinsList = TypeTransactionPairInfo[];

/**
 * 持仓数据类型
**/
export type TypeUserPositionData = {
  id: string|number; // 订单ID
  type: 0|1, // 开空0，开多1
  coinType: string; // 交易对
  leverType: string; // 杠杆倍数
  price: string; // 持仓均价
  profitValue: string; // 未实现盈亏
  profitRatio: string; // 收益率
  allValue: string; // 总仓
  useBond: string; // 占用保证金
  willBoomPrice: string; // 预估强评价
  useBondRatio: string; // 维持保证金率
  stopWinValue: string; // 止盈手数
  stopLowValue: string; // 止损手数
};

/**
 * 普通委托数据类型
**/
export type TypeUserGeneralEntrustemnt = {
  id: string|number; // 订单ID
  type: 0|1, // 开空0，开多1
  coinType: string; // 交易对
  leverType: string; // 杠杆倍数
  willNumber: number; // 委托量
  willPrice: string; // 委托价格
  haveNumber: number; // 已成交量
  backValue: number; // 可撤数量
  state: 0|1; // 状态，未成交0｜部分成交1
  winStartPrice: string; // 止盈触发价
  winDoPrice: string; // 止盈执行价
  lowStartPrice: string; // 止损触发价
  lowDoPrice: string; // 止损执行价
  time: string; // 订单时间
};

/**
 * 计划委托数据类型
**/
export type TypeUserPlanEntrustement = {
  id: string|number; // 订单ID
  type: 0|1; // 开空0，开多1
  coinType: string; // 交易对
  leverType: string; // 杠杆倍数
  startPrice: string; // 触发价格
  doPrice: string; // 执行价格
  number: number; // 委托数量
  doPriceType: 0|1; // 限价0还是市价1
  state: 0|1; // 状态 未触发0｜已触发1
  sendTime: string; // 委托时间
  doTime: string; // 触发时间
};

/**
 * 止盈止损数据类型
**/
export type TypeUserStopOrder = {
  id: string|number; // 订单ID
  type: 0|1; // 开空0，开多1
  coinType: string; // 交易对
  leverType: string; // 杠杆倍数
  startPrice: string; // 触发价格
  doPrice: string; // 执行价格
  stopType: 0|1; // 止盈1还是止损0
  doPriceType: 0|1; // 限价0还是市价1
  state: 0|1; // 状态 未触发0｜已触发1
  sendTime: string; // 委托时间
  doTime: string; // 触发时间
};


/**
 * 历史记录普通委托数据类型
**/
export type TypeUserGeneralEntrustemntLog = {
  id: string|number; // 订单ID
  type: 0|1; // 开空0，开多1
  coinType: string; // 交易对
  leverType: string; // 杠杆倍数
  willPrice: string; // 委托价格
  needNumber: number; // 委托量
  successNumber: number; // 已成交量
  isSuccess: boolean; // 成交true/撤销false
  startTime: string; // 开始时间
  stopTime: string; // 停止时间
  changeValue: string; // 盈亏
  serviceFee: string; // 手续费
  orderType: 0|1; // 限价0/市价1
};

/**
 * 历史记录计划委托数据类型
**/
export type TypeUserPlanEntrustementLog = {
  id: string|number; // 订单ID
  type: 0|1; // 开空0，开多1
  coinType: string; // 交易对
  leverType: string; // 杠杆倍数
  startPrice: string; // 触发价格
  doPrice: string; // 执行价格
  number: number; // 已成交量
  isSuccess: boolean; // 成交true/撤销false
  startTime: string; // 开始时间
  stopTime: string; // 停止时间
  orderType: 0|1; // 限价0/市价1
};

/**
 * 历史记录止盈止损数据类型
**/
export type TypeUserStopOrderLog = {
  id: string|number; // 订单ID
  type: 0|1; // 开空0，开多1
  coinType: string; // 交易对
  leverType: string; // 杠杆倍数
  startPrice: string; // 触发价格
  doPrice: string; // 执行价格
  number: number; // 数量
  isSuccess: boolean; // 成交true/撤销false
  startTime: string; // 开始时间
  stopTime: string; // 停止时间
  stopType: 0|1; // 止盈1还是止损0
  orderType: 0|1; // 限价0/市价1
};
