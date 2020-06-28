import { Action } from 'redux';

export type DispatchActionType<T, U extends keyof T> = Action<string> & { data: T[U] };
type ActionType<T> = Action<string> & { data: T };

export default ActionType;
