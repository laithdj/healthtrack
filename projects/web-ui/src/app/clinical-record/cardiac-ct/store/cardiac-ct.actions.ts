/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import {
  LocationInfo,
  StaffDO,
  GetStaffForRolesLocationsRequest,
  CardiacContainerDO,
  DateTimeDO,
  GetAllListItems,
  ListItemDefinition,
  GraftDO,
} from '../../../../../../../Generated/CoreAPIClient';
import { ClinicalRecordDefinition } from '../../shared/clinical-record-models';

// eslint-disable-next-line no-shadow
export enum CardiacCTActionTypes {
  InitFetch = '[CardiacCT] InitFetch',
  InitFetchSuccess = '[CardiacCT] InitFetch Success',
  InitListFetch = '[CardiacCT] InitListFetch',
  InitListFetchSuccess = '[CardiacCT] InitListFetch Success',
  DeleteRecord = '[Cardiac CT] Delete Record',
  DeleteRecordSuccess = '[Cardiac CT] Delete Record Success',
  UpdateNormalisedResult = '[Cardiac CT] Update Normalised Result',
  RemoveNormalisedResult = '[Cardiac CT] Removed Normalised Result',
  UpdateRecord = '[Cardiac CT] Update Record',
  TestDateChanged = '[Cardiac CT] Test Date Changed',
  IndicationsChanged = '[Cardiac CT] Indications Changed',
  RiskFactorsChanged = '[Cardiac CT] Risk Factors Changed',
  RiskFactorsDetailsChanged = '[Cardiac CT] Risk Factors Details Changed',
  IndicationsDetailsChanged = '[Cardiac CT] Indications Details Changed',
  BloodPressureChanged = '[Cardiac CT] Blood Pressure Changed',
  CoronaryDescription = '[Cardiac CT] Set Coronary Description',
  ProcedureDateChanged = '[Cardiac CT] Procedure Date Changed',
  DurationChanged = '[Cardiac CT] Duration Changed',
  HeartRateChanged = '[Cardiac CT] Heart Rate Changed',
  GraftsChanged = '[Cardiac CT] Grafts Changed',
  CalculateBMI = '[Cardiac CT] Calculate BMI',
  FetchBMIDesc = '[Cardiac CT] Fetch BMI Desc',
  FetchBMIDescSuccess = '[Cardiac CT] Fetch BMI Desc Success',
  CalculateBMISuccess = '[Cardiac CT] Calculate BMI Success',
  CalculateBSA = '[Cardiac CT] Calculate BSA',
  CalculateBSASuccess = '[Cardiac CT] Calculate BSA Success',
  ConvertToCentimeters = '[Cardiac CT] Convert To Centimeters Changed',
  ConvertToGrams = '[Cardiac CT] Convert To Grams',
  StaffChanged = '[Cardiac CT] Staff Changed',
  ConvertToGramsSuccess = '[Cardiac CT] Convert To Grams Success',
  ConvertToCentimetersSuccess = '[Cardiac CT] Convert To Centimeters Changed Success',
  HeightChanged = '[Cardiac CT] Height Changed',
  WeightChanged = '[Cardiac CT] Weight Changed',
  MetricsChanged = '[Cardiac CT] Metrics Changed',
  InternalNotesChanged = '[Cardiac CT] Internal Notes Changed',
  HospitalSiteChange = '[Cardiac CT] Hospital Site Changed',
  InitStaffFetch = '[Cardiac CT] InitStaff Fetch',
  InitStaffFetchSuccess = '[Cardiac CT] InitStaff Fetch Success',
  SaveResultsForRecord = '[Cardiac CT] SaveResultsForRecord',
  SaveResultsForRecordSuccess = '[Cardiac CT] SaveResultsForRecord Success'
}

export class CardiacCTInitFetch implements Action {
  readonly type = CardiacCTActionTypes.InitFetch;

  constructor(public payload: { definition: ClinicalRecordDefinition, patientId: number,
    medGroup: string, medArea: string, containerId?: number }) { }
}
export class CardiacCTListFetch implements Action {
  readonly type = CardiacCTActionTypes.InitListFetch;

  constructor(public payload: {
    scannerModel?: GetAllListItems,
    graftType?: GetAllListItems,
    graftAnastamosis?: GetAllListItems,
    graftSeverity?: GetAllListItems,
    graftLocation?: GetAllListItems,
    indicationsList?:GetAllListItems,
    riskFactorsList: GetAllListItems }) { }
}
export class CardiacCTListFetchSuccess implements Action {
  readonly type = CardiacCTActionTypes.InitListFetchSuccess;

