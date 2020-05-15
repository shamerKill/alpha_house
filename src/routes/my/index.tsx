import React from 'react';
import TypeStackValue from '../stackType';
import HomeScreen from '../../views/home';
import ComIconBotton from '../../components/icon/bottom';

const MyRoutes: TypeStackValue = [
  {
    name: '我的',
    icon: ({ focused }) => (
      <ComIconBotton
        focused={focused}
        image={
        focused ? require('../../assets/images/icons/my_focuse.png')
          : require('../../assets/images/icons/my_none.png')
      } />
    ),
    component: HomeScreen,
    screens: [],
  },
];

export default MyRoutes;
