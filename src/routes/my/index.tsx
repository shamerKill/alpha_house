import React from 'react';
import TypeStackValue from '../stackType';
import ComIconBotton from '../../components/icon/bottom';
import MyScreen from '../../views/my';
import MyRechargeScreen from '../../views/my/recharge';
import MyReachargeLogScreen from '../../views/my/recharge/log';
import MyWithdrawScreen from '../../views/my/withdraw';
import MyWithdrawLogScreen from '../../views/my/withdraw/log';
import MySafeScreen from '../../views/my/safe';
import MyBindAccountScreen from '../../views/my/safe/bind_account';
import MyChangePassScreen from '../../views/my/safe/change_pass';
import MyOrderInfo from '../../views/my/order_info';
import MyRecommendScreen from '../../views/my/recommend';
import MyRealnameScreen from '../../views/my/realname';
import MyFollowListScreen from '../../views/my/follow/list';
import MyFollowUserDetails from '../../views/my/follow/user_details';
import MyFollowModeScreen from '../../views/my/follow/mode';
import MyFollowManageListScreen from '../../views/my/follow/manage_list';
import MyFollowEditScreen from '../../views/my/follow/follow_edit';
import MyChatScreen from '../../views/my/chat';

const MyRoutes: TypeStackValue = [
  {
    name: 'My',
    tabName: '我的',
    icon: ({ focused }) => (
      <ComIconBotton
        focused={focused}
        image={
        focused ? require('../../assets/images/icons/my_focuse.png')
          : require('../../assets/images/icons/my_none.png')
      } />
    ),
    component: MyScreen,
    screens: [
      {
        name: 'recharge', // 充值
        component: MyRechargeScreen,
      },
      {
        name: 'rechargeLog', // 充值记录
        component: MyReachargeLogScreen,
      },
      {
        name: 'withdraw', // 提币
        component: MyWithdrawScreen,
      },
      {
        name: 'withdrawLog', // 提币记录
        component: MyWithdrawLogScreen,
      },
      {
        name: 'safe', // 安全中心
        component: MySafeScreen,
      },
      {
        name: 'changePass', // 修改密码
        component: MyChangePassScreen,
      },
      {
        name: 'bindAccount', // 账户绑定邮箱/手机号
        component: MyBindAccountScreen,
      },
      {
        name: 'orderInfo', // 账单明细
        component: MyOrderInfo,
      },
      {
        name: 'recommend', // 我的邀请
        component: MyRecommendScreen,
      },
      {
        name: 'realname', // 我的邀请
        component: MyRealnameScreen,
      },
      {
        name: 'followList', // 跟单列表
        component: MyFollowListScreen,
      },
      {
        name: 'followUserDetails', // 跟单导师详情
        component: MyFollowUserDetails,
      },
      {
        name: 'followMode', // 设置跟单方式
        component: MyFollowModeScreen,
      },
      {
        name: 'followManageList', // 跟单管理
        component: MyFollowManageListScreen,
      },
      {
        name: 'followEdit', // 编辑跟单
        component: MyFollowEditScreen,
      },
      {
        name: 'chat', // 编辑跟单
        component: MyChatScreen,
      },
    ],
  },
];

export default MyRoutes;
