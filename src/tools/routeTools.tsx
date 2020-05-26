import { useNavigation, StackActions } from '@react-navigation/native';

// 判断是否需要前往登录页面
export const useGoToWithLogin = (
  verfiyFun?: () => boolean,
  backName = 'HomeHelpList',
) => {
  const navigation = useNavigation();
  let isLogin = true;
  if (verfiyFun) {
    isLogin = verfiyFun();
  }
  let goToWithLogin = null;
  if (isLogin) {
    goToWithLogin = navigation.navigate;
  } else {
    goToWithLogin = () => {
      navigation.dispatch(StackActions.push(backName));
    };
  }
  return goToWithLogin;
};

export default {
  useGoToWithLogin,
};
