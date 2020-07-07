import React, { FC } from 'react';
import { Provider } from 'react-redux';
import rootStore from './store';
import RoutesBase from '../routes';


const DataBase: FC = () => {
  return (
    <Provider store={rootStore}>
      <RoutesBase />
    </Provider>
  );
};

export default DataBase;
