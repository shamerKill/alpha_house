import React, { FC } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { NavigationContainer, NavigationContainerProps } from '@react-navigation/native';
import TypeStackValue from './stackType';
import HomeRoutes from './home';
import MarketRoutes from './market';
import ContractRoutes from './contract';
import TransactionRoutes from './transaction';
import MyRoutes from './my';
import { defaultThemeColor, themeGray, themeWhite } from '../config/theme';
import useGetDispatch from '../data/redux/dispatch';
import { InState, ActionsType } from '../data/redux/state';

export const StackValue: TypeStackValue = [
  // 首页
  ...HomeRoutes,
  ...MarketRoutes,
  ...ContractRoutes,
  // 隐藏币币行情
  ...TransactionRoutes,
  ...MyRoutes,
];

const Tab = createBottomTabNavigator();
const Statc = createStackNavigator();

const TabScreen: FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBarOptions={{
        activeTintColor: defaultThemeColor,
        inactiveTintColor: themeGray,
        labelStyle: {
          fontSize: 12,
          backgroundColor: themeWhite,
        },
      }}>
      {
      StackValue.map(screens => {
        return (
          <Tab.Screen
            options={{
              tabBarLabel: screens.tabName,
              tabBarIcon: screens.icon,
            }}
            name={screens.name}
            component={screens.component}
            key={screens.name} />
        );
      })
    }
    </Tab.Navigator>
  );
};

const RoutesBase: FC = () => {
  const [routePage, dispatchRoutePage] = useGetDispatch<InState['pageRouteState']['pageRoute']>('pageRouteState', 'pageRoute');
  const [, dispatchPrevRoutePage] = useGetDispatch<InState['pageRouteState']['prevPageRoute']>('pageRouteState', 'prevPageRoute');
  const changeFunc: NavigationContainerProps['onStateChange'] = (state) => {
    let routeKey = '';
    if (state?.routes && state?.routes.length > 1) {
      const { key } = state.routes[state.routes.length - 1];
      routeKey = key;
    } else if (state?.routes[0].state?.history) {
      // eslint-disable-next-line prefer-destructuring
      const history = state.routes[0].state.history as {key: string}[];
      const lastPage: {key: string} = history[history.length - 1];
      routeKey = lastPage.key;
    }
    if (typeof routePage === 'string') {
      dispatchPrevRoutePage({
        type: ActionsType.CHANGE_PREV_PAGE_ROUTE,
        data: routePage,
      });
    }
    dispatchRoutePage({
      type: ActionsType.CHANGE_PAGE_ROUTE,
      data: routeKey.split('-')[0],
    });
  };
  return (
    <NavigationContainer onStateChange={changeFunc}>
      <Statc.Navigator>
        <Statc.Screen
          options={{
            headerShown: false,
          }}
          name="Home"
          component={TabScreen} />
        {
          StackValue.map(item => item.screens).reduce((prev, after) => [...prev, ...after]).map((item, index) => {
            return (
              <Statc.Screen
                options={{
                  headerShown: false,
                  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                }}
                key={index}
                name={item.name}
                component={item.component} />
            );
          })
        }
      </Statc.Navigator>
    </NavigationContainer>
  );
};

export default RoutesBase;
