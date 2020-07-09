import { combineReducers } from 'redux';
import { InState } from '../state/index';
import imageReducer from './image';
import userReducer from './user';
import listReducer from './list';
import pageReducer from './route';


const rootReducers = combineReducers<InState>({
  imageState: imageReducer,
  userState: userReducer,
  listState: listReducer,
  pageRouteState: pageReducer,
});

export default rootReducers;