  constructor(public payload:{
    scannerModel?: ListItemDefinition[],
    graftType?: ListItemDefinition[],
    graftAnastamosis?: ListItemDefinition[],
    graftSeverity?: ListItemDefinition[],
    graftLocation?: ListItemDefinition[],
    indicationsList?:ListItemDefinition[],
    riskFactorsList: ListItemDefinition[] }) { }
}

export class CardiacCTInitFetchSuccess implements Action {
  readonly type = CardiacCTActionTypes.InitFetchSuccess;

  constructor(public payload: {
    locations: LocationInfo[],
    // eslint-disable-next-line camelcase
    patient_ID: number,
    record?: CardiacContainerDO }) { }
}

export class CardiacCTUpdateNormalisedResult implements Action {
  readonly type = CardiacCTActionTypes.UpdateNormalisedResult;

  constructor(public payload: { result: any, referenceId: number, resultType: number,
    description?: string, displayValue?:string }) { }
}
export class CardiacCTRemoveNormalisedResult implements Action {
  readonly type = CardiacCTActionTypes.RemoveNormalisedResult;

  constructor(public payload: number) { }
}

export class CardiacCTTestDateChanged implements Action {
  readonly type = CardiacCTActionTypes.TestDateChanged;

  constructor(public payload: DateTimeDO) { }
}

export class CardiacCTProcedureDateChanged implements Action {
  readonly type = CardiacCTActionTypes.ProcedureDateChanged;

  constructor(public payload: DateTimeDO) { }
}
export class CardiacCTDurationChanged implements Action {
  readonly type = CardiacCTActionTypes.DurationChanged;

  constructor(public payload: number) { }
}

export class CardiacCTHospitalSiteChange implements Action {
  readonly type = CardiacCTActionTypes.HospitalSiteChange;

  constructor(public payload: number) { }
}
export class CardiacCTInternalNotesChanged implements Action {
  readonly type = CardiacCTActionTypes.InternalNotesChanged;

  constructor(public payload: string) { }
}

export class CardiacCTCalculateBMI implements Action {
  readonly type = CardiacCTActionTypes.CalculateBMI;

  constructor(public payload: { height: number, weight: number }) { }
}
export class CardiacCTFetchBMIDesc implements Action {
  readonly type = CardiacCTActionTypes.FetchBMIDesc;

  constructor() { }
}
export class CardiacCTFetchBMIDescSuccess implements Action {
  readonly type = CardiacCTActionTypes.FetchBMIDescSuccess;

  constructor(public payload: string) { }
}

export class CardiacCTCalculateBMISuccess implements Action {
  readonly type = CardiacCTActionTypes.CalculateBMISuccess;

  constructor(public payload: number) { }
}

export class CardiacCTCalculateBSA implements Action {
  readonly type = CardiacCTActionTypes.CalculateBSA;

  constructor(public payload: { height: number, weight: number }) { }
}
export class CardiacCTCalculateBSASuccess implements Action {
  readonly type = CardiacCTActionTypes.CalculateBSASuccess;

  constructor(public payload: number) { }
}

export class CardiacCTBloodPressureChanged implements Action {
  readonly type = CardiacCTActionTypes.BloodPressureChanged;

  constructor(public payload: { type: string, value: number }) { }
}
export class CardiacCTIndicationsChanged implements Action {
  readonly type = CardiacCTActionTypes.IndicationsChanged;

  constructor(public payload: number[]) { }
}
export class CardiacCTRiskFactorsChanged implements Action {
  readonly type = CardiacCTActionTypes.RiskFactorsChanged;

  constructor(public payload: number[]) { }
}
export class CardiacCTCoronaryDescription implements Action {
  readonly type = CardiacCTActionTypes.CoronaryDescription;

  constructor(public payload: {refId: number, text: string, value?: number, reason?:boolean}) { }
}
export class CardiacCTIndicationsDetailsChanged implements Action {
  readonly type = CardiacCTActionTypes.IndicationsDetailsChanged;

  constructor(public payload: string) { }
}
export class CardiacCTRiskFactorsDetailsChanged implements Action {
  readonly type = CardiacCTActionTypes.RiskFactorsDetailsChanged;

  constructor(public payload: string) { }
}

export class CardiacCTHeartRateChanged implements Action {
  readonly type = CardiacCTActionTypes.HeartRateChanged;

  constructor(public payload: number) { }
}
export class CardiacCTMetricsChanged implements Action {
  readonly type = CardiacCTActionTypes.MetricsChanged;

  constructor(public payload: { type: string, value: number }) { }
}

