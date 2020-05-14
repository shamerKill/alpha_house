import React from 'react';
import TypeStackValue from '../stackType';
import HomeScreen from '../../views/home';
import ComIconBotton from '../../components/icon/bottom';
import HomeNewsList from '../../views/home/news_list';

const HomeRoutes: TypeStackValue = [
  {
    name: '首页',
    icon: ({ focused }) => (
      <ComIconBotton
        focused={focused}
        image={
          focused ? require('../../assets/images/icons/home_focuse.png')
            : require('../../assets/images/icons/home_none.png')
        } />
    ),
    screens: [{
      name: 'Home',
      component: HomeScreen,
    }, {
      name: 'HomeNewsList',
      component: HomeNewsList,
    }],
  },
];

export default HomeRoutes;
