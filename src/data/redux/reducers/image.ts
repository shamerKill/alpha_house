import { combineReducers } from 'redux';
import { InitImageState } from '../state/image';
import { SelfReducersType } from './reducers_type';
import { ActionsType } from '../state';
import { TypeImageData } from '../../@types/images';

const bannerReducer: SelfReducersType<TypeImageData['banner']> = (state = InitImageState.banner, action) => {
  switch (action.type) {
    case ActionsType.CHANGE_BANNER:
      return [
        ...state,
      ];
    default:
      return state;
  }
};

const imageReducer = combineReducers<TypeImageData>({
  banner: bannerReducer,
});

export default imageReducer;
