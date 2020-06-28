import { combineReducers } from 'redux';
import { InImageState, InitImageState } from '../state/image';
import ReducersType from './reducers_type';
import { ActionsType } from '../state';

export type TypeBannerReducer = ReducersType<InImageState['banner'], 'data'>;
const bannerReducer: TypeBannerReducer = (state = InitImageState.banner, action) => {
  switch (action.type) {
    case ActionsType.FETCH_BANNER:
      return {
        ...state,
        isLoading: true,
        error: false,
      };
    case ActionsType.FETCH_BANNER_SUCCESS:
      return {
        ...state,
        isLoading: false,
        error: false,
        data: [...action.data],
      };
    case ActionsType.FETCH_BANNER_ERROR:
      return {
        ...state,
        isLoading: false,
        error: true,
      };
    default:
      return state;
  }
};

const imageReducer = combineReducers<InImageState>({
  banner: bannerReducer,
});

export default imageReducer;
