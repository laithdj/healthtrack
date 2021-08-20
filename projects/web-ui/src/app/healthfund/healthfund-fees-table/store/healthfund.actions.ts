import { Action } from '@ngrx/store';
import {  BillItemHealthFundFee, FeeTableBillItems } from '../../../../../../../Generated/CoreAPIClient';

export enum HealthFundActionTypes {
  FetchServices = 'FetchServices',
  FetchServicesSuccess = 'FetchServicesSuccess',
}

export class FetchServices implements Action {
  readonly type = HealthFundActionTypes.FetchServices;

  constructor() { }
}

export class FetchServicesSuccess implements Action {
  readonly type = HealthFundActionTypes.FetchServicesSuccess;

  constructor(public payload: FeeTableBillItems) { }
}

export type HealthFundActions = FetchServices | FetchServicesSuccess;

