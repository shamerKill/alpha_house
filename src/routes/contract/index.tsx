import React from 'react';
import TypeStackValue from '../stackType';
import HomeScreen from '../../views/home';
import ComIconBotton from '../../components/icon/bottom';

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
    component: HomeScreen,
    screens: [],
  },
];

export default ContractRoutes;
