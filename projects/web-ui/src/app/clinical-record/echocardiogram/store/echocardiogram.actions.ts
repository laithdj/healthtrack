import { Action } from '@ngrx/store';
import { SmartTextTemplateListItem, SmartTextTemplate, SmartTextNode } from '../../../../../../../Generated/CoreAPIClient';

export enum EchocardiogramActionTypes {
  LoadTemplateList = '[Echocardiogram] Load Template List',
  LoadTemplateListSuccess = '[Echocardiogram] Load Template List Success',
  LoadSmartTextList = '[Echocardiogram] Load Smart Text List',
  LoadSmartTextListSuccess = '[Echocardiogram] Load Smart Text List Success',
  LoadSmartText = '[Echocardiogram] Load Smart Text',
  LoadSmartTextSuccess = '[Echocardiogram] Load Smart Text Success',
  LoadTemplate = '[Echocardiogram] Load Template',
  LoadTemplateSuccess = '[Echocardiogram] Load Template Success',
  DeleteSmartText = '[Echocardiogram] Delete Smart Text',
  DeleteSmartTextSuccess = '[Echocardiogram] Delete Smart Text Success',
  DeleteSmartTextTemplate = '[Echocardiogram] Delete Smart Text Template',
  DeleteSmartTextTemplateSuccess = '[Echocardiogram] Delete Smart Text Template Success',
}

export class LoadTemplateList implements Action {
  readonly type = EchocardiogramActionTypes.LoadTemplateList;

  constructor() { }
}

export class LoadSmartTextList implements Action {
  readonly type = EchocardiogramActionTypes.LoadSmartTextList;

  constructor() { }
}

export class LoadSmartText implements Action {
  readonly type = EchocardiogramActionTypes.LoadSmartText;

  constructor(public payload: number) { }
}

export class LoadTemplate implements Action {
  readonly type = EchocardiogramActionTypes.LoadTemplate;

  constructor(public payload: number) { }
}

export class DeleteSmartText implements Action {
  readonly type = EchocardiogramActionTypes.DeleteSmartText;

  constructor(public payload: { navID: number, nodeList: SmartTextNode[] }) { }
}

export class DeleteSmartTextTemplate implements Action {
  readonly type = EchocardiogramActionTypes.DeleteSmartTextTemplate;

  constructor(public payload: { templateId: number, smartTextTemplates: SmartTextTemplateListItem[] }) { }
}

export class LoadTemplateListSuccess implements Action {
  readonly type = EchocardiogramActionTypes.LoadTemplateListSuccess;

  constructor(public payload: { smartTextTemplateListItems: SmartTextTemplateListItem[] }) { }
}

export class LoadSmartTextListSuccess implements Action {
  readonly type = EchocardiogramActionTypes.LoadSmartTextListSuccess;

  constructor(public payload: { smartTextListItems: SmartTextNode[] }) { }
}

export class LoadSmartTextSuccess implements Action {
  readonly type = EchocardiogramActionTypes.LoadSmartTextSuccess;

  constructor(public payload: { smartText: SmartTextNode }) { }
}

export class LoadTemplateSuccess implements Action {
  readonly type = EchocardiogramActionTypes.LoadTemplateSuccess;

  constructor(public payload: { smartTextTemplate: SmartTextTemplate }) { }
}

export class DeleteSmartTextSuccess implements Action {
  readonly type = EchocardiogramActionTypes.DeleteSmartTextSuccess;

  constructor(public payload: number) { }
}

export class DeleteSmartTextTemplateSuccess implements Action {
  readonly type = EchocardiogramActionTypes.DeleteSmartTextTemplateSuccess;

  constructor(public payload: SmartTextTemplateListItem[]) { }
}


export type EchocardiogramActions = LoadTemplateList | LoadTemplateListSuccess | LoadSmartTextList
| LoadSmartTextListSuccess | LoadSmartText | LoadSmartTextSuccess | LoadTemplate | LoadTemplateSuccess | DeleteSmartText
| DeleteSmartTextSuccess | DeleteSmartTextTemplate | DeleteSmartTextTemplateSuccess;
