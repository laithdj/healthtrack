import { Action } from '@ngrx/store';
import { RecordClassification } from '../../../../../../Generated/CoreAPIClient';

export const ADD_CLASSIFICATIONS = 'ADD_CLASSIFICATIONS';
export const UPDATE_CLASSIFICATION = 'UPDATE_CLASSIFICATION';
export const REPLACE_CLASSIFICATIONS = 'REPLACE_CLASSIFICATIONS';
export const POPULATE_USER_GROUPS = 'POPULATE_USER_GROUPS';
export const POPULATE_BILLING_GROUPS = 'POPULATE_BILLING_GROUPS';

export class AddClassifications implements Action {
  payload: RecordClassification[];
  readonly type = ADD_CLASSIFICATIONS;
  constructor(public classifications: RecordClassification[]) {
    this.payload = classifications;
  }
}

export class ReplaceClassifications implements Action {
  payload: RecordClassification[];
  readonly type = REPLACE_CLASSIFICATIONS;
  constructor(public classifications: RecordClassification[]) {
    this.payload = classifications;
  }
}

export class UpdateClassification implements Action {
  payload: RecordClassification;
  readonly type = UPDATE_CLASSIFICATION;
  constructor(public recordClassification: RecordClassification) {
    this.payload = recordClassification;
  }
}

export class PopulateUserGroups implements Action {
  readonly type = 'POPULATE_USER_GROUPS';

  constructor(public payload: string[]) {}
}

export class PopulateBillingGroups implements Action {
  readonly type = POPULATE_BILLING_GROUPS;

  constructor(public payload: string[]) {}
}

export type ClassificationActions = AddClassifications | UpdateClassification | ReplaceClassifications | PopulateUserGroups | PopulateBillingGroups;
