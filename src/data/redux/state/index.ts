import { TypeImageData } from '../../@types/images';
import { TypeUserIsLogin, TypeUserInfo } from '../../@types/userInfo';
import { defaultUserInfoState, ActionsUserType, defaultUserIsLogin } from './user';
import { ActionsImageType, InitImageState } from './image';
import { ActionsListType, defaultNewsList } from './list';
import { TypeNewsList } from '../../@types/baseList';

// 动作声明
export const ActionsType = {
  ...ActionsImageType,
  ...ActionsUserType,
  ...ActionsListType,
};

// state类型声明
export interface InState {
  imageState: TypeImageData,
  userState: {
    userInfo: TypeUserInfo,
    userIsLogin: TypeUserIsLogin,
  },
  listState: {
    newsList: TypeNewsList[],
  }
}

// 初始数据声明
export const InitState: InState = {
  imageState: InitImageState,
  userState: {
    userInfo: defaultUserInfoState,
    userIsLogin: defaultUserIsLogin,
  },
  listState: {
    newsList: defaultNewsList,
  },
};
