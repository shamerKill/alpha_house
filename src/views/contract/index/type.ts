// 左侧弹出框列表类型
export type TypeLeftOutList = {
  readonly name: string;
  readonly id: string|number;
  priceUSDT: string;
  ratio: string;
};

// 持仓数据类型
export type TypePositionData = {
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
// 普通委托数据类型
export type TypeGeneralEntrustemnt = {
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
// 计划委托数据类型
export type TypePlanEntrustement = {
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
// 止盈止损数据类型
export type TypeStopOrder = {
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


// 历史记录普通委托数据类型
export type TypeGeneralEntrustemntLog = {
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
// 历史记录计划委托数据类型
export type TypePlanEntrustementLog = {
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
// 历史记录止盈止损数据类型
export type TypeStopOrderLog = {
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
