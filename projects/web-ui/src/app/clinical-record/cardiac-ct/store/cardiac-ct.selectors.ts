import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StaffUsedDO, ListItemDefinition } from '../../../../../../../Generated/CoreAPIClient';
import { CardiacCTState } from './cardiac-ct.reducers';

export const selectCardiacCTFeatureState = createFeatureSelector<CardiacCTState>('cardiacCTState');

export const selectCardiacCTLocations = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.locations,
);

export const selectCardiacCTStaff = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.staff,
);
export const selectCardiacCTStaffUsed = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.staffUsed,
);

export const selectCardiacCTNormalisedResults = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.normalisedResults,
);

export const selectCardiacCTPatientId = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.patient_ID,
);

export const selectCardiacCTContainerId = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.containerId,
);

export const selectCardiacCTTestDate = createSelector(
  selectCardiacCTFeatureState,
  (state) => (state.testDate ? state.testDate.date : new Date()),
);

export const selectCardiacCTDuration = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.duration,
);

export const selectCardiacCTProcedureEndDate = createSelector(
  selectCardiacCTFeatureState,
  (state) => {
    if (state.testDate && state.procedureEndDate) {
      return { start: state.testDate.date, end: state.procedureEndDate.date };
    }
    return { start: new Date(), end: new Date() };
  },
);

export const selectCardiacCTNormalizedResult = (refId: number) => createSelector(
  selectCardiacCTFeatureState,
  (state) => state.normalisedResults.find((a) => a.hmsReferenceId === refId),
);

export const selectCardiacCTIndications = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.indications,
);

export const selectCardiacCTGrafts = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.grafts.filter((pp) => !pp.deleted),
);

export const selectCardiacCTIndicationsDetails = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.indicationsDetails,
);
export const selectCardiacCTIndicationsList = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.indicationsList,
);
export const selectCardiacCTRiskFactorsList = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.riskFactorsList,
);

export const selectCardiacCTIndicationsListGrid = createSelector(
  selectCardiacCTFeatureState,
  (state) => {
    const array: ListItemDefinition[] = [];
    state.indications.forEach((c) => {
      if (state.indicationsList) {
        const selected = state.indicationsList.find((a) => a.list_ID === c);
        if (selected) {
          array.push(selected);
        }
      }
    });
    return array;
  },
);

export const selectCardiacCTRiskFactorsListGrid = createSelector(
  selectCardiacCTFeatureState,
  (state) => {
    const array: ListItemDefinition[] = [];
    state.riskFactors.forEach((c) => {
      if (state.riskFactorsList) {
        const selected = state.riskFactorsList.find((a) => a.list_ID === c);
        if (selected) {
          array.push(selected);
        }
      }
    });
    return array;
  },
);

export const selectCardiacCTRiskFactors = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.riskFactors,
);

export const selectCardiacCTRiskFactorsDetails = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.riskFactorsDetails,
);

export const selectCardiacCTHospitalLocation = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.locationId,
);

export const selectCardiacCTTechnicianNotes = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.technicianNotes,
);

export const selectCardiacCTHeight = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.height,
);

export const selectCardiacCTWeight = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.weight,
);

export const selectCardiacCTBmiDesc = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.bmiDesc,
);

export const selectCardiacCTBmiValues = createSelector(
  selectCardiacCTFeatureState,
  (state) => ({ height: state.height, weight: state.weight }),
);

export const selectCardiacCTBMI = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.bmi,
);

export const selectCardiacCTBSA = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.bsa,
);

export const selectCardiacCTHeartRate = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.heartRate,
);

export const selectCardiacCTBloodPressureSystolic = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.bloodPressureSystolic,
);

export const selectCardiacCTBloodPressureDiastolic = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.bloodPressureDiastolic,
);

export const selectCardiacCTScannerList = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.scannerModelList,
);

export const selectCardiacCTGraftTypeList = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.graftTypeList,
);

export const selectCardiacCTGraftAnastamosisList = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.graftAnastamosisList,
);

export const selectCardiacCTSeverityList = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.graftSeverityList,
);

export const selectCardiacCTGraftLocationList = createSelector(
  selectCardiacCTFeatureState,
  (state) => state.graftLocationList,
);

export const selectCardiacCTStaffByRoleName = (roleName: string) => createSelector(
  selectCardiacCTFeatureState,
  (state) => state.staff.filter((a) => a.staffRoles.some((r) => r.roleName === roleName))
    .filter((a) => a.staffRoles.some((r) => r.defaultLocation === state.locationId || r.defaultLocation === 0)),
);

export const selectCardiacCTStaffId = (roleName: string) => createSelector(
  selectCardiacCTFeatureState,
  (state) => {
    if (state.staffUsed?.length > 0) {
      let staffSelected = new StaffUsedDO();
      staffSelected = state.staffUsed.find((a) => a.roleText === roleName);
      if (staffSelected) {
        return state.staffUsed.find((a) => a.roleText === roleName).staffId;
      }
    }
    return undefined;
  },
);
