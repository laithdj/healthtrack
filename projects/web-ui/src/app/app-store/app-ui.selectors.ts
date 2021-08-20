import { createSelector } from '@ngrx/store';
import { AppState } from './reducers';

export const selectAppUiState = (state: AppState) => state.appUiState;

export const selectEditMode = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.editMode,
);

export const selectUserName = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.username,
);

export const selectUserPkId = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.userPkId,
);

export const isAuthenticated = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.authenticated,
);

export const selectToken = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.token,
);

export const selectLoading = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.loading,
);

export const selectRequestedUrl = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.requestedUrl,
);

export const selectAlertPopup = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.alertPopup,
);

export const selectbaseApiUrl = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.baseHealthTrackApiUrl,
);

export const selectLastBillingLocation = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.lastBillingLocation,
);

export const selectDashboard = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.dashboardId,
);

export const selectRole = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.role,
);

export const selectLicenseUserId = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.licenseUserId,
);

export const selectDoctorId = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.doctorId,
);

export const selectDoctorDisplayName = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.doctorDisplayName,
);

export const selectUserDisplayName = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.userDisplayName,
);

export const selectInAdminMode = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.inAdminMode,
);

export const selectLog = createSelector(
  selectAppUiState,
  (appUiState) => appUiState.log,
);
