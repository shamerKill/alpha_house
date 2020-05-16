import { Reducer } from 'redux';
import ActionType from '../state/action_type';

type ReducersType<T, U extends keyof T> = Reducer<T, ActionType<T[U]>>;

export default ReducersType;