export class CardiacCTHeightChanged implements Action {
  readonly type = CardiacCTActionTypes.HeightChanged;

  constructor(public payload: number) { }
}
export class CardiacCTConvertToCentimeters implements Action {
  readonly type = CardiacCTActionTypes.ConvertToCentimeters;

  constructor(public payload: number) { }
}
export class CardiacCTConvertToGrams implements Action {
  readonly type = CardiacCTActionTypes.ConvertToGrams;

  constructor(public payload: number) { }
}

export class CardiacCTConvertToGramsSuccess implements Action {
  readonly type = CardiacCTActionTypes.ConvertToGramsSuccess;

  constructor(public payload: number) { }
}
export class CardiacCTConvertToCentimetersSuccess implements Action {
  readonly type = CardiacCTActionTypes.ConvertToCentimetersSuccess;

  constructor(public payload: number) { }
}
export class CardiacCTWeightChanged implements Action {
  readonly type = CardiacCTActionTypes.WeightChanged;

  constructor(public payload: number) { }
}
export class CardiacCTStaffChanged implements Action {
  readonly type = CardiacCTActionTypes.StaffChanged;

  constructor(public payload: {staffId: number, roleText: string}) { }
}
export class CardiacCTGraftsChanged implements Action {
  readonly type = CardiacCTActionTypes.GraftsChanged;

  constructor(public payload?: {graft:GraftDO, deleted?:boolean, indx?:number}) { }
}

export class CardiacCTUpdateRecord implements Action {
  readonly type = CardiacCTActionTypes.UpdateRecord;

  constructor(public payload: CardiacContainerDO) { }
}
export class CardiacCTInitStaffFetch implements Action {
  readonly type = CardiacCTActionTypes.InitStaffFetch;

  constructor(public payload: GetStaffForRolesLocationsRequest) { }
}

export class CardiacCTInitStaffFetchSuccess implements Action {
  readonly type = CardiacCTActionTypes.InitStaffFetchSuccess;

  constructor(public payload: StaffDO[]) { }
}

export class CardiacCTSaveResultsForRecord implements Action {
  readonly type = CardiacCTActionTypes.SaveResultsForRecord;

  constructor() { }
}

export class CardiacCTSaveResultsForRecordSuccess implements Action {
  readonly type = CardiacCTActionTypes.SaveResultsForRecordSuccess;

  constructor(public payload: CardiacContainerDO) { }
}

export class CardiacCTDeleteRecord implements Action {
  readonly type = CardiacCTActionTypes.DeleteRecord;

  constructor() { }
}

export class CardiacCTDeleteRecordSuccess implements Action {
  readonly type = CardiacCTActionTypes.DeleteRecordSuccess;

  constructor(public payload: boolean) { }
}

export type CardiacCTActions =
  CardiacCTInitFetch |
  CardiacCTInitFetchSuccess |
  CardiacCTInitStaffFetch |
  CardiacCTInitStaffFetchSuccess |
  CardiacCTSaveResultsForRecord |
  CardiacCTSaveResultsForRecordSuccess |
  CardiacCTDeleteRecord |
  CardiacCTDeleteRecordSuccess |
  CardiacCTUpdateNormalisedResult |
  CardiacCTUpdateRecord |
  CardiacCTTestDateChanged |
  CardiacCTProcedureDateChanged |
  CardiacCTBloodPressureChanged |
  CardiacCTHeartRateChanged |
  CardiacCTMetricsChanged |
  CardiacCTHospitalSiteChange |
  CardiacCTHeightChanged |
  CardiacCTWeightChanged |
  CardiacCTConvertToCentimeters |
  CardiacCTConvertToCentimetersSuccess |
  CardiacCTConvertToGrams |
  CardiacCTConvertToGramsSuccess |
  CardiacCTCalculateBMI |
  CardiacCTCalculateBMISuccess |
  CardiacCTCalculateBSASuccess |
  CardiacCTInternalNotesChanged |
  CardiacCTCalculateBSA |
  CardiacCTDurationChanged |
  CardiacCTStaffChanged |
  CardiacCTFetchBMIDesc |
  CardiacCTFetchBMIDescSuccess |
  CardiacCTListFetch |
  CardiacCTListFetchSuccess |
  CardiacCTGraftsChanged |
  CardiacCTIndicationsChanged |
  CardiacCTRiskFactorsChanged |
  CardiacCTIndicationsDetailsChanged |
  CardiacCTRiskFactorsDetailsChanged |
  CardiacCTCoronaryDescription |
  CardiacCTRemoveNormalisedResult;
