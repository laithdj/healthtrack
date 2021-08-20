/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import {
  LocationInfo,
  DoctorListItem,
  BookingFilter,
  BillWorksheetItem,
  WorksheetClaimStatus,
  FeeTableBillItems,
  CompanyDO,
} from '../../../../../../Generated/CoreAPIClient';

// eslint-disable-next-line no-shadow
export enum BillingWorksheetActionTypes {
  InitFetch = '[BW] Init Fetch',
  InitFetchSuccess = '[BW] Init Fetch Success',
  FilteredClaimsFetch = '[BW] FilteredClaims Fetch',
  FilteredClaimsFetchSuccess = '[BW] FilteredBookings Fetch Success',
  SelectedStatusChanged = '[BW] SelectedStatus Changed',
  SelectedLocationChanged = '[BW] SelectedLocation Changed',
  SelectedDoctorChanged = '[BW] SelectedDoctor Changed',
  DateRangeChanged = '[BW] DateRange Changed',
  SelectedClaimIdChanged = '[BW] SelectedClaimId Changed',
  LoadBookingsSubmit = '[BW] LoadBookings Submit',
  GetItemsForBookingSubmit = '[BW] GetItemsForBooking Submit',
  GetItemsForBookingSubmitSuccess = '[BW] GetItemsForBooking Submit Success',
  UpdateHealthFundSubmit = '[BW] UpdateHealthFund Submit',
  UpdateHealthFundSubmitSuccess = '[BW] UpdateHealthFund Submit Success',
  AddNewServiceSubmit = '[BW] AddNewService Submit',
  AddNewServiceSubmitSuccess = '[BW] AddNewService Submit Success',
  DeleteServiceSubmit = '[BW] DeleteService Submit',
  DeleteServiceSubmitSuccess = '[BW] DeleteService Submit Success',
  DeleteWorkSheetClaim = '[BW] DeleteWorkSheet',
  DeleteWorkSheetClaimSuccess = '[BW] DeleteWorkSheet Success',
  SaveClaimSubmit = '[BW] SaveClaim Submit',
  SaveClaimSubmitSuccess = '[BW] SaveClaim Submit Success',
  ServicesListFetch = '[BW] ServicesList Fetch',
  ServicesListFetchSuccess = '[BW] ServicesList Fetch Success',
  GetAllCompaniesFetch = '[BW] GetAllCompanies Fetch',
  GetAllCompaniesFetchSuccess = '[BW] GetAllCompanies Fetch Success'
}

export class InitFetch implements Action {
  readonly type = BillingWorksheetActionTypes.InitFetch;

  constructor() { }
}

export class InitFetchSuccess implements Action {
  readonly type = BillingWorksheetActionTypes.InitFetchSuccess;

  constructor(public payload: {
    doctors: DoctorListItem[],
    locations: LocationInfo[],
    companies: CompanyDO[],
  }) { }
}

export class FilteredClaimsFetch implements Action {
  readonly type = BillingWorksheetActionTypes.FilteredClaimsFetch;

  constructor(public payload: BookingFilter) { }
}

export class FilteredClaimsFetchSuccess implements Action {
  readonly type = BillingWorksheetActionTypes.FilteredClaimsFetchSuccess;

  constructor(public payload: BillWorksheetItem[]) { }
}

export class SelectedStatusChanged implements Action {
  readonly type = BillingWorksheetActionTypes.SelectedStatusChanged;

  constructor(public payload: WorksheetClaimStatus) { }
}

export class SelectedLocationChanged implements Action {
  readonly type = BillingWorksheetActionTypes.SelectedLocationChanged;

  constructor(public payload: number) { }
}

export class SelectedDoctorChanged implements Action {
  readonly type = BillingWorksheetActionTypes.SelectedDoctorChanged;

  constructor(public payload: number) { }
}

export class DateRangeChanged implements Action {
  readonly type = BillingWorksheetActionTypes.DateRangeChanged;

  constructor(public payload: { fromDate: Date, toDate: Date }) { }
}

export class SelectedClaimIdChanged implements Action {
  readonly type = BillingWorksheetActionTypes.SelectedClaimIdChanged;

  constructor(public payload: number) { }
}

export class LoadBookingsSubmit implements Action {
  readonly type = BillingWorksheetActionTypes.LoadBookingsSubmit;

  constructor(public payload: { filter: BookingFilter, fromDate: Date, toDate: Date }) { }
}

