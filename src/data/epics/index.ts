import { combineEpics, Epic } from 'redux-observable';
import { Action } from 'redux';
import imageEpics from './image';

const rootEpics = combineEpics(imageEpics) as Epic<Action<any>, any, any, any>;

export default rootEpics;
