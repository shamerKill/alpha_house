import { TypeUserInfo, TypeUserIsLogin } from '../../@types/userInfo';

export const ActionsUserType = {
  // 修改用户基本信息
  CHANGE_USER_INFO: 'CHANGE_USER_INFO',
  // 更改用户登录状态
  CHANGE_USER_LOGIN: 'CHANGE_USER_LOGIN',
};

// 基础用户信息
export const defaultUserInfoState: TypeUserInfo = {
  avatar: { uri: '' }, // 用户头像数据
  account: '', // 用户账号
  accountType: 'email', // 用户账号类型
  spareAccount: '', // 备用账号
  upUserCode: '', // 上级邀请码
  token: '', // 登录凭证
  id: '', // 用户编号
  nickname: '', // 用户昵称
  introduce: '', // 个人简介
  location: '', // 所在地
  language: '', // 语言版本
  assets: '', // 折合总资产
  withAllValue: '', // 总计跟单数量
  withAllRange: '', // 跟单总收益%
};
// 用户是否登录了/默认用户已登录
export const defaultUserIsLogin: TypeUserIsLogin = false;
