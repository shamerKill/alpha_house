import React, { FC } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import TypeStackValue from './stackType';
import HomeRoutes from './home';
import MarketRoutes from './market';
import ContractRoutes from './contract';
import TransactionRoutes from './transaction';
import MyRoutes from './my';
import { defaultThemeColor, themeGray, themeWhite } from '../config/theme';

const StackValue: TypeStackValue = [
  // 首页
  ...HomeRoutes,
  ...MarketRoutes,
  ...ContractRoutes,
  ...TransactionRoutes,
  ...MyRoutes,
];

const Tab = createBottomTabNavigator();
const Statc = createStackNavigator();

const TabScreen: FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="My"
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
  return (
    <NavigationContainer>
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
