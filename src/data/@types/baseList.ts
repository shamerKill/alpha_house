import { ImageSourcePropType } from 'react-native';

/**
 * 人民币兑换美元价格
**/
export type RMBToDollar = string;
/**
 * 公告列表类型
**/
export interface TypeNotice {
  title: string; // 公告标题
  id: string; // 公告id
  hasInner?: boolean; // 是否需要链接页面
}
/**
 * 消息列表类型
**/
export interface TypeNewsList {
  time: string;
  title: string;
  desc: string;
  readed: boolean;
  id: string|number;
}
/**
 * banner图类型
**/
export interface TypeBanner {
  source: ImageSourcePropType; // 图片路径
  id: string; // banner的id
  link?: string; // 是否有链接页面
}
/**
 * 币种列表类型
**/
export interface TypeCoinsInfo {
  name: string; // 币种名称
  zhName: string; // 中文名称
  id: string|number; // 币种ID
  number: string; // 当前币种持有数量
}
/**
 * 合约交易对信息
**/
export interface TypeTransactionPairInfo {
  name: string; // 交易对名称
  id: string; // 交易对id
  type: string; // 合约类型
  baseCoin: string; // 交易对a/b基本币种b的值
  price?: string; // 最新价格(usdt)
  rmb?: string; // 人民币价格
  rangeType?: string; // 涨跌幅,带%
  dayVolume?: string; // 日交易量
}
