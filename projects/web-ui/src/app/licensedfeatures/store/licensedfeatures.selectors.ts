import { createSelector, createFeatureSelector } from '@ngrx/store';
import { LicensedFeatureState } from './licensedfeatures.reducers';

export const selectLicensedFeatureState = createFeatureSelector<LicensedFeatureState>('licensedFeatureState');

export const licensedFeaturesSelector = createSelector(
  selectLicensedFeatureState,
  (licensedfeatures) => licensedfeatures.features?.filter((f) => f.quantity > 0),
);

export const selectedFeatureSelector = createSelector(
  selectLicensedFeatureState,
  (licensedfeatures) => licensedfeatures.selectedFeature,
);

export const editingDeviceSelector = createSelector(
  selectLicensedFeatureState,
  (licensedfeatures) => licensedfeatures.editingDevice,
);

export const worklistDevicesSelector = createSelector(
  selectLicensedFeatureState,
  (licensedfeatures) => licensedfeatures.worklistDevices,
);

export const selectedBookingTypesSelector = createSelector(
  selectLicensedFeatureState,
  (licensedfeatures) => licensedfeatures.selectedBookingTypes,
);

export const selectedLocationRoomsSelector = createSelector(
  selectLicensedFeatureState,
  (licensedfeatures) => licensedfeatures.selectedLocationRooms,
);

export const dicomWorklistSelector = createSelector(
  selectLicensedFeatureState,
  (licensedfeatures) => licensedfeatures.dicomWorklist,
);

export const showDicomWorklistSelector = createSelector(
  selectLicensedFeatureState,
  (licensedfeatures) => licensedfeatures.showDicomWorklist,
);

export const modalityListSelector = createSelector(
  selectLicensedFeatureState,
  (licensedfeatures) => licensedfeatures.modalityList,
);
