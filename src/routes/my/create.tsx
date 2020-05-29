import TypeStackValue from '../stackType';
import LoginScreen from '../../views/my/account/login';
import RegisterScreen from '../../views/my/account/register';
import RegisterAgreenmentScreen from '../../views/my/account/agreement';
import AccountVerfiyCodeScreen from '../../views/my/account/verfiy_code';
import AccountSetPassScreen from '../../views/my/account/set_pass';
import AccountForgetPass from '../../views/my/account/forget_pass';

const CreateRoutes: TypeStackValue[0]['screens'] = [
  {
    name: 'Login', // 登录
    component: LoginScreen,
  },
  {
    name: 'Register', // 注册
    component: RegisterScreen,
  },
  {
    name: 'RegisterAgreement', // 用户协议
    component: RegisterAgreenmentScreen,
  },
  {
    name: 'AccountVerfiyCode', // 验证码
    component: AccountVerfiyCodeScreen,
  },
  {
    name: 'AccountSetPass', // 设置密码
    component: AccountSetPassScreen,
  },
  {
    name: 'AccountForgetPass', // 忘记密码
    component: AccountForgetPass,
  },
];

export default CreateRoutes;
