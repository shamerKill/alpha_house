import { Action } from 'redux';


type ActionType<T> = Action<string> & { data: T };

export default ActionType;
