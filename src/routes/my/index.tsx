import React from 'react';
import TypeStackValue from '../stackType';
import ComIconBotton from '../../components/icon/bottom';
import MyScreen from '../../views/my';
import MyRechargeScreen from '../../views/my/recharge';
import MyReachargeLogScreen from '../../views/my/recharge_log';
import MyWithdrawScreen from '../../views/my/withdraw';
import MyWithdrawLogScreen from '../../views/my/withdraw_log';
import MySafeScreen from '../../views/my/safe_page';
import MyBindAccountScreen from '../../views/my/bind_account';
import MyChangePassScreen from '../../views/my/change_pass';
import MyOrderInfo from '../../views/my/order_info';

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
        name: 'safePage', // 安全中心
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
    ],
  },
];

export default MyRoutes;
