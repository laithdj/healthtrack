/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import { RetrieveDataForTokenResult } from '../../../../../Generated/CoreAPIClient';

// eslint-disable-next-line no-shadow
export enum AppUiActionTypes {
  Authenticate = '[App] Authenticate Token',
  Authenticated = '[App] Authenticated',
  SetUser = '[App] Set User',
  ToggleEditModeAction = '[App] Toggle EditModeAction',
  SetError = '[App] Set Error',
  CloseError = '[App] Close Error',
  SetEditMode = '[App] Set Edit Mode',
  SetLoading = '[App] Set Loading',
  SetLog = '[App] Set Log',
}

export class Authenticate implements Action {
  readonly type = AppUiActionTypes.Authenticate;
  constructor(public payload: {token: string, requestedUrl: string}) {}
}

export class Authenticated implements Action {
  readonly type = AppUiActionTypes.Authenticated;
  constructor(public payload: boolean) {}
}

export class SetUser implements Action {
  readonly type = AppUiActionTypes.SetUser;

  constructor(public payload: RetrieveDataForTokenResult) { }
}

export class ToggleEditMode implements Action {
  readonly type = AppUiActionTypes.ToggleEditModeAction;
}

export class SetEditMode implements Action {
  readonly type = AppUiActionTypes.SetEditMode;

  constructor(public payload: boolean) { }
}

export class SetError implements Action {
  readonly type = AppUiActionTypes.SetError;

  constructor(public payload: { errorMessages: string[], title?: string }) {}
}

export class CloseError implements Action {
  readonly type = AppUiActionTypes.CloseError;

  constructor(public payload: boolean) {}
}

export class SetLog implements Action {
  readonly type = AppUiActionTypes.SetLog;

  constructor(public payload: string) {}
}

export class SetLoading implements Action {
  readonly type = AppUiActionTypes.SetLoading;

  constructor(public payload: boolean) { }
}

export type AppUiActions =
  Authenticate |
  Authenticated |
  SetUser |
  ToggleEditMode |
  SetEditMode |
  SetError |
  CloseError |
  SetLog |
  SetLoading;