export class GetItemsForBookingSubmit implements Action {
  readonly type = BillingWorksheetActionTypes.GetItemsForBookingSubmit;

  constructor(public payload: number) { }
}

export class GetItemsForBookingSubmitSuccess implements Action {
  readonly type = BillingWorksheetActionTypes.GetItemsForBookingSubmitSuccess;

  constructor(public payload: BillWorksheetItem[]) { }
}

export class UpdateHealthFundSubmit implements Action {
  readonly type = BillingWorksheetActionTypes.UpdateHealthFundSubmit;

  constructor(public payload: { claimId: number, patientId: number }) {}
}

export class UpdateHealthFundSubmitSuccess implements Action {
  readonly type = BillingWorksheetActionTypes.UpdateHealthFundSubmitSuccess;

  constructor(public payload: BillWorksheetItem[]) {}
}

export class AddNewServiceSubmit implements Action {
  readonly type = BillingWorksheetActionTypes.AddNewServiceSubmit;

  constructor(public payload: {
    serviceCode: string,
    claimId: number,
    feeTableId: number,
    coverPercentage?: number
  }) { }
}

export class AddNewServiceSubmitSuccess implements Action {
  readonly type = BillingWorksheetActionTypes.AddNewServiceSubmitSuccess;

  constructor(public payload: BillWorksheetItem) { }
}

export class DeleteServiceSubmit implements Action {
  readonly type = BillingWorksheetActionTypes.DeleteServiceSubmit;

  constructor(public payload: { claimId: number, serviceId: number}) { }
}

export class DeleteServiceSubmitSuccess implements Action {
  readonly type = BillingWorksheetActionTypes.DeleteServiceSubmitSuccess;

  constructor(public payload: { claimId: number, serviceId: number}) { }
}

export class DeleteWorkSheetClaim implements Action {
  readonly type = BillingWorksheetActionTypes.DeleteWorkSheetClaim;

  constructor(public payload: number) { }
}

export class DeleteWorkSheetClaimSuccess implements Action {
  readonly type = BillingWorksheetActionTypes.DeleteWorkSheetClaimSuccess;

  constructor(public payload: number) { }
}

export class SaveClaimSubmit implements Action {
  readonly type = BillingWorksheetActionTypes.SaveClaimSubmit;

  constructor(public payload: {
    items: BillWorksheetItem[],
    process: boolean,
    setPatientNoCharge: boolean,
    setInsurerNoCharge: boolean
  }) { }
}

export class SaveClaimSubmitSuccess implements Action {
  readonly type = BillingWorksheetActionTypes.SaveClaimSubmitSuccess;

  constructor(public payload: BillWorksheetItem[]) { }
}

export class ServicesListFetch implements Action {
  readonly type = BillingWorksheetActionTypes.ServicesListFetch;

  constructor(public payload: number) { }
}

export class ServicesListFetchSuccess implements Action {
  readonly type = BillingWorksheetActionTypes.ServicesListFetchSuccess;

  constructor(public payload: FeeTableBillItems) { }
}

export class GetAllCompaniesFetch implements Action {
  readonly type = BillingWorksheetActionTypes.GetAllCompaniesFetch;

  constructor() { }
}

export class GetAllCompaniesFetchSuccess implements Action {
  readonly type = BillingWorksheetActionTypes.GetAllCompaniesFetchSuccess;

  constructor(public payload: CompanyDO[]) { }
}

export type BillingWorksheetActions =
  InitFetch |
  InitFetchSuccess |
  FilteredClaimsFetch |
  FilteredClaimsFetchSuccess |
  SelectedStatusChanged |
  SelectedLocationChanged |
  SelectedDoctorChanged |
  DateRangeChanged |
  SelectedClaimIdChanged |
  LoadBookingsSubmit |
  GetItemsForBookingSubmit |
  GetItemsForBookingSubmitSuccess |
  UpdateHealthFundSubmit |
  UpdateHealthFundSubmitSuccess |
  AddNewServiceSubmit |
  AddNewServiceSubmitSuccess |
  DeleteServiceSubmit |
  DeleteServiceSubmitSuccess |
  DeleteWorkSheetClaim |
  DeleteWorkSheetClaimSuccess |
  SaveClaimSubmit |
  SaveClaimSubmitSuccess |
  ServicesListFetch |
  ServicesListFetchSuccess |
  GetAllCompaniesFetch |
  GetAllCompaniesFetchSuccess;
