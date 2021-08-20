import { PatientConnectFilterDO } from '../../../../../../../Generated/CoreAPIClient';

export class PrintPatientConnectListRequest {
  filter: PatientConnectFilterDO;
  patientConnectIds: number[];

  constructor(patientConnectIds: number[], filter: PatientConnectFilterDO) {
    this.patientConnectIds = patientConnectIds;
    this.filter = filter;
  }
}
