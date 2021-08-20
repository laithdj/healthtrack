import { Injectable } from '@angular/core';
import { addDays, addMonths, addYears } from 'date-fns';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ActionDO,
  AddPatientApiRequestParams,
  APIResponseOfIEnumerableOfConnectStatusDO,
  APIResponseOfIEnumerableOfPatientProgram,
  ConnectStatus,
  ConnectStatusDO,
  Patient,
  PatientClient,
  PatientProgram,
  PatientProgramsClient,
  ProgramDO,
  ProgramType,
} from '../../../../../../Generated/CoreAPIClient';
import { PatientConnectService } from '../patientconnect.service';

@Injectable()
export class PatientProgramsService {
  currentPatient: Observable<Patient>;
  editMode = false;

  constructor(private patientApiClient: PatientClient,
    private patientProgramClient: PatientProgramsClient,
    private patientConnectService: PatientConnectService) {
    this.currentPatient = new Subject<Patient>();
  }

  getPatientPrograms(patientId: number): Observable<PatientProgram[]> {
    return this.patientProgramClient.getPatientPrograms(patientId)
      .pipe(map((response: APIResponseOfIEnumerableOfPatientProgram) => response.data));
  }

  getPatient(patientId: number): Observable<Patient> {
    return this.patientApiClient.getPatient(patientId)
      .pipe(map((response: AddPatientApiRequestParams) => response as Patient));
  }

  setProgramDefinition(programDO: ProgramDO, program: PatientProgram): PatientProgram {
    program.definition = programDO;
    program.definitionId = programDO.id;
    program.cyclesToComplete = programDO.recurringCount;
    program.frequencyValue = programDO.frequencyValue;
    program.frequencyUnit = programDO.frequencyUnit;
    program.referenceDate = this.calcReferenceDate(program.enrollmentDate, program.frequencyUnit,
      program.frequencyValue, program.definition.type);
    program.definitionId = programDO.id;
    program.program = programDO.reason;
    this.calcActionDates(program.referenceDate, program.definition.actions);
    program.bookingTypes = programDO.bookingTypes
      ? programDO.bookingTypes.map((item) => item.bookingType).join() : null;
    return program;
  }

  createNewPatientProgram(patientId: number, programDO: ProgramDO, attendingMO: number,
    lastBillingLocation: number): PatientProgram {
    const newPP = this.patientConnectService.createEmptyPatientProgram();
    newPP.id = 0;
    newPP.cycleCount = 1;
    newPP.enrollmentDate = this.getLocalDateTime();
    newPP.patientId = patientId;
    newPP.nextStep = 1;
    newPP.connectStatus = ConnectStatus.Active;
    newPP.attendingDoctorId = attendingMO;
    newPP.locationId = lastBillingLocation;
    return this.setProgramDefinition(programDO, newPP);
  }

  addFreqValueToDate(date: Date, frequencyUnit: string, frequencyValue: number) {
    if (frequencyUnit === 'Y') {
      return addYears(date, frequencyValue);
    }

    if (frequencyUnit === 'M') {
      return addMonths(date, frequencyValue);
    }

    if (frequencyUnit === 'D') {
      return addDays(date, frequencyValue);
    }

    return undefined;
  }

  calcNextConnectDue(date: Date, actionDays: number): Date {
    return addDays(
      date,
      actionDays,
    );
  }

  calcReferenceDate(enrollmentDate: Date, frequencyUnit: string, frequencyValue: number, definitionType: number) {
    if (!enrollmentDate) {
      enrollmentDate = this.getLocalDateTime();
    }

    if (definitionType === ProgramType.Program) {
      return enrollmentDate;
    }

    return this.addFreqValueToDate(enrollmentDate, frequencyUnit, frequencyValue);
  }

  calcActionDates(referenceDate: Date, actions: ActionDO[]): void {
    if (actions) {
      actions.map((action: ActionDO) => {
        action.actionDate = addDays(referenceDate, action.actionDays);
        return action;
      });
    }
  }

  savePatientProgram(patientProgram: PatientProgram, username) {
    if (!patientProgram) {
      throw new Error('No selected patient program to save');
    } else {
      this.editMode = false;
      patientProgram.userLastModified = username;
      return this.patientProgramClient.savePatientProgram(patientProgram, username);
    }
  }

  deletePatientProgram(patientProgram: PatientProgram, username) {
    if (!patientProgram) {
      throw new Error('No selected patient program to delete');
    } else {
      this.editMode = false;
      patientProgram.userLastModified = username;
      return this.patientProgramClient.deletePatientProgram(patientProgram, username);
    }
  }

  patientProgramCompleteCycle(patientProgram: PatientProgram, username) {
    if (!patientProgram) {
      throw new Error('No selected patient program to complete cycle');
    } else {
      this.editMode = false;
      patientProgram.userLastModified = username;
      return this.patientProgramClient.patientProgramCompleteCycle(patientProgram, username);
    }
  }

  getConnectStatuses(): Observable<ConnectStatusDO[]> {
    return this.patientProgramClient.getConnectStatuses()
      .pipe(map((response: APIResponseOfIEnumerableOfConnectStatusDO) => response.data, (err) => console.log(err)));
  }

  getLocalDateTime() {
    return new Date(Date.UTC(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      new Date().getHours(),
      new Date().getMinutes(),
      new Date().getSeconds()),
    );
  }
}
