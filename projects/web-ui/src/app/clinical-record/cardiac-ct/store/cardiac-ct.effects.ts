import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { forkJoin } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import { addMinutes } from 'date-fns';
import {
  APIResponseOfBoolean,
  APIResponseOfCardiacContainerDO,
  APIResponseOfDouble,
  APIResponseOfSingle,
  APIResponseOfString,
  CardiacContainerDO,
  CardiacCTClient,
  GetStaffForRolesLocationsRequest,
  LocationClient,
  Patient,
  PatientClient,
  RolesClient,
  UnitConversionClient,
  ListClient,
  GetAllLocationParams,
} from '../../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../../app-store/app-ui-state.actions';
import { selectUserName } from '../../../app-store/app-ui.selectors';
import { ClinicalRecordInit, ReferenceIDListFetch, SmartTextReportFetch } from '../../store/clinical-record.actions';
import {
  CardiacCTActionTypes,
  CardiacCTCalculateBMI,
  CardiacCTCalculateBMISuccess,
  CardiacCTCalculateBSA,
  CardiacCTCalculateBSASuccess,
  CardiacCTConvertToCentimeters,
  CardiacCTConvertToCentimetersSuccess,
  CardiacCTConvertToGrams,
  CardiacCTConvertToGramsSuccess,
  CardiacCTDeleteRecord,
  CardiacCTDeleteRecordSuccess,
  CardiacCTFetchBMIDesc,
  CardiacCTFetchBMIDescSuccess,
  CardiacCTInitFetch,
  CardiacCTInitFetchSuccess,
  CardiacCTInitStaffFetch,
  CardiacCTInitStaffFetchSuccess,
  CardiacCTSaveResultsForRecord,
  CardiacCTSaveResultsForRecordSuccess,
  CardiacCTListFetch,
  CardiacCTListFetchSuccess,
} from './cardiac-ct.actions';
import { CardiacCTAppState } from './cardiac-ct.reducers';
import { selectCardiacCTFeatureState } from './cardiac-ct.selectors';
import { DateTimeHelperService } from '../../../shared/helpers/date-time-helper.service';

@Injectable()
export class CardiacCTEffects {
  constructor(private actions$: Actions,
    private patientClient: PatientClient,
    private locationClient: LocationClient,
    private rolesClient: RolesClient,
    private unitConversion: UnitConversionClient,
    private cardiacClient: CardiacCTClient,
    private store: Store<CardiacCTAppState>,
    private dateHelper: DateTimeHelperService,
    private listClient: ListClient) { }

  @Effect()
  cardiacCTInitFetch$ = this.actions$.pipe(ofType<CardiacCTInitFetch>(CardiacCTActionTypes.InitFetch),
    switchMap((action) => (action.payload.containerId ? forkJoin([
      this.patientClient.getPatient(action.payload.patientId),
      this.locationClient.getAllLocations(new GetAllLocationParams()),
      this.cardiacClient.fetchResultsForRecord(action.payload.containerId),
    ]).pipe(switchMap(([patientResponse, locationResponse, recordResponse]) => {
      const request = new GetStaffForRolesLocationsRequest();
      request.roleNames = ['CT Doctor', 'CT Radiographer', 'CT Fellow'];
      request.locationIds = locationResponse.data.results.map((l) => l.locationId);
      return [
        new CardiacCTInitFetchSuccess({
          locations: locationResponse.data.results,
          patient_ID: action.payload.patientId,
          record: recordResponse.data,
        }),
        new SmartTextReportFetch({
          containerId: recordResponse.data.containerId,
          cVersion: recordResponse.data.cVersion,
        }),
        new ClinicalRecordInit({ patient: patientResponse as Patient, definition: action.payload.definition }),
        new ReferenceIDListFetch({ medGroup: action.payload.medGroup, medArea: action.payload.medArea }),
        new CardiacCTInitStaffFetch(request)];
    },
    )) : forkJoin([
      this.patientClient.getPatient(action.payload.patientId),
      this.locationClient.getAllLocations(new GetAllLocationParams()),
    ]).pipe(switchMap(([patientResponse, locationResponse]) => {
      const request = new GetStaffForRolesLocationsRequest();
      request.roleNames = ['CT Doctor', 'CT Radiographer', 'CT Fellow'];
      request.locationIds = locationResponse.data.results.map((l) => l.locationId);
      return [
        new CardiacCTInitFetchSuccess({
          locations: locationResponse.data.results,
          patient_ID: action.payload.patientId,
        }),
        new ClinicalRecordInit({ patient: patientResponse as Patient, definition: action.payload.definition }),
        new ReferenceIDListFetch({ medGroup: action.payload.medGroup, medArea: action.payload.medArea }),
        new CardiacCTInitStaffFetch(request)];
    },
    )))),
  );

