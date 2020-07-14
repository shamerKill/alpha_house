// 单列行情类型
export type TypeMarketListLine = {
  readonly name: string; // 交易对
  readonly id: string|number; // 交易对值
  priceUSDT: string; // USDT价格
  priceRMB: string; // RMB价格
  ratio: string; // 涨幅
  volume?: string; // 24h成交量
  type?: 0|1|2|3; // 合约类型0现货，1金本位合约，2币本位合约，3混合合约
};

// 所有行情数据
export type TypeMarketList = {
  readonly title: string; // 头部列表显示
  readonly id: string|number; // id
  readonly showStyle: 0|1|2; // 显示样式0自选，1合约，2全球指数
  listArrLinkId: number; // 链接的行情数据位于数组里的第几个
};
