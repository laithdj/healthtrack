import { PatientProgram, ProgramType } from '../../../../../../../Generated/CoreAPIClient';

export class NewPatientConnect {
  showPopup: boolean;
  defaultType: ProgramType;
  existingProgram?: PatientProgram;

  constructor() { }
}
