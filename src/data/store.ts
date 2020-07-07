import { createStore } from 'redux';
import rootReducers from './redux/reducers';
import storage from './database';
import { InState, ActionsType } from './redux/state';

const Store = () => {
  const store = createStore(
    rootReducers,
  );
  // 每次更改之后本地数据更新
  store.subscribe(() => {
    storage.save('alpha_house_base', store.getState());
  });
  storage.get<InState>('alpha_house_base').then(data => {
    // 更改banner
    store.dispatch({ type: ActionsType.CHANGE_BANNER, data: data.imageState.banner });
    // 更改用户数据
    store.dispatch({ type: ActionsType.CHANGE_USER_INFO, data: data.userState.userInfo });
    // 更改用户是否登录
    store.dispatch({ type: ActionsType.CHANGE_USER_LOGIN, data: data.userState.userIsLogin });
    // 更改消息列表
    store.dispatch({ type: ActionsType.CHANGE_NEWS_LIST, data: data.listState.newsList });
  }).catch(err => {
    console.log(err);
  });
  return store;
};

const rootStore = Store();
export default rootStore;
