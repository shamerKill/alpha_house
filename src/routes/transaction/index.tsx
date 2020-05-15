import React from 'react';
import TypeStackValue from '../stackType';
import HomeScreen from '../../views/home';
import ComIconBotton from '../../components/icon/bottom';

const TransactionRoutes: TypeStackValue = [
  {
    name: '交易',
    icon: ({ focused }) => (
      <ComIconBotton
        focused={focused}
        image={
        focused ? require('../../assets/images/icons/transaction_focuse.png')
          : require('../../assets/images/icons/transaction_none.png')
      } />
    ),
    component: HomeScreen,
    screens: [],
  },
];

export default TransactionRoutes;
