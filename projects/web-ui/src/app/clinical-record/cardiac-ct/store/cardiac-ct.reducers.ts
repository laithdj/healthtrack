import * as _ from 'lodash';
import { alert } from 'devextreme/ui/dialog';
import { ClinicalRecordAppState } from '../../store/clinical-record.reducers';
import {
  LocationInfo,
  StaffDO,
  NormalisedResult,
  DateTimeDO,
  StaffUsedDO,
  CoronaryResultDO,
  GraftDO,
  ListItemDefinition,
} from '../../../../../../../Generated/CoreAPIClient';
import { CardiacCTActions, CardiacCTActionTypes } from './cardiac-ct.actions';
import { Segment } from '../../../shared/models/SegmentText';

export interface CardiacCTAppState extends ClinicalRecordAppState {
  // eslint-disable-next-line no-use-before-define
  'cardiacCTState': CardiacCTState;
}

export interface CardiacCTState {
  locations: LocationInfo[];
  staff: StaffDO[];
  duration: number;
  bmiDesc: string;
  containerId?: number | null;
  // eslint-disable-next-line camelcase
  patient_ID: number;
  testDate?: { dateTimeDO: DateTimeDO, date: Date } | null;
  dateCreated?: { dateTimeDO: DateTimeDO, date: Date } | null;
  recordSubCategory: number;
  generateResult?: CoronaryResultDO | null;
  cVersion: number;
  normalisedResults?: NormalisedResult[] | null;
  locationId: number;
  procedureEndDate: { dateTimeDO: DateTimeDO, date: Date };
  procedure?: number | null;
  heartRate?: number | null;
  bloodPressureSystolic?: number | null;
  bloodPressureDiastolic?: number | null;
  height?: number | null;
  weight?: number | null;
  bmi?: number | null;
  bsa?: number | null;
  bsaFormula?: number | null;
  staffUsed?: StaffUsedDO[] | null;
  indications?: number[] | null;
  indicationsDetails?: string | null;
  riskFactors?: number[] | null;
  riskFactorsDetails?: string | null;
  grafts?: GraftDO[] | null;
  deletedGrafts?: GraftDO[] | null;
  fullStructuredReport?: string | null;
  technicianNotes?: string | null;
  scannerModelList: ListItemDefinition[] | null,
  graftTypeList: ListItemDefinition[] | null,
  graftAnastamosisList: ListItemDefinition[] | null,
  graftSeverityList: ListItemDefinition[] | null,
  graftLocationList: ListItemDefinition[] | null,
  indicationsList: ListItemDefinition[] | null,
  riskFactorsList: ListItemDefinition[] | null
  segmentsDescription: Segment[];
}

const initialState: CardiacCTState = {
  locations: [],
  staff: [],
  patient_ID: 0,
  recordSubCategory: 0,
  cVersion: 0,
  locationId: 0,
  duration: 0,
  containerId: 0,
  staffUsed: [],
  indications: [],
  riskFactors: [],
  grafts: [],
  deletedGrafts: [],
  bmiDesc: '',
  procedureEndDate: { dateTimeDO: new DateTimeDO(), date: new Date() },
  dateCreated: { dateTimeDO: new DateTimeDO(), date: new Date() },
  testDate: { dateTimeDO: new DateTimeDO(), date: new Date() },
  scannerModelList: [],
  graftTypeList: [],
  graftAnastamosisList: [],
  graftSeverityList: [],
  graftLocationList: [],
  indicationsList: [],
  riskFactorsList: [],
  segmentsDescription: [],
};