  @Effect()
  listFetch$ = this.actions$.pipe(ofType<CardiacCTListFetch>(CardiacCTActionTypes.InitListFetch),
    switchMap((action) => forkJoin([
      this.listClient.getAllListItems(action.payload.scannerModel),
      this.listClient.getAllListItems(action.payload.graftType),
      this.listClient.getAllListItems(action.payload.graftAnastamosis),
      this.listClient.getAllListItems(action.payload.graftSeverity),
      this.listClient.getAllListItems(action.payload.graftLocation),
      this.listClient.getAllListItems(action.payload.indicationsList),
      this.listClient.getAllListItems(action.payload.riskFactorsList)]).pipe(
      switchMap(([scannerModelsResponse, graftTypeResponse, graftAnastamosisResponse, graftSeverityResponse,
        graftLocationResponse, indicationsListResponse, riskFactorsListResponse]) => [
        new CardiacCTListFetchSuccess({
          scannerModel: scannerModelsResponse.data.results,
          graftType: graftTypeResponse.data.results,
          graftAnastamosis: graftAnastamosisResponse.data.results,
          graftSeverity: graftSeverityResponse.data.results,
          graftLocation: graftLocationResponse.data.results,
          indicationsList: indicationsListResponse.data.results,
          riskFactorsList: riskFactorsListResponse.data.results,
        })],
      ))),
  );

