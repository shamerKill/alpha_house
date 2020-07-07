import { useNavigation, StackActions } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { InState } from '../data/redux/state';

// 判断是否需要前往登录页面
export const useGoToWithLogin = (
  dispatch?: true, // 是否返回dispatch
  backName = 'Login', // 前往页面
) => {
  const navigation = useNavigation();
  const isLogin = useSelector<InState, boolean>(state => state.userState.userIsLogin);
  let goToWithLogin = null;
  // 如果未登录,前往登录页面
  if (!isLogin) {
    goToWithLogin = (name: string, params?: object) => {
      navigation.dispatch(StackActions.push(backName, { name, params }));
    };
  } else if (dispatch) {
    goToWithLogin = (name: string, params?: object) => {
      navigation.dispatch(StackActions.push(name, params));
    };
  } else {
    goToWithLogin = navigation.navigate;
  }
  return goToWithLogin;
};

export default {
  useGoToWithLogin,
};
