import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as _ from 'lodash';
import { ClinicalRecordState } from './clinical-record.reducers';
import { SmartTextType, HeaderStyle, SmartTextNode } from '../../../../../../Generated/CoreAPIClient';
import { CardiacCTState } from '../cardiac-ct/store/cardiac-ct.reducers';

export const selectClinicalRecordFeatureState = createFeatureSelector<ClinicalRecordState>('clinicalRecordState');

export const selectCardiacCTFeatureState = createFeatureSelector<CardiacCTState>('cardiacCTState');

export const selectShowReportBeside = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.showReportBeside,
);

export const selectReport = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.report,
);

export const selectReportContent = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.report?.fullStructuredReport,
);

export const selectDefinition = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.definition,
);

export const selectSmartTextBundle = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.smartTextBundle,
);

export const selectReferenceIdList = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.referenceIdList,
);

export const selectSmartTextStyleProperties = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.smartTextBundle?.styleProperties,
);

export const selectSmartTextTemplates = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.smartTextBundle?.templates,
);
export const selectAllSmartTextList = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.smartTextBundle?.smartTextPackage?.smartTextNodes,
);

export const selectSmartTextNode = (navId: number) => createSelector(
  selectClinicalRecordFeatureState,
  (state) => state.smartTextBundle?.smartTextPackage?.smartTextNodes?.find((a) => a.navID === navId),
);

export const selectSmartTextNodeList = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => {
    const temp = new SmartTextNode();
    temp.navID = 0;
    temp.parentID = -1;
    temp.shortDescription = '-- TEMPLATES --';
    temp.nodeText = '-- TEMPLATES --';
    temp.displayOrder = 0;

    const meas = new SmartTextNode();

    for (let index = 1; index < appState.smartTextBundle?.smartTextPackage?.smartTextNodes?.length + 2; index++) {
      if (!appState.smartTextBundle?.smartTextPackage?.smartTextNodes?.some((a) => a.navID === index)) {
        meas.navID = index;
        meas.parentID = -1;
        meas.shortDescription = '-- MEASUREMENTS --';
        meas.nodeText = '-- MEASUREMENTS --';
        meas.displayOrder = 0;

        break;
      }
    }

    const parentId = appState.smartTextBundle?.smartTextPackage?.smartTextNodes
      .find((a) => a.navID > 0 && a.parentID === -1);

    if (parentId) {
      const list = _.cloneDeep(appState.smartTextBundle?.smartTextPackage?.smartTextNodes)
        .filter((a) => a.parentID > 0 && a.nodeType !== SmartTextType.SmartText && (a.styleID === HeaderStyle.Header1
          || a.styleID === HeaderStyle.Header2 || a.styleID === HeaderStyle.Header3
          || a.styleID === HeaderStyle.Invisible));
      list.forEach((a) => {
        a.parentID = (a.parentID === parentId.navID) ? -1 : a.parentID;
        return a;
      });
      list.unshift(meas);
      list.unshift(temp);
      return list;
    }
    const list = _.cloneDeep(appState.smartTextBundle?.smartTextPackage?.smartTextNodes);
    return list.concat([temp, meas]);
  },
);

export const selectSmartTextNodeListWithoutTemplates = createSelector(
  selectSmartTextNodeList,
  (list) => list.filter((a) => a.navID > 0),
);

export const selectSmartTextList = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.smartTextBundle?.smartTextPackage?.smartTextNodes,
);

export const selectPatient = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.patient,
);

export const selectPatientSex = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.patient.sex,
);

export const selectSmartTextPackage = createSelector(
  selectClinicalRecordFeatureState,
  (appState) => appState.smartTextBundle.smartTextPackage,
);

// export const selectSmartTextChildrenForNavId = (parentId: number) => createSelector(
//   selectSmartTextList,
//   list => {
//     const result = _.cloneDeep(list.filter(a => a.navID === parentId || a.parentID === parentId));
//     const idx = result.findIndex(a => a.navID === parentId);
//     result[idx].parentID = -1;
//     // recursively find all children in list
//     let newAdded = true;
//     let added: SmartTextNode[] = _.cloneDeep(result);
//     let add: SmartTextNode[] = [];
//     console.log('results', result);

//     while (newAdded === true) {
//       added.forEach(st => {
//         // const children = selectSmartTextChildrenForNavId(st.navID);
//         const children = _.cloneDeep(list.filter(a => a.parentID === st.navID
// && !result.some(b => b.navID === a.navID)));
//         console.log('children', children);
//         console.log('add', add);
//         if (children && children.length > 0) {
//           add.concat(children);
//           console.log('children2', children);
//         console.log('add2', add);
//         }
//       });

//         console.log('add3', add);
//       if (add.length === 0) {
//         newAdded = false;
//       }

//       added = _.cloneDeep(add);
//       result.concat(add);
//       add = [];
//     }

//     return result;
//   }
// );

export const selectNormalizedResultByRefId = (refId: number) => createSelector(
  selectCardiacCTFeatureState,
  (state) => {
    const result = state.normalisedResults.find((a) => a.hmsReferenceId === refId);
    return result;
  },
);

export const selectSegmentByRefId = (refId: number[]) => createSelector(
  selectCardiacCTFeatureState,
  (state) => {
    let p = '';
    refId.forEach((ref) => {
      const indx = state.segmentsDescription.find((a) => a.refId === ref);
      if (indx) {
        if (indx.reason) {
          p = `${p} ${indx.text} `;
          /*
          if (p.search(',') === -1) {
            p = p + ' ' + indx.text + '.';
          } else {
          p = p + ' , ' + indx.text;
        }
        */
        } else if (p.length > 1) {
          p = `${p} ; ${indx.text}`;
        } else {
          p = `${p} ${indx.text}`;
        }
      }
    });
    return p;
  },
);
