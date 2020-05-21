import React from 'react';
import TypeStackValue from '../stackType';
import HomeScreen from '../../views/home';
import ComIconBotton from '../../components/icon/bottom';

const MarketRoutes: TypeStackValue = [
  {
    name: 'Market',
    tabName: '行情',
    icon: ({ focused }) => (
      <ComIconBotton
        focused={focused}
        image={
        focused ? require('../../assets/images/icons/market_focuse.png')
          : require('../../assets/images/icons/market_none.png')
      } />
    ),
    component: HomeScreen,
    screens: [],
  },
];

export default MarketRoutes;
