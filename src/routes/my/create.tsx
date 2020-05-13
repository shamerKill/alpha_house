import React from 'react';
import { View } from 'react-native';
import TypeStackValue from '../stackType';
import LoginScreen from '../../views/login';
import RegisterScreen from '../../views/register';

const CreateRoutes: TypeStackValue = [
  {
    name: 'Create',
    icon: () => <View />,
    screens: [{
      name: 'Login',
      component: LoginScreen,
    }, {
      name: 'Register',
      component: RegisterScreen,
    }],
  },
];

export default CreateRoutes;
