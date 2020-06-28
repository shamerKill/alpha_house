import { combineReducers } from 'redux';
import { InState } from '../state/index';
import imageReducer from './image';


const rootReducers = combineReducers<InState>({
  imageState: imageReducer,
});

export default rootReducers;
