// 左侧弹出框列表类型
export type TypeLeftOutList = {
  readonly name: string;
  readonly id: string;
  priceUSDT: string;
  ratio: string;
};

// 委托数据类型
export type TypePositionData = {
  id: string|number; // 订单ID
  type: 0|1, // 卖出0，买入1
  coinType: string; // 交易币种
  price: string; // 挂单价格
  allValue: string; // 交易数量
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
  type: 0|1|2|3, // 开空0，开多1,平多2,平空3
  coinType: string; // 交易对
  leverType: string; // 杠杆倍数
  willPrice: string; // 委托价格
  needNumber: number; // 委托量
  successNumber: number; // 已成交量
  status: 0|1|2|3|4|5|6|7|8|9; // 订单状态 0=委托中(平仓中),1=已完成,2=失败,3=已撤销,4=停止，5=拒绝，6=失效,7=部分成交，8=风险保障基金（强平），9=自动减仓序列（强平)
  startTime: string; // 开始时间
  stopTime: string; // 停止时间
  changeValue: string; // 盈亏
  // serviceFee: string; // 手续费
  orderType: 0|1|2|3; // 限价0/市价1|计划2｜系统强平3
};
// 历史成交记录数据类型
export type TypeHistoryLog = {
  id: string|number; // 订单id
  type: 0|1|2|3, // 开多0｜开空1｜平多2｜平空3
  coinType: string; // 交易对
  successPrice: string; // 成交价格
  successNumber: string; // 成交数量
  successTime: string; // 成交时间
  serviceFee: string; // 手续费
  changeValue: string; // 盈亏
  // orderType: 0|1|2|3; // 限价0/市价1|计划2｜系统强平3
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
// 委托记录
export type TypeOrderList = {
  id: string|number; // 订单id
  type: 0|1; // 买入0/卖出1
  status: 0|1|2|3|4; // 未成交0/已撤销1/部分成交2/完全成交3/历史委托内成交4
  willPrice: string; // 委托价格
  willValue: string; // 委托数量
  doPrice: string; // 成交均价
  doValue: string; // 成交数量
  time: string; // 时间
  fee?: string; // 手续费
};
