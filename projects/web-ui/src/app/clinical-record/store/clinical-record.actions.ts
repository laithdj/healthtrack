/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import { ClinicalRecordDefinition } from '../shared/clinical-record-models';
import {
  Patient,
  SmartTextTemplate,
  FullStructuredReportDO,
  ReferenceIDDO,
  SmartTextBundle,
  SmartTextTemplateDisplayOrder,
  SmartTextPackage,
} from '../../../../../../Generated/CoreAPIClient';

// eslint-disable-next-line no-shadow
export enum ClinicalRecordActionTypes {
  ClinicalRecordInit = '[ClinicalRecord] Init',
  SmartTextInitFetch = '[ClinicalRecord] SmartTextInit Fetch',
  SmartTextInitFetchSuccess = '[ClinicalRecord] SmartTextInit Fetch Success',
  SmartTextBundleFetch = '[ClinicalRecord] SmartTextBundle Fetch',
  SmartTextBundleFetchSuccess = '[ClinicalRecord] SmartTextBundle Fetch Success',
  SmartTextReportFetch = '[ClinicalRecord] SmartTextReport Fetch',
  SmartTextReportFetchSuccess = '[ClinicalRecord] SmartTextReport Fetch Success',
  SmartTextReportSave = '[ClinicalRecord] SmartTextReport Save',
  SmartTextReportSaveSuccess = '[ClinicalRecord] SmartTextReport Save Success',
  SmartTextTemplateSave = '[ClinicalRecord] SmartTextTemplateSave',
  SmartTextTemplateSaveSuccess = '[ClinicalRecord] SmartTextTemplateSave Success',
  SmartTextTemplateDelete = '[ClinicalRecord] SmartTextTemplateDelete',
  SmartTextTemplateDeleteSuccess = '[ClinicalRecord] SmartTextTemplateDelete Success',
  SmartTextPackageSave = '[ClinicalRecord] SmartTextPackageSave',
  SmartTextPackageSaveSuccess = '[ClinicalRecord] SmartTextPackageSave Success',
  SmartTextTemplateListSave = '[ClinicalRecord] SmartTextTemplateListSave',
  SmartTextTemplateListSaveSuccess = '[ClinicalRecord] SmartTextTemplateListSave Success',
  ToggleShowReportBeside = '[ClinicalRecord] Toggle ShowReportBeside',
  ReportContentChanged = '[Clinical Record] ReportContentChanged',
  ReferenceIDListFetch = '[Clinical Record] ReferenceIDListFetch',
  ReferenceIDListFetchSuccess = '[Clinical Record] ReferenceIDListFetchSuccess'
}

export class ClinicalRecordInit implements Action {
  readonly type = ClinicalRecordActionTypes.ClinicalRecordInit;

  constructor(public payload: { patient: Patient, definition: ClinicalRecordDefinition }) { }
}

export class SmartTextInitFetch implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextInitFetch;

  constructor(public payload: ClinicalRecordDefinition) { }
}

export class SmartTextInitFetchSuccess implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextInitFetchSuccess;

  constructor(public payload: SmartTextBundle) { }
}

export class SmartTextBundleFetch implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextBundleFetch;

  constructor() { }
}

export class SmartTextBundleFetchSuccess implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextBundleFetchSuccess;

  constructor(public payload: SmartTextBundle) { }
}

export class SmartTextReportFetch implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextReportFetch;

  constructor(public payload: {containerId: number, cVersion: number}) { }
}

export class SmartTextReportFetchSuccess implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextReportFetchSuccess;

  constructor(public payload: FullStructuredReportDO) { }
}

export class SmartTextReportSave implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextReportSave;

  constructor(public payload: FullStructuredReportDO) { }
}

export class SmartTextReportSaveSuccess implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextReportSaveSuccess;

  constructor(public payload: FullStructuredReportDO) { }
}

export class SmartTextTemplateSave implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextTemplateSave;

  constructor(public payload: SmartTextTemplate) { }
}

export class SmartTextTemplateSaveSuccess implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextTemplateSaveSuccess;

  constructor(public payload: SmartTextTemplate) { }
}

export class SmartTextTemplateDelete implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextTemplateDelete;

  constructor(public payload: {
    templateId: number,
    formDisplay: string,
    recordSubCategory: number,
  }) { }
}

export class SmartTextTemplateDeleteSuccess implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextTemplateDeleteSuccess;

  constructor(public payload: {
    templateId: number,
    formDisplay: string,
    recordSubCategory: number,
  }) { }
}

export class ReportContentChanged implements Action {
  readonly type = ClinicalRecordActionTypes.ReportContentChanged;

  constructor(public payload: string) { }
}

export class SmartTextPackageSave implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextPackageSave;

  constructor(public payload: SmartTextPackage) { }
}

export class SmartTextPackageSaveSuccess implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextPackageSaveSuccess;

  constructor(public payload: SmartTextPackage) { }
}

export class SmartTextTemplateListSave implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextTemplateListSave;

  constructor(public payload: {
    templateDisplayOrderList: SmartTextTemplateDisplayOrder[],
    formDisplay: string,
    recordSubCategory: number,
  }) { }
}

export class SmartTextTemplateListSaveSuccess implements Action {
  readonly type = ClinicalRecordActionTypes.SmartTextTemplateListSaveSuccess;

  constructor(public payload: SmartTextTemplateDisplayOrder[]) { }
}

export class ToggleShowReportBeside implements Action {
  readonly type = ClinicalRecordActionTypes.ToggleShowReportBeside;

  constructor(public payload: boolean) { }
}

export class ReferenceIDListFetch implements Action {
  readonly type = ClinicalRecordActionTypes.ReferenceIDListFetch;

  constructor(public payload: { medGroup: string, medArea: string }) {}
}

export class ReferenceIDListFetchSuccess implements Action {
  readonly type = ClinicalRecordActionTypes.ReferenceIDListFetchSuccess;

  constructor(public payload: ReferenceIDDO[]) {}
}

export type ClinicalRecordActions =
  ClinicalRecordInit |
  SmartTextInitFetch |
  SmartTextInitFetchSuccess |
  SmartTextBundleFetch |
  SmartTextBundleFetchSuccess |
  SmartTextTemplateSave |
  SmartTextTemplateSaveSuccess |
  SmartTextTemplateDeleteSuccess |
  SmartTextPackageSave |
  SmartTextPackageSaveSuccess |
  SmartTextTemplateListSave |
  SmartTextTemplateListSaveSuccess |
  ReportContentChanged |
  SmartTextReportFetch |
  SmartTextReportFetchSuccess |
  SmartTextReportSave |
  SmartTextReportSaveSuccess |
  ToggleShowReportBeside |
  ReferenceIDListFetch |
  ReferenceIDListFetchSuccess;
