import { Injectable } from '@angular/core';
import { Actions, ofType, Effect } from '@ngrx/effects';
import {
  catchError,
  map,
  switchMap,
  take,
} from 'rxjs/operators';
import { of } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { selectUserName } from '../../app-store/app-ui.selectors';
import {
  AnnotationToolsClient,
  APIResponseOfIEnumerableOfAnnotationToolDO,
} from '../../../../../../Generated/CoreAPIClient';
import { AppState } from '../../app-store/reducers';
import {
  AnnotationToolsActions,
  FetchAnnotationTools,
  FetchAnnotationToolsSuccess,
  FETCH_ANNOTATION_TOOLS,
  SaveAnnotationTools,
  SaveAnnotationToolsSuccess,
  SAVE_ANNOTATION_TOOLS,
} from './annotation-tools.actions';

@Injectable()
export class AnnotationToolsEffects {
  username: string;

  constructor(private actions$: Actions,
    private annotationToolsClient: AnnotationToolsClient,
    private store: Store<AppState>) {
    this.store.pipe(take(1), select(selectUserName)).subscribe(
      (username: string) => { this.username = username; });
  }

  @Effect()
  fetchAnnotationTools$ = this.actions$.pipe(
    ofType<AnnotationToolsActions>(FETCH_ANNOTATION_TOOLS),
    switchMap((action: FetchAnnotationTools) => this.annotationToolsClient.get(
      action.payload.formDisplay, action.payload.recordSubCategory).pipe(map(
      (res: APIResponseOfIEnumerableOfAnnotationToolDO) => new FetchAnnotationToolsSuccess(res.data),
      catchError((err) => of(err))),
    ),
    ),
  );

  @Effect()
  saveAnnotationTools$ = this.actions$.pipe(
    ofType<AnnotationToolsActions>(SAVE_ANNOTATION_TOOLS),
    switchMap((action: SaveAnnotationTools) => this.annotationToolsClient.save(action.payload.annotationTools,
      this.username, action.payload.formDisplay, action.payload.recordSubCategory).pipe(
      map((res: APIResponseOfIEnumerableOfAnnotationToolDO) => new SaveAnnotationToolsSuccess(res.data),
        catchError((err) => of(err))),
    ),
    ),
  );
}
