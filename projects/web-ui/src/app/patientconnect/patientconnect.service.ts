import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ActionDO,
  APIResponseOfActionDO,
  APIResponseOfEffectedConnectsOnProgramDO,
  APIResponseOfGetAllInternalDoctorsResult,
  APIResponseOfGetAllLocationResult,
  APIResponseOfIEnumerableOfProgramDO,
  APIResponseOfIEnumerableOfProgramListItemDO,
  APIResponseOfIEnumerableOfSelectedBookingTypeDO,
  APIResponseOfInt32,
  APIResponseOfMovingConnectsDO,
  APIResponseOfPatientProgramOnProgramResponse,
  APIResponseOfPcManagementDO,
  APIResponseOfProgramDO,
  BookingToCompleteType,
  EffectedConnectsOnProgramDO,
  GetAllInternalDoctorsParams,
  GetAllInternalDoctorsResult,
  GetAllLocationParams,
  GetAllLocationResult,
  InternalDoctorsClient,
  LocationClient,
  MovingConnectsDO,
  PatientConnectLogDO,
  PatientProgram,
  PatientProgramOnProgramQuery,
  PatientProgramOnProgramResponse,
  PCActionClient,
  PcManagementDO,
  PCProgramsClient,
  ProgramDO,
  ProgramListItemDO,
  SelectedBookingTypeDO,
  APIResponseOfIEnumerableOfString,
  APIResponseOfIEnumerableOfLetterTemplateDO,
  LetterTemplateDO,
  ProgramType,
} from '../../../../../Generated/CoreAPIClient';
import { PageQuery } from '../shared/pagequery';

@Injectable()
export class PatientConnectService {
  DefaultProgram = 'Default Program';
  subscription = new Subscription();
  programs: ProgramDO[];
  programList: ProgramListItemDO[];
  programListChanged = new Subject<ProgramListItemDO[]>();

  constructor(private pcProgramsClient: PCProgramsClient,
    private actionClient: PCActionClient,
    private internalDoctorsClient: InternalDoctorsClient,
    private locationClient: LocationClient) { }

  getInitialPcManagementData(): Observable<PcManagementDO> {
    return this.pcProgramsClient.getPcManagementData().pipe(
      map((response: APIResponseOfPcManagementDO) => response.data, (err) => console.log(err)));
  }

  getSMSTemplates(): Observable<string[]> {
    return this.pcProgramsClient.getPatientConnectSMSTemplates()
      .pipe(map((response: APIResponseOfIEnumerableOfString) => response.data, (err) => console.log(err)));
  }

  getEmailTemplates(): Observable<string[]> {
    return this.pcProgramsClient.getPatientConnectEmailTemplates()
      .pipe(map((response: APIResponseOfIEnumerableOfString) => response.data, (err) => console.log(err)));
  }

  getLetterTemplates(): Observable<LetterTemplateDO[]> {
    return this.pcProgramsClient.getPatientConnectLetterTemplates()
      .pipe(map((response: APIResponseOfIEnumerableOfLetterTemplateDO) => response.data, (err) => console.log(err)));
  }

  getAllBookingTypes(): Observable<SelectedBookingTypeDO[]> {
    return this.pcProgramsClient.getBookingTypes().pipe(map(
      (response: APIResponseOfIEnumerableOfSelectedBookingTypeDO) => response.data, (err) => console.log(err)));
  }

  saveProgram(program: ProgramDO): Observable<APIResponseOfProgramDO> {
    return this.pcProgramsClient.saveProgram(program).pipe(map(
      (response: APIResponseOfProgramDO) => response, (err) => console.log(err)));
  }

  getProgramsList(): void {
    this.subscription = this.getEnabledProgramList().subscribe((list) => {
      this.programList = list;
      this.programListChanged.next(this.programList.slice());
    });
  }

  getProgramsListOfType(type: number) {
    return this.pcProgramsClient.getProgramsListOfType(type).pipe(map(
      (response: APIResponseOfIEnumerableOfProgramListItemDO | null) => response.data, (err) => console.log(err)));
  }

  private getEnabledProgramList(): Observable<ProgramDO[]> {
    return this.pcProgramsClient.getEnabledPrograms().pipe(map(
      (response: APIResponseOfIEnumerableOfProgramDO) => response.data, (err) => console.log(err)));
  }

  getProgram(id: number): Observable<ProgramDO> {
    return this.pcProgramsClient.getProgramDefinition(id)
      .pipe(map((response: APIResponseOfProgramDO) => response.data, (err) => console.log(err)));
  }

  deleteProgram(program: ProgramDO): Observable<APIResponseOfInt32> {
    return this.pcProgramsClient.deleteProgram(program)
      .pipe(map((response: APIResponseOfInt32) => response, (err) => console.log(err)));
  }

  getAction(id: number): Observable<ActionDO> {
    return this.actionClient.get(id)
      .pipe(map((response: APIResponseOfActionDO) => response.data, (err) => console.log(err)));
  }

