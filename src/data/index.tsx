import React, { FC } from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { createEpicMiddleware } from 'redux-observable';
import RoutesBase from '../routes';
import rootReducers from './reducers';
import rootEpics from './epics';


const Store = () => {
  const epicMiddleware = createEpicMiddleware();
  const store = createStore(
    rootReducers,
    applyMiddleware(epicMiddleware),
  );
  epicMiddleware.run(rootEpics);
  return store;
};

const DataBase: FC = () => {
  return (
    <Provider store={Store()}>
      <RoutesBase />
    </Provider>
  );
};

export default DataBase;
