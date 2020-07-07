import { combineReducers } from 'redux';
import { TypeNewsList } from '../../@types/baseList';
import { defaultNewsList } from '../state/list';
import { SelfReducersType } from './reducers_type';
import { ActionsType } from '../state';

const newsListReducer: SelfReducersType<TypeNewsList[]> = (state = defaultNewsList, action) => {
  switch (action.type) {
    case ActionsType.CHANGE_NEWS_LIST:
      return [
        ...action.data,
      ];
    default:
      return state;
  }
};
const listReducer = combineReducers<{
  newsList: TypeNewsList[];
}>({
  newsList: newsListReducer,
});

export default listReducer;
