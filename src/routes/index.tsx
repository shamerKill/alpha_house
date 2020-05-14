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

const RoutesBase: FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Feed"
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
            const Stack = createStackNavigator();
            const stack: FC = () => {
              return (
                <Stack.Navigator>
                  {
                    screens.screens.map(screen => (
                      <Stack.Screen
                        options={{
                          headerShown: false,
                          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                        }}
                        name={screen.name}
                        component={screen.component}
                        key={screen.name} />
                    ))
                  }
                </Stack.Navigator>
              );
            };
            return (
              <Tab.Screen
                options={{
                  tabBarLabel: screens.name,
                  tabBarIcon: screens.icon,
                }}
                name={screens.name}
                component={stack}
                key={screens.name} />
            );
          })
        }
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default RoutesBase;
