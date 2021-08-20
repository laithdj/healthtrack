import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params } from '@angular/router';
import {
  Store,
  select,
} from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { AppState } from '../../app-store/reducers';
import {
  AddPatientApiRequestParams,
  Patient,
  PatientClient,
} from '../../../../../../Generated/CoreAPIClient';
import { selectEditMode, selectLog, selectInAdminMode } from '../../app-store/app-ui.selectors';
import { SetLog } from '../../app-store/app-ui-state.actions';

@Component({
  selector: 'app-pc-patient-program',
  templateUrl: './pc-patient-program.component.html',
  styleUrls: ['./pc-patient-program.component.css'],
})
export class PcPatientProgramComponent implements AfterViewInit, OnDestroy {
  private _destroyed$ = new Subject<void>();

  patient: Patient;
  showLog$ = this.store.pipe(select(selectLog));
  editMode$ = this.store.pipe(select(selectEditMode));

  constructor(private patientClient: PatientClient, private route: ActivatedRoute,
    private titleService: Title, private store: Store<AppState>) {
    this.titleService.setTitle('Patient Connect: Manage');
    this.store.dispatch(new SetLog(`${`${new Date()}: `}Patient Connect Constructor`));
    this.store.pipe(take(1), select(selectInAdminMode)).subscribe((admin: any) => console.log(admin));

    this.route.params.subscribe((params: Params) => {
      const patientId = +params.id;
      if (patientId) {
        this.getPatient(patientId);
      }
    });
  }

  ngAfterViewInit() {
    this.showLog$.pipe(takeUntil(this._destroyed$)).subscribe((show) => {
      console.log(show);
    });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  onRefreshClicked() {
    if (this.patient) {
      this.getPatient(this.patient?.patient_ID);
    }
  }

  getPatient(patientId: number) {
    this.patientClient.getPatient(patientId).subscribe((result: AddPatientApiRequestParams) => {
      this.patient = result as Patient;
      this.store.dispatch(new SetLog(`${`${new Date()}: `}Patient Details Loaded`));
    });
  }
}
