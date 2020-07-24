import { ImageSourcePropType } from 'react-native';

/**
 * 充值记录类型
**/
export interface TypeLogsRecharge {
  title: string; // 标题
  time: string; // 时间
  value: string; // 充值金额,不携带单位
}

/**
 * 提币记录类型
**/
export const TypeLogsWithdrawTypeArr = ['审核中', '已通过', '已驳回'];
export interface TypeLogsWithdraw {
  title: string; // 标题
  time: string; // 时间
  value: string; // 充值金额
  type: 0|1|2; // 记录类型['审核中', '已通过', '已驳回']
}

/**
 * 划转记录类型
**/
export interface TypeLogsTransfer extends TypeLogsRecharge {}

/**
 * 账单明细类型
**/
export interface TypeLogsOrderInfo extends TypeLogsRecharge {}

/**
 * 跟单记录
**/
export interface TypeLogsWithOrder {
  leader: { // 被跟随用户信息
    avatar: ImageSourcePropType; // 头像
    nickname: string; // 用户昵称
    id: string; // 用户ID
  }
  id: string; // 跟单ID
  isOpen: boolean; // 订单是否开启
  coinType: string; // 跟随币种类型
  allValue: string; // 累计跟随金额
  allRange: string; // 累计跟单收益
  oneValue: string; // 单次跟随金额
  dayValue: string; // 最大跟随金额
}

/**
 * 跟单导师列表信息
**/
export interface TypeLeadersInfo {
  userInfo: { // 用户信息
    id: string; // 用户ID
    avatar: ImageSourcePropType; // 头像
    nickname: string; // 用户昵称
    introduce: string; // 个人简介
    location: string; // 所在地
    createTime: string; // 注册时间
  };
  allRange: string; // 累计收益率
  allPerson: string; // 累计跟随人数
  lastThreeWeekWin: string; // 近三周交易胜率
}

/**
 * 推荐链接
**/
export interface TypeRecommendLink {
  link: string; // 链接
  image: ImageSourcePropType; // 图片地址
}

/**
 * 推荐列表
**/
export interface TypeRecommendList {
  total: string; // 总人数
  list: { // 列表信息
    account: string; // 账户名
    id: string; // 用户ID
    date: string; // 用户注册日期
    isRealPerson: boolean; // 是否实名
    relation: 0|1; // 推荐关系直推0｜间推1
  }[]
}