  createEmptyPatientProgram() {
    const patientProgramDefault = new PatientProgram().toJSON();
    patientProgramDefault.definition = new ProgramDO().toJSON();
    patientProgramDefault.history = new PatientConnectLogDO().toJSON();
    patientProgramDefault.definition.actions = [new ActionDO().toJSON()];
    patientProgramDefault.locationId = undefined;
    return patientProgramDefault;
  }

  createNewProgram(templateProgram: ProgramDO): ProgramDO {
    const newProgram = new ProgramDO();
    newProgram.id = 0;
    newProgram.reason = (templateProgram) ? templateProgram.reason : '';
    newProgram.type = (templateProgram) ? templateProgram.type : ProgramType.General;
    newProgram.enabled = (templateProgram) ? templateProgram.enabled : true;
    newProgram.recurringCount = (templateProgram) ? templateProgram.recurringCount : 1;
    newProgram.frequencyUnit = (templateProgram) ? templateProgram.frequencyUnit : 'Y';
    newProgram.frequencyValue = (templateProgram) ? templateProgram.frequencyValue : 1;
    newProgram.bookingToCompleteType = (templateProgram) ? templateProgram.bookingToCompleteType : 0;
    if (templateProgram && newProgram.bookingToCompleteType === BookingToCompleteType.Selected) {
      newProgram.bookingTypes = _.cloneDeep(templateProgram.bookingTypes);
    }

    if (templateProgram && templateProgram.actions && templateProgram.actions.length > 0) {
      newProgram.actions = templateProgram.actions;
      newProgram.actions.map((a) => {
        a.id = null;
        a.programId = null;
        return a;
      });
    } else {
      newProgram.actions = [];
    }

    return newProgram;
  }

  getInternalDoctors(surname: string): Observable<GetAllInternalDoctorsResult> {
    const param = new GetAllInternalDoctorsParams();
    param.surnameContains = surname;

    return this.internalDoctorsClient.getAllInternalDoctors(param)
      .pipe(map((response: APIResponseOfGetAllInternalDoctorsResult) => response, (err) => console.log(err)));
  }

  getLocations(location: string): Observable<GetAllLocationResult> {
    const param = new GetAllLocationParams();
    param.nameStartsWith = location;

    return this.locationClient.getAllLocations(param)
      .pipe(map((response: APIResponseOfGetAllLocationResult) => response, (err) => console.log(err)));
  }

  getConnectsEffectedByProgramChange(programId: number): Observable<EffectedConnectsOnProgramDO> {
    return this.pcProgramsClient.getConnectsEffectedByProgramChange(programId)
      .pipe(map((response: APIResponseOfEffectedConnectsOnProgramDO) => response.data, (err) => console.log(err)));
  }

  getPatientsOnProgram(programId: number, pageQuery: PageQuery): Observable<PatientProgramOnProgramResponse> {
    const query = new PatientProgramOnProgramQuery();
    query.programId = programId;
    query.pageIndex = pageQuery.pageIndex;
    query.pageSize = pageQuery.pageSize;

    return this.pcProgramsClient.getPatientsOnProgram(query)
      .pipe(map((response: APIResponseOfPatientProgramOnProgramResponse) => response.data, (err) => console.log(err)));
  }

  getMovingPatientSteps(programId: number, movingToProgramId: number) {
    return this.pcProgramsClient.getMovingPatientSteps(programId, movingToProgramId)
      .pipe(map((response: APIResponseOfMovingConnectsDO | null) => response, (err) => console.log(err)));
  }

  getActivePatientConnectsCount(programId: number): Observable<APIResponseOfInt32> {
    return this.pcProgramsClient.getActivePatientConnectsCount(programId)
      .pipe(map((response: APIResponseOfInt32) => response, (err) => console.log(err)));
  }

  getPatientsMovingToProgramAlreadyOn(programId: number, movingToProgramId: number) {
    return this.pcProgramsClient.getPatientsMovingToProgramAlreadyOn(programId, movingToProgramId)
      .pipe(map((response: APIResponseOfInt32) => response.data, (err) => console.log(err)));
  }

  movePatientsToAnotherProgram(movingConnects: MovingConnectsDO) {
    return this.pcProgramsClient.movePatientsToAnotherProgram(movingConnects)
      .pipe(map((response: APIResponseOfInt32) => response.data, (err) => console.log(err)));
  }

  createNewAction(programId: number, actionsLength: number): any {
    const newAction = new ActionDO();
    newAction.id = 0;
    newAction.programId = programId;
    newAction.step = actionsLength + 1;
    newAction.action = 1;
    newAction.pauseOnError = true;
    newAction.actionDays = 0;
    newAction.content = false;
    newAction.printOption = 1;
    newAction.content = false;
    newAction.contentField = '';
    newAction.contentRangeType = 1;
    newAction.contentRangeHigh = 0;
    newAction.contentRangeLow = 0;

    return newAction;
  }

  getProgramType(definitionType): string {
    if (definitionType) {
      switch (definitionType) {
        case 1: return 'Recall';
        case 2: return 'Program';
        case 3: return 'Booking';
        case 4: return 'Referral';
        default: return 'Recall';
      }
    }

    return 'Recall';
  }
}
