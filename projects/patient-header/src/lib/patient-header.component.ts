import { differenceInYears } from 'date-fns';
import { Component, Input, OnInit } from '@angular/core';
import { PatientApi } from './patientApi.model';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'lib-PatientHeader',
  templateUrl: './patient-header.component.html',
  styleUrls: ['./patient-header.component.css'],
})
export class PatientHeaderComponent implements OnInit {
  private _patient: PatientApi;

  @Input() set patient(patient: PatientApi) {
    this._patient = patient;
    this.patientAge = (this.patient && this.patient.dob)
      ? differenceInYears(new Date(), new Date(this.patient.dob)) : undefined;
  }
  get patient(): PatientApi {
    return this._patient;
  }

  patientAge: number;

  constructor() { }

  ngOnInit() { }
}
