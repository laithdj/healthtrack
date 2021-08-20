import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import * as _ from 'lodash';
import {
  APIResponseOfBoolean,
  APIResponseOfFullStructuredReportDO,
  APIResponseOfListOfReferenceIDDO,
  APIResponseOfListOfSmartTextTemplateDisplayOrder,
  APIResponseOfSmartTextBundle,
  APIResponseOfSmartTextTemplate,
  CardiacCTClient,
  SmartTextClient,
  SmartTextTemplateDisplayOrder,
} from '../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../app-store/app-ui-state.actions';
import { selectDoctorId } from '../../app-store/app-ui.selectors';
import {
  ClinicalRecordActionTypes,
  ClinicalRecordInit,
  ReferenceIDListFetch,
  ReferenceIDListFetchSuccess,
  SmartTextInitFetch,
  SmartTextInitFetchSuccess,
  SmartTextReportFetch,
  SmartTextReportFetchSuccess,
  SmartTextReportSave,
  SmartTextReportSaveSuccess,
  SmartTextPackageSave,
  SmartTextPackageSaveSuccess,
  SmartTextTemplateDelete,
  SmartTextTemplateDeleteSuccess,
  SmartTextTemplateListSave,
  SmartTextTemplateListSaveSuccess,
  SmartTextTemplateSave,
  SmartTextTemplateSaveSuccess,
  SmartTextBundleFetch,
  SmartTextBundleFetchSuccess,
} from './clinical-record.actions';
import { ClinicalRecordAppState } from './clinical-record.reducers';
import { selectDefinition, selectSmartTextTemplates } from './clinical-record.selectors';

@Injectable()
export class ClinicalRecordEffects {
  constructor(private actions$: Actions, private smartTextClient: SmartTextClient,
    private cardiacClient: CardiacCTClient, private store: Store<ClinicalRecordAppState>) { }

  @Effect()
  init$ = this.actions$.pipe(ofType<ClinicalRecordInit>(ClinicalRecordActionTypes.ClinicalRecordInit),
    map((action) => new SmartTextInitFetch(action.payload.definition)));

