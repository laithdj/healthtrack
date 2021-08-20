/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import { AnnotationToolDO } from '../../../../../../Generated/CoreAPIClient';

export const FETCH_ANNOTATION_TOOLS = 'FETCH_ANNOTATION_TOOLS';
export const FETCH_ANNOTATION_TOOLS_SUCCESS = 'FETCH_ANNOTATION_TOOLS_SUCCESS';
export const SAVE_ANNOTATION_TOOLS = 'SAVE_ANNOTATION_TOOLS';
export const SAVE_ANNOTATION_TOOLS_SUCCESS = 'SAVE_ANNOTATION_TOOLS_SUCCESS';

export class FetchAnnotationTools implements Action {
  readonly type = FETCH_ANNOTATION_TOOLS;

  constructor(public payload: {
    formDisplay: string,
    recordSubCategory: number
  }) {}
}

export class FetchAnnotationToolsSuccess implements Action {
  readonly type = FETCH_ANNOTATION_TOOLS_SUCCESS;

  constructor(public payload: AnnotationToolDO[]) {}
}

export class SaveAnnotationTools implements Action {
  readonly type = SAVE_ANNOTATION_TOOLS;

  constructor(public payload: {
    annotationTools: AnnotationToolDO[]
    formDisplay: string,
    recordSubCategory: number
  }) {}
}

export class SaveAnnotationToolsSuccess implements Action {
  readonly type = SAVE_ANNOTATION_TOOLS_SUCCESS;

  constructor(public payload: AnnotationToolDO[]) {}
}

export type AnnotationToolsActions = FetchAnnotationTools | FetchAnnotationToolsSuccess |
  SaveAnnotationTools | SaveAnnotationToolsSuccess;
