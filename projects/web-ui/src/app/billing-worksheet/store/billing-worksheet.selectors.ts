import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import { BillingWorksheetState } from './billing-worksheet.reducers';
import { WorksheetClaimStatus } from '../../../../../../Generated/CoreAPIClient';

export const selectBillingWorksheetFeatureState = createFeatureSelector<BillingWorksheetState>('billingWorksheetState');

export const selectBillingWorksheetState = createSelector(
  selectBillingWorksheetFeatureState,
  (appState) => appState,
);

export const selectDoctors = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.doctors,
);

export const selectDoctorsByLocation = createSelector(
  selectBillingWorksheetState,
  (bwState) => ((bwState.selectedLocation === 0) ? bwState.doctors
    : bwState.doctors.filter((d) => d.defaultLocation === 0 || d.defaultLocation === bwState.selectedLocation)),
);

export const selectWorksheetItems = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.worksheetItems,
);

export const selectWorksheetItemsByStatus = createSelector(
  selectBillingWorksheetState,
  (bwState) => ((bwState.selectedStatus === WorksheetClaimStatus.Unknown)
    ? bwState.worksheetItems.filter((a) => a.status !== WorksheetClaimStatus.Complete)
    : bwState.worksheetItems.filter((b) => b.status === bwState.selectedStatus)),
);

export const selectWorksheetItemsByClaimId = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.worksheetItems.filter((b) => b.claimId === bwState.selectedClaimId),
);

export const selectStatuses = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.statuses,
);

export const selectSelectedLocation = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.selectedLocation,
);

export const selectSelectedDoctor = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.selectedDoctor,
);

export const selectSelectedStatus = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.selectedStatus,
);

export const selectFromDate = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.fromDate,
);

export const selectToDate = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.toDate,
);

export const selectLocations = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.locations,
);

export const selectSelectedClaimId = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.selectedClaimId,
);

export const selectServicesList = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.servicesList,
);

export const selectCompanies = createSelector(
  selectBillingWorksheetState,
  (bwState) => bwState.companies,
);

export const selectServicesListForFeeTable = (feeTableId?: number) => createSelector(
  selectBillingWorksheetState,
  (bwState) => {
    if (feeTableId && feeTableId > 0) {
      return bwState.servicesList.filter((a) => a.feeTableId === feeTableId);
    }
    return bwState.servicesList.filter((a) => !a.feeTableId);
  },
);
