import { combineReducers } from 'redux';
import { defaultUserIsLogin, defaultUserInfoState } from '../state/user';
import { TypeUserIsLogin, TypeUserInfo } from '../../@types/userInfo';
import { ActionsType } from '../state/index';
import { SelfReducersType } from './reducers_type';


const userInfoReducer: SelfReducersType<TypeUserInfo> = (state = defaultUserInfoState, action) => {
  switch (action.type) {
    case ActionsType.CHANGE_USER_INFO:
      return {
        ...state,
        ...action.data,
      };
    default:
      return state;
  }
};

const userIsLoginReducer: SelfReducersType<TypeUserIsLogin> = (state = defaultUserIsLogin, action) => {
  switch (action.type) {
    case ActionsType.CHANGE_USER_LOGIN:
      return action.data;
    default:
      return state;
  }
};

const userReducer = combineReducers<{
  userInfo: TypeUserInfo;
  userIsLogin: TypeUserIsLogin,
}>({
  userInfo: userInfoReducer,
  userIsLogin: userIsLoginReducer,
});


export default userReducer;
