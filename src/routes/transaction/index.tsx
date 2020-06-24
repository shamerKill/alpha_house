import React from 'react';
import TypeStackValue from '../stackType';
import TranscationScreen from '../../views/transaction';
import ComIconBotton from '../../components/icon/bottom';

const TransactionRoutes: TypeStackValue = [
  {
    name: 'Transaction',
    tabName: '交易',
    icon: ({ focused }) => (
      <ComIconBotton
        focused={focused}
        image={
        focused ? require('../../assets/images/icons/transaction_focuse.png')
          : require('../../assets/images/icons/transaction_none.png')
      } />
    ),
    component: TranscationScreen,
    screens: [],
  },
];

export default TransactionRoutes;