  @Effect()
  CalculateBMI$ = this.actions$.pipe(ofType<CardiacCTCalculateBMI>(CardiacCTActionTypes.CalculateBMI),
    switchMap((action) => this.unitConversion.calculateBMI(action.payload.height, action.payload.weight)
      .pipe(map((response: APIResponseOfDouble) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new CardiacCTCalculateBMISuccess(response.data);
      })),
    ));

  @Effect()
  FetchBMIDesc$ = this.actions$.pipe(ofType<CardiacCTFetchBMIDesc>(CardiacCTActionTypes.FetchBMIDesc),
    switchMap(() => this.actions$.pipe(ofType(CardiacCTActionTypes.CalculateBMISuccess),
      switchMap((bmi: CardiacCTCalculateBMISuccess) => this.unitConversion.getBMIDescription(bmi.payload)
        .pipe(map((response: APIResponseOfString) => {
          if (response.errorMessage && response.errorMessage.trim().length > 0) {
            return new SetError({ errorMessages: [response.errorMessage] });
          }
          return new CardiacCTFetchBMIDescSuccess(response.data);
        })),
      ))));

  @Effect()
  CardiacCTInitStaffFetch$ = this.actions$.pipe(ofType<CardiacCTInitStaffFetch>(CardiacCTActionTypes.InitStaffFetch),
    switchMap((action) => this.rolesClient.getAllStaffForRolesAtLocations(action.payload).pipe(map((response) => {
      if (response && response.errorMessage && response.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [response.errorMessage] });
      }
      return new CardiacCTInitStaffFetchSuccess(response.data);
    })),
    ));

  @Effect()
  saveResultsForRecord$ = this.actions$.pipe(
    ofType<CardiacCTSaveResultsForRecord>(CardiacCTActionTypes.SaveResultsForRecord),
    withLatestFrom(this.store.pipe(select(selectUserName)), this.store.pipe(select(selectCardiacCTFeatureState))),
    switchMap(([, userName, state]) => {
      const record = new CardiacContainerDO();
      record.bloodPressureDiastolic = state.bloodPressureDiastolic;
      record.bloodPressureSystolic = state.bloodPressureSystolic;
      record.bmi = state.bmi;
      record.bsa = state.bsa;
      record.bsaFormula = state.bsaFormula;
      record.cVersion = state.cVersion;
      record.containerId = state.containerId === 0 ? null : state.containerId;
      record.dateCreated = state.dateCreated.dateTimeDO.day
        ? state.dateCreated.dateTimeDO : this.dateHelper.getDateTimeDO(new Date());
      record.fullStructuredReport = state.fullStructuredReport;
      record.generateResult = state.generateResult;
      record.grafts = state.grafts.concat(state.deletedGrafts);
      record.heartRate = state.heartRate;
      record.height = state.height;
      record.indications = state.indications;
      record.indicationsDetails = state.indicationsDetails;
      record.locationId = state.locationId;
      record.normalisedResults = state.normalisedResults;
      record.patient_ID = state.patient_ID;
      record.procedure = state.procedure;
      record.procedureEndDate = this.dateHelper.getDateTimeDO(addMinutes(state.testDate.date, state.duration));
      record.recordSubCategory = state.recordSubCategory;
      record.riskFactors = state.riskFactors;
      record.riskFactorsDetails = state.riskFactorsDetails;
      record.staffUsed = state.staffUsed;
      record.technicianNotes = state.technicianNotes;
      record.testDate = state.testDate.dateTimeDO.day > 0
        ? state.testDate.dateTimeDO : this.dateHelper.getDateTimeDO(new Date());
      record.weight = state.weight;

      return this.cardiacClient.saveResultsForRecord(record, userName)
        .pipe(map((response: APIResponseOfCardiacContainerDO) => {
          if (response.errorMessage && response.errorMessage.trim().length > 0) {
            return new SetError({ errorMessages: [response.errorMessage] });
          }
          return new CardiacCTSaveResultsForRecordSuccess(response.data);
        }));
    },
    ));

  @Effect()
  ConvertToCentimeters$ = this.actions$.pipe(
    ofType<CardiacCTConvertToCentimeters>(CardiacCTActionTypes.ConvertToCentimeters),
    switchMap((action) => this.unitConversion.getCentimetersFromInches(action.payload)
      .pipe(map((response: APIResponseOfSingle) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new CardiacCTConvertToCentimetersSuccess(response.data);
      })),
    ));

  @Effect()
  CalculateBSA$ = this.actions$.pipe(ofType<CardiacCTCalculateBSA>(CardiacCTActionTypes.CalculateBSA),
    switchMap((action) => this.unitConversion.getBSAWithMosteller(action.payload.height, action.payload.weight)
      .pipe(map((response: APIResponseOfDouble) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new CardiacCTCalculateBSASuccess(response.data);
      })),
    ));

  @Effect()
  convertToGrams$ = this.actions$.pipe(ofType<CardiacCTConvertToGrams>(CardiacCTActionTypes.ConvertToGrams),
    switchMap((action) => this.unitConversion.getGramsFromPounds(action.payload)
      .pipe(map((response: APIResponseOfSingle) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new CardiacCTConvertToGramsSuccess(response.data);
      })),
    ));

  @Effect()
  deleteRecord$ = this.actions$.pipe(ofType<CardiacCTDeleteRecord>(CardiacCTActionTypes.DeleteRecord),
    withLatestFrom(this.store.pipe(select(selectUserName)), this.store.pipe(select(selectCardiacCTFeatureState))),
    switchMap(([, userName, state]) => this.cardiacClient
      .deleteCardiacCTRecord(state.containerId, state.cVersion, userName)
      .pipe(map((response: APIResponseOfBoolean) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new CardiacCTDeleteRecordSuccess(response.data);
      }))));
}
