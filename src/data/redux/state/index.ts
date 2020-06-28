import { ActionsImageType, InImageState, InitImageState } from './image';

// 动作声明
export const ActionsType = {
  ...ActionsImageType,
};

// state类型声明
export interface InState {
  imageState: InImageState,
}

// 初始数据声明
export const InitState: InState = {
  imageState: InitImageState,
};
