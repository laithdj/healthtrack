/* eslint-disable no-shadow */
// eslint-disable-next-line max-classes-per-file
import { Action } from '@ngrx/store';
import { QuestionnaireTemplateDO, TemplateSubRecordTypesResponse } from '../../../../../../Generated/CoreAPIClient';

export enum QuestionnaireActionTypes {
  InitFetchTemplates = '[Q] Init Fetch Templates',
  InitFetchTemplatesSuccess = '[Q] Init Fetch Templates Success',
  InitFetchRecordSubCategoryList = '[Q] Init Fetch Record SubCategory List',
  InitFetchRecordSubCategoryListSuccess = '[Q] Init Fetch Record SubCategory List Success',
  InitFetchTemplate = '[Q] Init Fetch Template',
  InitFetchTemplateSuccess = '[Q] Init Fetch Template Success',
  SaveTemplate = '[Q] Save Template',
  SaveTemplateSuccess = '[Q] Save Template Success',
  DeleteTemplate = '[Q] Delete Template',
  DeleteTemplateSuccess = '[Q] Delete Template Success',
}

export class InitFetchTemplates implements Action {
  readonly type = QuestionnaireActionTypes.InitFetchTemplates;

  constructor(public payload:number) { }
}

export class InitFetchTemplatesSuccess implements Action {
  readonly type = QuestionnaireActionTypes.InitFetchTemplatesSuccess;

  constructor(public payload:QuestionnaireTemplateDO[]) { }
}
export class InitFetchRecordSubCategoryList implements Action {
  readonly type = QuestionnaireActionTypes.InitFetchRecordSubCategoryList;

  constructor() { }
}

export class InitFetchRecordSubCategoryListSuccess implements Action {
  readonly type = QuestionnaireActionTypes.InitFetchRecordSubCategoryListSuccess;

  constructor(public payload:TemplateSubRecordTypesResponse) { }
}
export class InitFetchTemplate implements Action {
  readonly type = QuestionnaireActionTypes.InitFetchTemplate;

  constructor(public payload:number) { }
}

export class InitFetchTemplateSuccess implements Action {
  readonly type = QuestionnaireActionTypes.InitFetchTemplateSuccess;

  constructor(public payload:QuestionnaireTemplateDO) { }
}
export class SaveTemplate implements Action {
  readonly type = QuestionnaireActionTypes.SaveTemplate;

  constructor(public payload:{template:QuestionnaireTemplateDO, isNew:boolean}) { }
}

export class SaveTemplateSuccess implements Action {
  readonly type = QuestionnaireActionTypes.SaveTemplateSuccess;

  constructor(public payload:QuestionnaireTemplateDO) { }
}
export class DeleteTemplate implements Action {
  readonly type = QuestionnaireActionTypes.DeleteTemplate;

  constructor(public payload:number) { }
}

export class DeleteTemplateSuccess implements Action {
  readonly type = QuestionnaireActionTypes.DeleteTemplateSuccess;

  constructor(public payload:QuestionnaireTemplateDO) { }
}

export type QuestionnaireActions = InitFetchTemplates | InitFetchTemplatesSuccess | SaveTemplate
| SaveTemplateSuccess | InitFetchTemplate | InitFetchTemplateSuccess | DeleteTemplate | DeleteTemplateSuccess |
InitFetchRecordSubCategoryList | InitFetchRecordSubCategoryListSuccess;
