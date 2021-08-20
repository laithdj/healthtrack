import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RecordClassificationState } from './classification.reducers';

export const selectRecordClassificationState = createFeatureSelector<RecordClassificationState>('classifications');

export const selectClassifications = createSelector(
  selectRecordClassificationState,
  state => state.classifications
  );

  export const selectUserGroups = createSelector(
    selectRecordClassificationState,
    state => state.userGroups
  );

  export const selectBillingGroups = createSelector(
    selectRecordClassificationState,
    state => state.billingGroups
  );
