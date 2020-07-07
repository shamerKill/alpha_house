import { Reducer } from 'redux';
import ActionType from '../state/action_type';

type ReducersType<T, U extends keyof T> = Reducer<T, ActionType<T[U]>>;
export type SelfReducersType<T> = Reducer<T, ActionType<T>>;

export default ReducersType;
