import { Component, Input } from '@angular/core';
import { Patient } from '../../../../../../Generated/CoreAPIClient';
import { differenceInYears } from 'date-fns';

@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.component.html',
  styleUrls: ['./patient-summary.component.css'],
})
export class PatientSummaryComponent {
  private _patient: Patient;

  @Input() set patient(patient: Patient) {
    this._patient = patient;
    this.patientAge = (this.patient && this.patient.dob) ?
      differenceInYears(new Date(), new Date(this.patient.dob)) : undefined;
  }
  get patient(): Patient {
    return this._patient;
  }

  patientAge: number;

  constructor() { }
}