export function cardiacCTReducers(state = initialState, action: CardiacCTActions): CardiacCTState {
  switch (action.type) {
    case CardiacCTActionTypes.InitFetchSuccess: {
      if (action.payload.record) {
        return {
          ...state,
          locations: [...action.payload.locations],
          containerId: action.payload.record.containerId,
          patient_ID: action.payload.record.patient_ID,
          testDate: action.payload.record.testDate ? {
            dateTimeDO: action.payload.record.testDate,
            date: new Date(action.payload.record.testDate.year,
              action.payload.record.testDate.month - 1,
              action.payload.record.testDate.day,
              action.payload.record.testDate.hours,
              action.payload.record.testDate.minutes),
          } : null,
          dateCreated: action.payload.record.dateCreated ? {
            dateTimeDO: action.payload.record.dateCreated,
            date: new Date(action.payload.record.dateCreated.year,
              action.payload.record.dateCreated.month - 1,
              action.payload.record.dateCreated.day,
              action.payload.record.dateCreated.hours,
              action.payload.record.dateCreated.minutes),
          } : null,
          recordSubCategory: action.payload.record.recordSubCategory,
          generateResult: action.payload.record.generateResult,
          cVersion: action.payload.record.cVersion,
          normalisedResults: [...action.payload.record.normalisedResults],
          locationId: action.payload.record.locationId,
          procedureEndDate: action.payload.record.procedureEndDate ? {
            dateTimeDO: action.payload.record.procedureEndDate,
            date: new Date(action.payload.record.procedureEndDate.year,
              action.payload.record.procedureEndDate.month - 1,
              action.payload.record.procedureEndDate.day,
              action.payload.record.procedureEndDate.hours,
              action.payload.record.procedureEndDate.minutes),
          } : null,
          procedure: action.payload.record.procedure,
          heartRate: action.payload.record.heartRate,
          bloodPressureSystolic: action.payload.record.bloodPressureSystolic,
          bloodPressureDiastolic: action.payload.record.bloodPressureDiastolic,
          height: action.payload.record.height,
          weight: action.payload.record.weight,
          bmi: action.payload.record.bmi,
          bsa: action.payload.record.bsa,
          bsaFormula: action.payload.record.bsaFormula,
          staffUsed: [...action.payload.record.staffUsed],
          indications: [...action.payload.record.indications],
          indicationsDetails: action.payload.record.indicationsDetails,
          riskFactors: [...action.payload.record.riskFactors],
          riskFactorsDetails: action.payload.record.riskFactorsDetails,
          grafts: [...action.payload.record.grafts],
          fullStructuredReport: action.payload.record.fullStructuredReport,
          technicianNotes: action.payload.record.technicianNotes,
        };
      }
        return {
          ...state,
          locations: [...action.payload.locations],
        patient_ID: action.payload.patient_ID,
        normalisedResults: [],
        };
      }

    case CardiacCTActionTypes.InitStaffFetchSuccess: {
      return {
        ...state,
        staff: [...action.payload],
      };
    }

    case CardiacCTActionTypes.UpdateRecord:
    case CardiacCTActionTypes.SaveResultsForRecordSuccess: {
      return {
        ...state,
        containerId: action.payload.containerId,
        patient_ID: action.payload.patient_ID,
        testDate: action.payload.testDate ? {
          dateTimeDO: action.payload.testDate,
          date: new Date(action.payload.testDate.year, action.payload.testDate.month - 1,
            action.payload.testDate.day, action.payload.testDate.hours, action.payload.testDate.minutes),
        } : null,
        dateCreated: action.payload.dateCreated ? {
          dateTimeDO: action.payload.dateCreated,
          date: new Date(action.payload.dateCreated.year, action.payload.dateCreated.month - 1,
            action.payload.dateCreated.day, action.payload.dateCreated.hours, action.payload.dateCreated.minutes),
        } : null,
        recordSubCategory: action.payload.recordSubCategory,
        generateResult: action.payload.generateResult,
        cVersion: action.payload.cVersion,
        normalisedResults: [...action.payload.normalisedResults],
        locationId: action.payload.locationId,
        procedureEndDate: action.payload.procedureEndDate ? {
          dateTimeDO: action.payload.procedureEndDate,
          date: new Date(action.payload.procedureEndDate.year,
            action.payload.procedureEndDate.month - 1,
            action.payload.procedureEndDate.day,
            action.payload.procedureEndDate.hours,
            action.payload.procedureEndDate.minutes),
        } : null,
        procedure: action.payload.procedure,
        heartRate: action.payload.heartRate,
        bloodPressureSystolic: action.payload.bloodPressureSystolic,
        bloodPressureDiastolic: action.payload.bloodPressureDiastolic,
        height: action.payload.height,
        weight: action.payload.weight,
        bmi: action.payload.bmi,
        bsa: action.payload.bsa,
        bsaFormula: action.payload.bsaFormula,
        staffUsed: [...action.payload.staffUsed],
        indications: [...action.payload.indications],
        indicationsDetails: action.payload.indicationsDetails,
        riskFactors: [...action.payload.riskFactors],
        riskFactorsDetails: action.payload.riskFactorsDetails,
        grafts: [...action.payload.grafts],
        fullStructuredReport: action.payload.fullStructuredReport,
        technicianNotes: action.payload.technicianNotes,
      };
    }

    case CardiacCTActionTypes.UpdateNormalisedResult: {
      const results = _.cloneDeep(state.normalisedResults);
      const resultIdx = results.findIndex((item) => item.hmsReferenceId === action.payload.referenceId);
      let normResult: NormalisedResult;

      if (resultIdx === -1) {
        normResult = new NormalisedResult();
        normResult.hmsReferenceId = action.payload.referenceId;
        normResult.resultType = action.payload.resultType;
        normResult.resultId = null;
        normResult.isModified = false;
        normResult.result = action.payload.result;
        normResult.displayValue = action.payload.displayValue;
        results.push(normResult);
      } else {
        //updating state property
        const currentResult = results[resultIdx];
        normResult = new NormalisedResult();
        normResult.hmsReferenceId = currentResult.hmsReferenceId;
        normResult.resultId = currentResult.resultId;
        normResult.resultType = action.payload.resultType;
        normResult.isModified = true;
        normResult.result = action.payload.result;
        normResult.displayValue = (currentResult.displayValue
          && !action.payload.displayValue) ? currentResult.displayValue : action.payload.displayValue;
        normResult.description = action.payload.description;
        results[resultIdx] = normResult;
      }
      return {
        ...state,
        normalisedResults: [...results],
      };
    }
    case CardiacCTActionTypes.RemoveNormalisedResult: {
      const results = _.cloneDeep(state.normalisedResults);
      const resultIdx = results.findIndex((item) => item.hmsReferenceId === action.payload);

      if (resultIdx > -1) {
        results.splice(resultIdx, 1);
      }
      return {
        ...state,
        normalisedResults: [...results],
      };
    }
    case CardiacCTActionTypes.RemoveNormalisedResult: {
      const results = state.normalisedResults;
      const resultIdx = results.findIndex(item => item.hmsReferenceId === action.payload);

      if (resultIdx > -1) {
        results.splice(resultIdx , 1);
      } 
      return {
        ...state,
        normalisedResults: [...results]
      };
    }

    case CardiacCTActionTypes.TestDateChanged: {
      const tDate: { dateTimeDO: DateTimeDO, date: Date } = { dateTimeDO: action.payload, date: new Date() };

      if (action.payload) {
        tDate.date = new Date(action.payload.year, action.payload.month - 1,
          action.payload.day, action.payload.hours, action.payload.minutes);
      }

      return {
        ...state,
        testDate: tDate,
      };
    }

    case CardiacCTActionTypes.ProcedureDateChanged: {
      const pDate: { dateTimeDO: DateTimeDO, date: Date } = { dateTimeDO: action.payload, date: new Date() };

      if (action.payload) {
        pDate.date = new Date(action.payload.year, action.payload.month - 1,
          action.payload.day, action.payload.hours, action.payload.minutes);
      }

      return {
        ...state,
        procedureEndDate: pDate,
      };
    }

    case CardiacCTActionTypes.BloodPressureChanged: {
      if (action.payload.type === 'systolic') {
        return {
          ...state,
          bloodPressureSystolic: action.payload.value,
        };
      }
        return {
          ...state,
        bloodPressureDiastolic: action.payload.value,
        };
      }

    case CardiacCTActionTypes.HeartRateChanged: {
      return {
        ...state,
        heartRate: action.payload,
      };
    }

    case CardiacCTActionTypes.InternalNotesChanged: {
      return {
        ...state,
        technicianNotes: action.payload,
      };
    }

    case CardiacCTActionTypes.HeightChanged: {
      return {
        ...state,
        height: action.payload,
      };
    }

    case CardiacCTActionTypes.ConvertToCentimetersSuccess: {
      return {
        ...state,
        height: action.payload,
      };
    }

    case CardiacCTActionTypes.CalculateBMISuccess: {
      return {
        ...state,
        bmi: action.payload,
      };
    }

    case CardiacCTActionTypes.FetchBMIDescSuccess: {
      return {
        ...state,
        bmiDesc: action.payload,
      };
    }

    case CardiacCTActionTypes.DurationChanged: {
      return {
        ...state,
        duration: action.payload,
      };
    }

    case CardiacCTActionTypes.CalculateBSASuccess: {
      return {
        ...state,
        bsa: action.payload,
      };
    }

    case CardiacCTActionTypes.ConvertToGramsSuccess: {
      return {
        ...state,
        weight: action.payload,
      };
    }
    case CardiacCTActionTypes.InitListFetchSuccess: {
      return {
        ...state,
        scannerModelList: action.payload.scannerModel,
        graftTypeList: action.payload.graftType,
        graftAnastamosisList: action.payload.graftAnastamosis,
        graftSeverityList: action.payload.graftSeverity,
        graftLocationList: action.payload.graftLocation,
        indicationsList: action.payload.indicationsList,
        riskFactorsList: action.payload.riskFactorsList,
      };
    }

    case CardiacCTActionTypes.WeightChanged: {
      return {
        ...state,
        weight: action.payload,
      };
    }
    case CardiacCTActionTypes.GraftsChanged: {
      const grafts = [...state.grafts];
      const deleteGrafts = [...state.deletedGrafts];
      if (!action.payload) {
        const graft = new GraftDO();
        graft.comments = '';
        graft.containerId = state.containerId ? state.containerId : 0;
        grafts.push(graft);
      } else {
        const graftsIdx = action.payload.indx;
        grafts[graftsIdx] = action.payload.graft;
        if (action.payload.deleted) {
          const selectedGraft = _.cloneDeep(grafts[graftsIdx]);
          selectedGraft.deleted = true;
          grafts[graftsIdx] = selectedGraft;
          deleteGrafts.push(grafts[graftsIdx]);
          grafts.splice(graftsIdx, 1);
        }
      }
      return {
        ...state,
        grafts: [...grafts],
        deletedGrafts: [...deleteGrafts],
      };
    }
    case CardiacCTActionTypes.IndicationsChanged: {
      let { indications } = state;
      indications = action.payload;

      return {
        ...state,
        indications: [...indications],
      };
    }
    case CardiacCTActionTypes.IndicationsDetailsChanged: {
      let { indicationsDetails } = state;
      indicationsDetails = action.payload;

      return {
        ...state,
        indicationsDetails,
      };
    }
    case CardiacCTActionTypes.RiskFactorsDetailsChanged: {
      let { riskFactorsDetails } = state;
      riskFactorsDetails = action.payload;

      return {
        ...state,
        riskFactorsDetails,
      };
    }
    case CardiacCTActionTypes.RiskFactorsChanged: {
      let { riskFactors } = state;
      riskFactors = action.payload;

      return {
        ...state,
        riskFactors: [...riskFactors],
      };
    }
    case CardiacCTActionTypes.CoronaryDescription: {
      const segments = state.segmentsDescription.map(
        (i) => ({ ...i }),
      );
      const segmentIdx = segments.findIndex((item) => item.refId === action.payload.refId);
      let segment: Segment = new Segment();
      if ((segmentIdx === -1) && (action.payload.text)) {
        segment.refId = action.payload.refId;
        segment.text = action.payload.text;
        segment.reason = action.payload.reason;
        segments.push(segment);
      } else if ((segmentIdx > -1) && (!action.payload.text)) {
        segments.splice(segmentIdx, 1);
      } else if (segmentIdx > -1) {
        segment = segments[segmentIdx];
        segments[segmentIdx].text = action.payload.text;
        segments[segmentIdx] = segment;
      }
      if (action.payload.value === 0) {
        segments.splice(segmentIdx, 1);
      }
      return {
        ...state,
        segmentsDescription: [...segments],
      };
    }
    case CardiacCTActionTypes.HospitalSiteChange: {
      return {
        ...state,
        locationId: action.payload,
      };
    }

    case CardiacCTActionTypes.StaffChanged: {
      const indx = state.staffUsed.findIndex((s) => s.staffId === action.payload.staffId);
      const staffInUse = _.cloneDeep(state.staffUsed);

      if (indx === -1) {
        const staffIdx = state.staff.findIndex((s) => s.staffId === action.payload.staffId);

        if (staffIdx > -1) {
          const staff = new StaffUsedDO();
          const selectedStaff = _.cloneDeep(state.staff[staffIdx]);
          staff.staffId = action.payload.staffId;
          staff.staffUsedId = action.payload.staffId;
          staff.cVersion = state.cVersion;
          staff.containerId = state.containerId;
          staff.roleText = action.payload.roleText;
          staff.staffName = selectedStaff.staffName;
          staff.staffRoleId = selectedStaff.staffRoles.find((s) => s.roleName === action.payload.roleText).roleId;
          const usedRole = state.staffUsed.findIndex((s) => s.staffRoleId === staff.staffRoleId);
          if (usedRole > -1) {
            staffInUse[usedRole] = staff;
          } else {
            staffInUse.push(staff);
          }
        }
      } else {
        alert('The selected Staff Member is already in use.', 'Attention');
      }

      return {
        ...state,
        staffUsed: [...staffInUse],
      };
    }

    default:
      return state;
  }
}
