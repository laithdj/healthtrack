import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EchocardiogramState } from './echocardiogram.reducers';

export const selectEchocardiogramFeatureState = createFeatureSelector<EchocardiogramState>('echocardiogramState');

// export const selectSmartText = createSelector(
//   selectEchocardiogramFeatureState,
//   appState => appState.smartText
// );

// export const selectSmartTextTemplate = createSelector(
//   selectEchocardiogramFeatureState,
//   appState => appState.smartTextTemplate
// );

export const selectEchocardiogramMeasurements = createSelector(
  selectEchocardiogramFeatureState,
  state => state.echocardiogramMeasurements
);

export const selectSimpleMeasurements = createSelector(
  selectEchocardiogramFeatureState,
  state => state.simpleMeasurements
);

export const selectClinicalRecordData = createSelector(
  selectEchocardiogramFeatureState,
  state => state.clinicalRecordData
);

export const selectLVDiastole = createSelector(
  selectEchocardiogramFeatureState,
  state => state.lvDiastole
);

export const selectLVSystole = createSelector(
  selectEchocardiogramFeatureState,
  state => state.lvSystole
);

export const selectLVDiastoleIndex = createSelector(
  selectEchocardiogramFeatureState,
  state => state.lvDiastoleIndex
);

export const selectLVDiastoleHeight = createSelector(
  selectEchocardiogramFeatureState,
  state => state.lvDiastoleHeight
);

export const selectLVSystoleIndex = createSelector(
  selectEchocardiogramFeatureState,
  state => state.lvSystoleIndex
);

export const selectIVSeptum = createSelector(
  selectEchocardiogramFeatureState,
  state => state.ivSeptum
);

export const selectInferolateralWall = createSelector(
  selectEchocardiogramFeatureState,
  state => state.inferolateralWall
);

export const selectRVDiastole = createSelector(
  selectEchocardiogramFeatureState,
  state => state.rvDiastole
);

export const selectTAPSE = createSelector(
  selectEchocardiogramFeatureState,
  state => state.TAPSE
);

export const selectAorticRoot = createSelector(
  selectEchocardiogramFeatureState,
  state => state.aorticRoot
);

export const selectAscAorta = createSelector(
  selectEchocardiogramFeatureState,
  state => state.ascAorta
);

export const selectLeftAtrium = createSelector(
  selectEchocardiogramFeatureState,
  state => state.leftAtrium
);

export const selectLeftAtriumIndex = createSelector(
  selectEchocardiogramFeatureState,
  state => state.leftAtriumIndex
);

export const selectEjectionFraction = createSelector(
  selectEchocardiogramFeatureState,
  state => state.ejectionFraction
);

export const selectEFCorrected = createSelector(
  selectEchocardiogramFeatureState,
  state => state.efCorrected
);

export const selectFractionalShortening = createSelector(
  selectEchocardiogramFeatureState,
  state => state.fractionalShortening
);

export const selectLVMass = createSelector(
  selectEchocardiogramFeatureState,
  state => state.lvMass
);

export const selectRWT = createSelector(
  selectEchocardiogramFeatureState,
  state => state.RWT
);

