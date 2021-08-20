import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { APIResponseOfListOfSmartTextTemplateListItem, APIResponseOfSmartTextTemplate,
  SmartTextClient } from '../../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../../app-store/app-ui-state.actions';
import { selectDoctorId } from '../../../app-store/app-ui.selectors';
import { DeleteSmartTextTemplate, DeleteSmartTextTemplateSuccess, EchocardiogramActionTypes,
  LoadTemplate, LoadTemplateList, LoadTemplateListSuccess, LoadTemplateSuccess } from './echocardiogram.actions';
import { EchocardiogramAppState } from './echocardiogram.reducers';

@Injectable()
export class EchocardiogramEffects {
  constructor(private actions$: Actions,
    private smartTextClient: SmartTextClient,
    private store: Store<EchocardiogramAppState>) { }

  @Effect()
  LoadTemplateList$ = this.actions$.pipe(ofType<LoadTemplateList>(EchocardiogramActionTypes.LoadTemplateList),
    withLatestFrom(this.store.pipe(select(selectDoctorId))), switchMap(([ action, doctorId ]) =>
      this.smartTextClient.getTemplateListItems('EchoCardiogram_Reporting', 1, doctorId)
        .pipe(map((response: APIResponseOfListOfSmartTextTemplateListItem) => {
        if (response && response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [ response.errorMessage ] });
        } else {
          return new LoadTemplateListSuccess({ smartTextTemplateListItems: response.data});
        }
      }))
  ));

  // @Effect()
  // LoadSmartTextList$ = this.actions$.pipe(ofType<LoadSmartTextList>(EchocardiogramActionTypes.LoadSmartTextList),
  //   withLatestFrom(this.store.pipe(select(selectDoctorId))), switchMap(([ action, doctorId ]) =>
  //     this.smartTextClient.getSmartTextListItems('EchoCardiogram_Reporting', 1)
  //       .pipe(map((response: APIResponseOfListOfSmartTextListItem) => {
  //       if (response && response.errorMessage && response.errorMessage.trim().length > 0) {
  //         return new SetError({ errorMessages: [ response.errorMessage ] });
  //       } else {
  //         return new LoadSmartTextListSuccess({ smartTextListItems: response.data});
  //       }
  //     }))
  // ));

  // @Effect()
  // LoadSmartText$ = this.actions$.pipe(ofType<LoadSmartText>(EchocardiogramActionTypes.LoadSmartText),
  //   switchMap((action: LoadSmartText) =>
  //   this.smartTextClient.getSmartText(action.payload).pipe(map((response: APIResponseOfSmartText) => {
  //     if (response.errorMessage && response.errorMessage.trim().length > 0) {
  //       return new SetError({ errorMessages: [ response.errorMessage ] });
  //     } else {
  //       return new LoadSmartTextSuccess({ smartText: response.data});
  //     }
  //   }))
  // ));

  @Effect()
  LoadSmartTextTemplate$ = this.actions$.pipe(ofType<LoadTemplate>(EchocardiogramActionTypes.LoadTemplate),
    switchMap((action: LoadTemplate) =>
    this.smartTextClient.getSmartTextTemplate(action.payload).pipe(map((response: APIResponseOfSmartTextTemplate) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [ response.errorMessage ] });
      } else {
        return new LoadTemplateSuccess({ smartTextTemplate: response.data});
      }
    }))
  ));

  // @Effect()
  // deleteSmartText$ = this.actions$.pipe(ofType<DeleteSmartText>(EchocardiogramActionTypes.DeleteSmartText),
  //   switchMap((action: DeleteSmartText) =>
  //   this.smartTextClient.deleteSmartText(action.payload.).pipe(map((response: APIResponseOfListOfInt32) => {
  //     if (response.errorMessage && response.errorMessage.trim().length > 0) {
  //       return new SetError({ errorMessages: [ response.errorMessage ] });
  //     } else {
  //       return new DeleteSmartTextSuccess(action.payload);
  //     }
  //   }))
  // ));

  @Effect()
  deleteSmartTextTemplate$ = this.actions$.pipe(ofType<DeleteSmartTextTemplate>(EchocardiogramActionTypes.DeleteSmartTextTemplate),
    switchMap((action: DeleteSmartTextTemplate) =>
    this.smartTextClient.deleteSmartTextTemplate(action.payload.templateId, action.payload.smartTextTemplates)
    .pipe(map((response: APIResponseOfListOfSmartTextTemplateListItem) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [ response.errorMessage ] });
      } else {
        return new DeleteSmartTextTemplateSuccess(response.data);
      }
    }))
  ));
}
