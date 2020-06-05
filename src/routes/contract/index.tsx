import React from 'react';
import TypeStackValue from '../stackType';
import ComIconBotton from '../../components/icon/bottom';
import ContractScreen from '../../views/contract/index';

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
    screens: [],
  },
];

export default ContractRoutes;