  @Effect()
  initFetch$ = this.actions$.pipe(ofType<SmartTextInitFetch>(ClinicalRecordActionTypes.SmartTextInitFetch),
    withLatestFrom(this.store.pipe(select(selectDoctorId))),
    switchMap(([action, doctorId]) => this.smartTextClient
      .smartTextInit(action.payload.formDisplay, action.payload.recordSubCategory, doctorId)
      .pipe(map((response: APIResponseOfSmartTextBundle) => {
        if (response && response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new SmartTextInitFetchSuccess(response.data);
      })),
    ));

  @Effect()
  fetchSmartTextBundle$ = this.actions$.pipe(
    ofType<SmartTextBundleFetch>(ClinicalRecordActionTypes.SmartTextBundleFetch),
    withLatestFrom(this.store.pipe(select(selectDoctorId)), this.store.pipe(select(selectDefinition))),
    switchMap(([, doctorId, definition]) => this.smartTextClient.smartTextInit(definition.formDisplay,
      definition.recordSubCategory, doctorId)
      .pipe(map((response: APIResponseOfSmartTextBundle) => {
        if (response && response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new SmartTextBundleFetchSuccess(response.data);
      })),
    ));

  @Effect()
  fetchSmartTextReport$ = this.actions$.pipe(
    ofType<SmartTextReportFetch>(ClinicalRecordActionTypes.SmartTextReportFetch),
    switchMap((action) => this.cardiacClient.fetchReportForRecord(action.payload.containerId, action.payload.cVersion)
      .pipe(map((response: APIResponseOfFullStructuredReportDO) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new SmartTextReportFetchSuccess(response.data);
      })),
    ));

  @Effect()
  saveSmartTextReport$ = this.actions$.pipe(ofType<SmartTextReportSave>(ClinicalRecordActionTypes.SmartTextReportSave),
    switchMap((action) => this.cardiacClient.saveReportForRecord(action.payload)
      .pipe(map((response: APIResponseOfFullStructuredReportDO) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }

        return new SmartTextReportSaveSuccess(response.data);
      })),
    ));

  @Effect()
  saveSmartTextTemplate$ = this.actions$.pipe(
    ofType<SmartTextTemplateSave>(ClinicalRecordActionTypes.SmartTextTemplateSave),
    switchMap((action) => this.smartTextClient.saveSmartTextTemplate(action.payload)
      .pipe(map((response: APIResponseOfSmartTextTemplate) => {
        if (response && response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }

        return new SmartTextTemplateSaveSuccess(response.data);
      })),
    ));

  @Effect()
  smartTextTemplateSaveSuccess$ = this.actions$.pipe(
    ofType<SmartTextTemplateSaveSuccess>(ClinicalRecordActionTypes.SmartTextTemplateSaveSuccess),
    withLatestFrom(this.store.pipe(select(selectSmartTextTemplates), map((templates) => {
      if (templates) {
        const clone = _.cloneDeep(templates);
        const ordered = clone.sort((a, b) => a.displayOrder - b.displayOrder);
        const templateDisplayOrders: SmartTextTemplateDisplayOrder[] = [];

        for (let index = 0; index < ordered.length; index++) {
          const element = ordered[index];
          const tdo = new SmartTextTemplateDisplayOrder();
          tdo.templateId = element.templateId;
          tdo.displayOrder = index + 1;

          templateDisplayOrders.push(tdo);
        }

        return templateDisplayOrders;
      }

      return [];
    }))),
    switchMap(([action, templates]) => this.smartTextClient.saveSmartTextTemplateList(templates,
      action.payload.formDisplay, action.payload.recordSubCategory)
      .pipe(map((response: APIResponseOfListOfSmartTextTemplateDisplayOrder) => {
        if (response?.errorMessage?.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }

        return new SmartTextTemplateListSaveSuccess(response.data);
      })),
    ));

  @Effect()
  deleteSmartTextTemplate$ = this.actions$.pipe(
    ofType<SmartTextTemplateDelete>(ClinicalRecordActionTypes.SmartTextTemplateDelete),
    switchMap((action) => this.smartTextClient.deleteSmartTextTemplate(action.payload.templateId)
      .pipe(map((response: APIResponseOfBoolean) => {
        if (response?.errorMessage?.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }

        return new SmartTextTemplateDeleteSuccess({
          templateId: action.payload.templateId,
          formDisplay: action.payload.formDisplay,
          recordSubCategory: action.payload.recordSubCategory,
        });
      })),
    ));

  @Effect()
  smartTextTemplateDeleteSuccess$ = this.actions$.pipe(
    ofType<SmartTextTemplateDeleteSuccess>(ClinicalRecordActionTypes.SmartTextTemplateDeleteSuccess),
    withLatestFrom(this.store.pipe(select(selectSmartTextTemplates), map((templates) => {
      if (templates) {
        const clone = _.cloneDeep(templates);
        const ordered = clone.sort((a, b) => a.displayOrder - b.displayOrder);
        const templateDisplayOrders: SmartTextTemplateDisplayOrder[] = [];

        for (let index = 0; index < ordered.length; index++) {
          const element = ordered[index];
          const tdo = new SmartTextTemplateDisplayOrder();
          tdo.templateId = element.templateId;
          tdo.displayOrder = index + 1;

          templateDisplayOrders.push(tdo);
        }

        return templateDisplayOrders;
      }

      return [];
    }))),
    switchMap(([action, templates]) => this.smartTextClient.saveSmartTextTemplateList(templates,
      action.payload.formDisplay, action.payload.recordSubCategory)
      .pipe(map((response: APIResponseOfListOfSmartTextTemplateDisplayOrder) => {
        if (response?.errorMessage?.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }

        return new SmartTextTemplateListSaveSuccess(response.data);
      })),
    ));

  @Effect()
  saveSmartTextPackage$ = this.actions$.pipe(
    ofType<SmartTextPackageSave>(ClinicalRecordActionTypes.SmartTextPackageSave),
    switchMap((action) => this.smartTextClient.saveSmartTextPackage(action.payload)
      .pipe(map((response: APIResponseOfBoolean) => {
        if (response?.errorMessage?.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        if (response?.data === true) {
          return new SmartTextPackageSaveSuccess(action.payload);
        }
        return new SetError({ errorMessages: [response.errorMessage] });
      })),
    ));

  @Effect()
  saveSmartTextTemplateList$ = this.actions$.pipe(
    ofType<SmartTextTemplateListSave>(ClinicalRecordActionTypes.SmartTextTemplateListSave),
    switchMap((action) => this.smartTextClient.saveSmartTextTemplateList(action.payload.templateDisplayOrderList,
      action.payload.formDisplay, action.payload.recordSubCategory)
      .pipe(map((response: APIResponseOfListOfSmartTextTemplateDisplayOrder) => {
        if (response && response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }

        return new SmartTextTemplateListSaveSuccess(action.payload.templateDisplayOrderList);
      })),
    ));

  @Effect()
  fetchReferenceIdList$ = this.actions$.pipe(
    ofType<ReferenceIDListFetch>(ClinicalRecordActionTypes.ReferenceIDListFetch),
    switchMap((action) => this.smartTextClient.getReferenceIdList(action.payload.medGroup, action.payload.medArea)
      .pipe(map((response: APIResponseOfListOfReferenceIDDO) => {
        if (response && response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new ReferenceIDListFetchSuccess(response.data);
      })),
    ));
}
