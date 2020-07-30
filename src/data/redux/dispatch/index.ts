import { Dispatch } from 'redux';
import { useSelector, useDispatch } from 'react-redux';
import { InState } from '../state/index';
import ActionType from '../state/action_type';

export type DispatchActionType<T> = Dispatch<ActionType<{[key in keyof T]?: T[key]}>>;

const useGetDispatch = <T>(
  ...keys: string[]
): [T, DispatchActionType<T>] => {
  const state = useSelector<InState, T>(store => {
    let obj: any = store;
    keys.forEach(key => {
      if (obj[key] !== undefined) obj = obj[key];
    });
    return obj as T;
  });
  const dispatch = useDispatch<DispatchActionType<T>>();
  return [state, dispatch];
};

export default useGetDispatch;
