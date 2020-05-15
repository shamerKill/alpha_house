import React from 'react';
import TypeStackValue from '../stackType';
import HomeScreen from '../../views/home';
import ComIconBotton from '../../components/icon/bottom';
import HomeNewsList from '../../views/home/news_list';
import HomeNewsDetails from '../../views/home/news_detail';
import HomeHelpList from '../../views/home/help_list';
import HomeHelpDetails from '../../views/home/help_details';

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
    component: HomeScreen,
    screens: [{
      // 消息列表
      name: 'HomeNewsList',
      component: HomeNewsList,
    }, {
      // 消息详情
      name: 'HomeNewsDetails',
      component: HomeNewsDetails,
    }, {
      // 帮助中心
      name: 'HomeHelpList',
      component: HomeHelpList,
    }, {
      // 帮助中心详情
      name: 'HomeHelpDetails',
      component: HomeHelpDetails,
    }],
  },
];

export default HomeRoutes;
