export class PatientApi {
  patient_ID!: number;
  firstName?: string | null;
  surname?: string | null;
  knownAs?: string | null;
  initials?: string | null;
  title?: string | null;
  sex?: string | null;
  dob?: Date | null;
  mrn?: string | null;
  homePhone?: string | null;
  workPhone?: string | null;
  mobile?: string | null;

  constructor() { }
}
