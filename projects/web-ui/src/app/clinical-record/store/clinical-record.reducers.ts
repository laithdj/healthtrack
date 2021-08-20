import * as _ from 'lodash';
import { AppState } from '../../app-store/reducers';
import {
  ClinicalRecordActions,
  ClinicalRecordActionTypes,
} from './clinical-record.actions';
import { ClinicalRecordDefinition } from '../shared/clinical-record-models';
import {
  Patient,
  FullStructuredReportDO,
  ReferenceIDDO,
  SmartTextBundle,
} from '../../../../../../Generated/CoreAPIClient';

export interface ClinicalRecordAppState extends AppState {
  // eslint-disable-next-line no-use-before-define
  'clinicalRecordState': ClinicalRecordState;
}

export interface ClinicalRecordState {
  definition?: ClinicalRecordDefinition;
  patient?: Patient;
  smartTextBundle?: SmartTextBundle;
  showReportBeside: boolean;
  report: FullStructuredReportDO;
  referenceIdList: ReferenceIDDO[];
}

const initialState: ClinicalRecordState = {
  report: new FullStructuredReportDO(),
  showReportBeside: false,
  referenceIdList: [],
};

export function clinicalRecordReducers(state = initialState, action: ClinicalRecordActions): ClinicalRecordState {
  switch (action.type) {
    case ClinicalRecordActionTypes.ClinicalRecordInit: {
      return {
        ...state,
        patient: action.payload.patient,
        definition: action.payload.definition,
      };
    }

    case ClinicalRecordActionTypes.SmartTextInitFetchSuccess: {
      return {
        ...state,
        smartTextBundle: action.payload,
      };
    }

    case ClinicalRecordActionTypes.SmartTextBundleFetchSuccess: {
      return {
        ...state,
        smartTextBundle: action.payload,
      };
    }

    case ClinicalRecordActionTypes.SmartTextTemplateListSaveSuccess: {
      const bundle = _.cloneDeep(state.smartTextBundle);
      const templates = [...bundle.templates];

      if (templates?.length > 0) {
        for (let index = 0; index < templates.length; index++) {
          const tdoIndex = action.payload.findIndex((a) => a.templateId === templates[index]?.templateId);
          if (tdoIndex > -1) {
            templates[index].displayOrder = action.payload[tdoIndex].displayOrder;
          }
        }
      }

      bundle.templates = [...templates];

      return {
        ...state,
        smartTextBundle: bundle,
      };
    }

    case ClinicalRecordActionTypes.SmartTextTemplateSaveSuccess: {
      const bundle = _.cloneDeep(state.smartTextBundle);
      const templates = [...bundle.templates];

      if (templates && templates.some((a) => a.templateId === action.payload.templateId)) {
        // exists already and has been updated
        const index = templates.findIndex((a) => a.templateId === action.payload.templateId);
        templates[index] = action.payload;
      } else {
        // is a new template to be added
        templates.unshift(action.payload);
      }

      bundle.templates = [...templates];

      return {
        ...state,
        smartTextBundle: bundle,
      };
    }

    case ClinicalRecordActionTypes.SmartTextTemplateDeleteSuccess: {
      const bundle = _.cloneDeep(state.smartTextBundle);
      const templates = [...bundle.templates];
      const deleteIdx = templates.findIndex((a) => a.templateId === action.payload.templateId);

      if (deleteIdx > -1) {
        templates.splice(deleteIdx, 1);
      }

      bundle.templates = [...templates];

      return {
        ...state,
        smartTextBundle: bundle,
      };
    }

    case ClinicalRecordActionTypes.SmartTextPackageSaveSuccess: {
      // const bundle = _.cloneDeep(state.smartTextBundle);
      // const list = bundle?.smartTextPackage?.smartTextNodes ? [...bundle.smartTextPackage.smartTextNodes] : [];

      // if (list.some((a) => a.navID === action.payload.navID)) {
      //   // exists already and has been updated
      //   const index = list.findIndex((a) => a.navID === action.payload.navID);
      //   list[index] = action.payload;
      // } else {
      //   // is a new template to be added
      //   list.push(action.payload);
      // }

      // bundle.smartTextPackage.smartTextNodes = [...list];

      return {
        ...state,
        smartTextBundle: action.payload,
      };
    }

    // case ClinicalRecordActionTypes.SmartTextDeleteSuccess: {
    //   const bundle = _.cloneDeep(state.smartTextBundle);
    //   // remove deleted nodes from list
    //   const list = bundle.smartTextPackage.smartTextNodes.filter(
    //     (a) => !action.payload.navIdsDeleted.some((b) => b === a.navID));

    //   // update nodes that were changed (display order updated because of deleted nodes)
    //   action.payload.smartTextNodesUpdated.forEach((updatedNode) => {
    //     const idx = list.findIndex((a) => a.navID === updatedNode.navID);
    //     if (idx > -1) {
    //       list[idx] = _.cloneDeep(updatedNode);
    //     }
    //   });

    //   bundle.smartTextPackage.smartTextNodes = [...list];

    //   return {
    //     ...state,
    //     smartTextBundle: bundle,
    //   };
    // }

    // case ClinicalRecordActionTypes.SmartTextListSaveSuccess: {
    //   const bundle = _.cloneDeep(state.smartTextBundle);
    //   const list = [...bundle.smartTextPackage.smartTextNodes];

    //   action.payload.forEach((smartText) => {
    //     const index = list.findIndex((a) => a.navID === smartText.navID);
    //     list[index] = _.cloneDeep(smartText);
    //   });

    //   bundle.smartTextPackage.smartTextNodes = list;

    //   return {
    //     ...state,
    //     smartTextBundle: bundle,
    //   };
    // }

    case ClinicalRecordActionTypes.ToggleShowReportBeside: {
      return {
        ...state,
        showReportBeside: action.payload,
      };
    }

    case ClinicalRecordActionTypes.SmartTextReportFetchSuccess: {
      return {
        ...state,
        report: action.payload,
      };
    }

    case ClinicalRecordActionTypes.ReportContentChanged: {
      const report = _.cloneDeep(state.report);
      report.fullStructuredReport = action.payload;

      return {
        ...state,
        report,
      };
    }

    case ClinicalRecordActionTypes.SmartTextReportSaveSuccess: {
      return {
        ...state,
        report: action.payload,
      };
    }

    case ClinicalRecordActionTypes.ReferenceIDListFetchSuccess: {
      return {
        ...state,
        referenceIdList: [...action.payload],
      };
    }

    default:
      return state;
  }
}
