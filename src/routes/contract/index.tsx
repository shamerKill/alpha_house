import React from 'react';
import TypeStackValue from '../stackType';
import ComIconBotton from '../../components/icon/bottom';
import ContractScreen from '../../views/contract/index';
import ContractOrderCloseScreen from '../../views/contract/order_close';
import ContractWillCloseScreen from '../../views/contract/will_close';

const ContractRoutes: TypeStackValue = [
  {
    name: 'Contract',
    tabName: '合约',
    icon: ({ focused }) => (
      <ComIconBotton
        focused={focused}
        image={
          focused ? require('../../assets/images/icons/contract_focuse.png')
            : require('../../assets/images/icons/contract_none.png')
        } />
    ),
    component: ContractScreen,
    screens: [
      {
        name: 'ContractOrderClose',
        component: ContractOrderCloseScreen,
      },
      {
        name: 'ContractWillClose',
        component: ContractWillCloseScreen,
      },
    ],
  },
];

export default ContractRoutes;
