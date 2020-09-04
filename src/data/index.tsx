import React, {
  FC, useEffect, useRef,
} from 'react';
import { Provider } from 'react-redux';
import { BackHandler } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import rootStore from './store';
import RoutesBase, { StackValue } from '../routes';
import { ActionsType } from './redux/state';

const StatckValueName = StackValue.map(item => item.name);

const DataBase: FC = () => {
  const exitApp = useRef(false);
  const timer = useRef(0);
  // 监听返回键
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      const routePage = rootStore.getState().pageRouteState.pageRoute;
      if (StatckValueName.includes(routePage)) {
        clearTimeout(timer.current);
        // 在启动页面1s内按两次返回键，进行退出
        if (exitApp.current) {
          BackHandler.exitApp();
        } else {
          exitApp.current = true;
          showMessage({
            position: 'bottom',
            type: 'info',
            message: '再按一次返回页面',
            duration: 800,
          });
          timer.current = setTimeout(() => {
            exitApp.current = false;
          }, 1000) as unknown as number;
        }
        return true;
      }
      return false;
    });
    // 第一次进入页面更新redux,将page更改为home
    rootStore.dispatch({
      type: ActionsType.CHANGE_PAGE_ROUTE,
      data: 'Home',
    });
  }, []);
  return (
    <Provider store={rootStore}>
      <RoutesBase />
    </Provider>
  );
};

export default DataBase;
