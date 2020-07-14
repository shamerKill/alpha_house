import { combineReducers } from 'redux';
import { ActionsType } from '../state/index';
import { SelfReducersType } from './reducers_type';
import defualtPageRoute, { defaultPrevPageRoute } from '../state/route';

const pageRouteReducer: SelfReducersType<string> = (state = defualtPageRoute, action) => {
  switch (action.type) {
    case ActionsType.CHANGE_PAGE_ROUTE:
      return action.data;
    default:
      return state;
  }
};
const prevPageRouteReducer: SelfReducersType<string> = (state = defaultPrevPageRoute, action) => {
  switch (action.type) {
    case ActionsType.CHANGE_PREV_PAGE_ROUTE:
      return action.data;
    default:
      return state;
  }
};
const pageReducer = combineReducers<{
  pageRoute: string,
  prevPageRoute: string,
}>({
  pageRoute: pageRouteReducer,
  prevPageRoute: prevPageRouteReducer,
});

export default pageReducer;
