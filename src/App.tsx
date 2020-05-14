import React, { FC, useEffect } from 'react';
import SplashScreen from 'react-native-splash-screen';
import DataScreen from './data';

const App: FC = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);
  return (
    <DataScreen />
  );
};

export default App;
