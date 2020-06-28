import { Epic, combineEpics } from 'redux-observable';
import {
  map, catchError, mergeMap,
} from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of } from 'rxjs';
import { ActionsType } from '../state/index';
import { DispatchActionType } from '../state/action_type';
import { InImageState, ActionsImageType } from '../state/image';

const url = 'http://192.168.3.3:9900/';
export const fetchBanner: Epic<DispatchActionType<InImageState['banner'], 'data'>> = (action$) => {
  return action$
    .ofType(ActionsImageType.FETCH_BANNER)
    .pipe(
      mergeMap(() => ajax.getJSON<InImageState['banner']['data']>(url)),
      map(response => ({ type: ActionsType.FETCH_BANNER_SUCCESS, data: response })),
      catchError(message => of({ type: ActionsType.FETCH_BANNER_ERROR, data: message })),
    );
};

const imageEpics = combineEpics(fetchBanner);

export default imageEpics;
