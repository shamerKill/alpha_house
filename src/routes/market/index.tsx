import React from 'react';
import TypeStackValue from '../stackType';
import ComIconBotton from '../../components/icon/bottom';
import MarketScreen from '../../views/market/index';
import MarketSearchScreen from '../../views/market/search';
import MarketEdit from '../../views/market/edit';

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
    component: MarketScreen,
    screens: [
      {
        name: 'MarketSearch',
        component: MarketSearchScreen,
      },
      {
        name: 'MarketEdit',
        component: MarketEdit,
      },
    ],
  },
];

export default MarketRoutes;
