import { combineReducers } from 'redux';
import { ActionsType } from '../state/index';
import { SelfReducersType } from './reducers_type';
import defualtPageRoute from '../state/route';

const pageRouteReducer: SelfReducersType<string> = (state = defualtPageRoute, action) => {
  switch (action.type) {
    case ActionsType.CHANGE_PAGE_ROUTE:
      return action.data;
    default:
      return state;
  }
};
const pageReducer = combineReducers<{
  pageRoute: string,
}>({
  pageRoute: pageRouteReducer,
});

export default pageReducer;
