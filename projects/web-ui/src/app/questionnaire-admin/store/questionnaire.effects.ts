import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { selectUserPkId } from '../../app-store/app-ui.selectors';
import { SetError } from '../../app-store/app-ui-state.actions';
import {
  InitFetchTemplates, QuestionnaireActionTypes, InitFetchTemplatesSuccess,
  SaveTemplate, SaveTemplateSuccess, InitFetchTemplate, InitFetchTemplateSuccess,
  DeleteTemplate, DeleteTemplateSuccess,
  InitFetchRecordSubCategoryList, InitFetchRecordSubCategoryListSuccess,
} from './questionnaire.actions';
import {
  QuestionnaireTemplateClient,
  APIResponseOfListOfQuestionnaireTemplateDO,
  APIResponseOfQuestionnaireTemplateDO,
  APIResponseOfTemplateSubRecordTypesResponse,
} from '../../../../../../Generated/CoreAPIClient';
import { QuestionnaireAppState } from './questionnaire.reducers';

@Injectable()
export class QuestionnaireEffects {
  constructor(private actions$: Actions,
    private questionnaireTemplate: QuestionnaireTemplateClient,
    private store: Store<QuestionnaireAppState>) { }

  @Effect()
  fetchQuestionnaires$ = this.actions$.pipe(ofType<InitFetchTemplates>(
    QuestionnaireActionTypes.InitFetchTemplates),
  switchMap((action) => this.questionnaireTemplate.listTemplates(action.payload)
    .pipe(map((response: APIResponseOfListOfQuestionnaireTemplateDO) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [response.errorMessage] });
      }
      return new InitFetchTemplatesSuccess(response.data);
    })),
  ));
  @Effect()
  fetchRecordSubCategory$ = this.actions$.pipe(ofType<InitFetchRecordSubCategoryList>(
    QuestionnaireActionTypes.InitFetchRecordSubCategoryList),
  switchMap(() => this.questionnaireTemplate.fetchTemplateSubRecordTypes()
    .pipe(map((response: APIResponseOfTemplateSubRecordTypesResponse) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [response.errorMessage] });
      }
      return new InitFetchRecordSubCategoryListSuccess(response.data);
    })),
  ));
  @Effect()
  saveQuestionnaire$ = this.actions$.pipe(ofType<SaveTemplate>(
    QuestionnaireActionTypes.SaveTemplate), withLatestFrom(this.store.pipe(select(selectUserPkId))),
  switchMap(([action, userPkId]) => this.questionnaireTemplate.saveTemplate(action.payload.template,
    action.payload.isNew, userPkId)
    .pipe(map((response: APIResponseOfQuestionnaireTemplateDO) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [response.errorMessage] });
      }
      return new SaveTemplateSuccess(response.data);
    })),
  ));
  @Effect()
  deleteQuestionnaire$ = this.actions$.pipe(ofType<DeleteTemplate>(
    QuestionnaireActionTypes.DeleteTemplate), withLatestFrom(this.store.pipe(select(selectUserPkId))),
  switchMap(([action, userPkId]) => this.questionnaireTemplate.deleteTemplate(action.payload,
    userPkId)
    .pipe(map((response: APIResponseOfQuestionnaireTemplateDO) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [response.errorMessage] });
      }
      return new DeleteTemplateSuccess(response.data);
    })),
  ));
  @Effect()
  fetchQuestionnaire$ = this.actions$.pipe(ofType<InitFetchTemplate>(
    QuestionnaireActionTypes.InitFetchTemplate),
  switchMap((action) => this.questionnaireTemplate.fetchTemplate(action.payload)
    .pipe(map((response: APIResponseOfQuestionnaireTemplateDO) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [response.errorMessage] });
      }
      return new InitFetchTemplateSuccess(response.data);
    })),
  ));
}
