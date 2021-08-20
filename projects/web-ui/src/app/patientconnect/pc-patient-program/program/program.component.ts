import {
  Component,
  AfterViewInit,
  ViewChild,
  Input,
} from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { select, Store } from '@ngrx/store';
import * as _ from 'lodash';
import { SetError, SetEditMode } from '../../../app-store/app-ui-state.actions';
import {
  selectUserName,
  selectLastBillingLocation,
  selectEditMode,
} from '../../../app-store/app-ui.selectors';
import { AppState } from '../../../app-store/reducers';
import {
  Patient,
  PatientProgram,
  ProgramDO,
  PcAction,
  PCProgramsClient,
  PatientProgramsClient,
  APIResponseOfIEnumerableOfProgramDO,
  APIResponseOfIEnumerableOfPatientProgram,
  ProgramType,
  ProgramTypeDO,
  APIResponseOfIEnumerableOfProgramTypeDO,
} from '../../../../../../../Generated/CoreAPIClient';
import { ProgramDetailsComponent } from './program-details/program-details.component';
import { NewPatientConnect } from '../new-patient-connect/new-patient-connect.model';

@Component({
  selector: 'app-program',
  templateUrl: './program.component.html',
  styleUrls: ['./program.component.css'],
})
export class ProgramComponent implements AfterViewInit {
  private _patient: Patient;

  @ViewChild(ProgramDetailsComponent) programDetails: ProgramDetailsComponent;

  @Input() set patient(patient: Patient) {
    this._patient = patient;
    if (patient && patient.patient_ID) {
      this.getEnabledPrograms();
      this.route.params.subscribe((params: Params) => {
        this.referralId = +params.referralId;
        const pcId = +params.pcId;
        this.includeBookingReferral = (this.referralId && this.referralId > 0);
        this.initialisePatientPrograms(patient.patient_ID, pcId);
        this.loading = false;
      });
    }
  }
  get patient(): Patient {
    return this._patient;
  }

  username$ = this.store.pipe(select(selectUserName));
  lastBillingLocation$ = this.store.pipe(select(selectLastBillingLocation));
  editMode$ = this.store.pipe(select(selectEditMode));
  // cloned filtered list of all the patient's programs (shown in the data grid)
  listedPrograms: PatientProgram[];
  // unfiltered list of all the patient's programs (includes completed, deleted etc.)
  allPrograms: PatientProgram[];
  // the currently selected program (from listedPrograms)
  selectedProgram: PatientProgram;
  // the id of the last selected patient program
  // (used if creating a new program is cancelled, the last selected program is reselected)
  lastSelectedProgram: number;
  // list of all active patient programs
  enabledPrograms: ProgramDO[];
  // list of programs that patient can be put on
  // (enabledPrograms excluding any the patient is already on)
  availablePrograms: ProgramDO[];
  newProgram = false;
  includeCompletedDeleted = false;
  includeBookingReferral: boolean;
  loading = true;
  selectedRowKeys = [];
  referralDetails: any;
  PcAction = PcAction;
  programTypes: ProgramTypeDO[];
  referralId: number;
  newPatientConnect: NewPatientConnect;

  constructor(private route: ActivatedRoute, private pcProgramsClient: PCProgramsClient,
    private patientProgramsClient: PatientProgramsClient, private store: Store<AppState>) {
    this.pcProgramsClient.getPatientConnectTypes().subscribe((response: APIResponseOfIEnumerableOfProgramTypeDO) => {
      if (response?.errorMessage?.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.programTypes = [...response.data];
      }
    });
  }

  ngAfterViewInit() {
    if (this.programDetails) {
      this.programDetails.editMode = false;
    }
  }

  getEnabledPrograms() {
    this.pcProgramsClient.getEnabledPrograms().subscribe((response: APIResponseOfIEnumerableOfProgramDO) => {
      if (response?.errorMessage?.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.enabledPrograms = _.cloneDeep(response.data);
      }
    });
  }

  // initial state when loading new patient
  initialisePatientPrograms(patientId: number, patientConnectId?: number) {
    this.patientProgramsClient.getPatientPrograms(patientId).subscribe(
      (response: APIResponseOfIEnumerableOfPatientProgram) => {
        this.allPrograms = [...response.data];
        this.listedPrograms = _.cloneDeep(this.getListedPrograms());
        this.availablePrograms = _.cloneDeep(this.getAvailablePrograms());

        if (this.referralId && this.referralId > 0) {
          if (this.allPrograms.some((p) => !p.deleted && !p.complete && p.referral_ID === this.referralId)) {
            const index = this.listedPrograms.findIndex((p) => !p.deleted && !p.complete
              && p.referral_ID === this.referralId);
            this.selectedProgram = _.cloneDeep(this.listedPrograms[index]);
            this.selectedRowKeys = [this.listedPrograms[index].id];
          } else {
            this.onNewProgramAdded();
          }
        } else if (patientConnectId && patientConnectId > 0 && this.listedPrograms.some(
          (a) => a.id === patientConnectId)) {
          const selected = this.listedPrograms.findIndex((a) => a.id === patientConnectId);
          if (selected && selected > -1) {
            this.selectedProgram = _.cloneDeep(this.listedPrograms[selected]);
            this.selectedRowKeys = [patientConnectId];
          } else if (this.listedPrograms && this.listedPrograms.length > 0) {
            this.selectedProgram = _.cloneDeep(this.listedPrograms[0]);
            this.selectedRowKeys = [this.listedPrograms[0].id];
          } else {
            this.selectedProgram = undefined;
            this.selectedRowKeys = [];
          }
        } else if (this.selectedProgram && this.listedPrograms && this.listedPrograms.length > 0
          && this.listedPrograms.some((p) => p.id === this.selectedProgram.id)) {
          if (this.selectedProgram) {
            this.selectedRowKeys = [this.selectedProgram.id];
          }
        } else if (this.listedPrograms?.length > 0) {
          this.selectedProgram = _.cloneDeep(this.listedPrograms[0]);
          this.selectedRowKeys = [this.listedPrograms[0].id];
        } else {
          this.selectedProgram = undefined;
          this.selectedRowKeys = [];
        }
      },
    );

    this.selectedProgram = this.listedPrograms?.length > 0 && this.selectedProgram
      ? _.cloneDeep(this.listedPrograms.find((a) => a.id === this.selectedProgram.id)) : undefined;
  }

  getAvailableReferralPrograms() {
    this.pcProgramsClient.getReferralPrograms().subscribe((response) => {
      if (response?.errorMessage?.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.availablePrograms = response.data;
      }
    });
  }

  getAvailablePrograms(): ProgramDO[] {
    if (this.selectedProgram && !this.newProgram) {
      return this.enabledPrograms?.filter((p: ProgramDO) => !this.allPrograms.some(
        (pp: PatientProgram) => pp.id !== this.selectedProgram.id && p.id === pp.definitionId
          && (pp.complete === false && pp.deleted === false)));
    }

    return this.enabledPrograms ? this.enabledPrograms?.filter((p: ProgramDO) => !this.allPrograms.some(
      (pp: PatientProgram) => p.id === pp.definitionId
        && (pp.complete === false && pp.deleted === false))) : [];
  }

  refreshPrograms(patientProgram: PatientProgram) {
    if (this.patient) {
      this.initialisePatientPrograms(this.patient?.patient_ID);

      this.selectedProgram = this.listedPrograms?.length > 0 && this.selectedProgram && patientProgram
        ? _.cloneDeep(patientProgram) : undefined;
    }
  }

  // copy list of all programs, filter based on including completed
  // and deleted and/or bookings and referrals, return filtered list
  getListedPrograms(): PatientProgram[] {
    let pPrograms = _.cloneDeep(this.allPrograms);

    if (!this.includeCompletedDeleted) {
      pPrograms = pPrograms.filter((pp: PatientProgram) => !pp.complete && !pp.deleted);
    }
    if (!this.includeBookingReferral) {
      pPrograms = pPrograms.filter((pp: PatientProgram) => !(pp.definition.type === ProgramType.Booking
        || pp.definition.type === ProgramType.Referral));
    }

    return pPrograms;
  }

  // when exiting editMode, if program was new,
  // reset selected program to the last selected if available
  onEditModeToggled(e: boolean) {
    this.store.dispatch(new SetEditMode(e));
    if (e === false) {
      if (this.selectedProgram?.id === 0) {
        this.newProgram = false;
        const program = this.listedPrograms.find((p) => p.id === this.lastSelectedProgram);
        if (program) {
          this.selectedProgram = _.cloneDeep(program);
          this.selectedRowKeys = [program.id];
          this.availablePrograms = this.getAvailablePrograms();
        } else if (this.listedPrograms && this.listedPrograms.length > 0) {
          this.selectedProgram = _.cloneDeep(this.listedPrograms[0]);
          this.selectedRowKeys = [this.listedPrograms[0].id];
        } else {
          this.selectedProgram = undefined;
          this.selectedRowKeys = [];
        }
      } else if (this.selectedProgram?.id > 0) {
        // reset selected program (undo changes)
        this.selectedProgram = _.cloneDeep(this.listedPrograms.find((p) => p.id === this.selectedProgram.id));
        this.selectedRowKeys = [this.listedPrograms.find((p) => p.id === this.selectedProgram.id).id];
      }
    }
  }

  newPatientConnectClosed() {
    this.newProgram = false;
    this.newPatientConnect = undefined;
  }

  onSelectPatientConnect(e: PatientProgram) {
    this.newProgram = true;
    this.availablePrograms = this.getAvailablePrograms();

    const newConnect = new NewPatientConnect();
    newConnect.defaultType = e.definition.type;
    newConnect.showPopup = true;
    newConnect.existingProgram = e;

    this.newPatientConnect = newConnect;
  }

  onNewProgramAdded() {
    this.newProgram = true;
    this.availablePrograms = this.getAvailablePrograms();

    const newConnect = new NewPatientConnect();
    newConnect.defaultType = (this.referralId && this.referralId > 0) ? ProgramType.Referral : ProgramType.General;
    newConnect.showPopup = true;

    this.newPatientConnect = newConnect;
  }

  onConfirmAddNewProgram(selectedProgram: ProgramDO) {
    if (this.selectedProgram) {
      this.lastSelectedProgram = this.selectedProgram.id;
    }

    if (this.patient) {
      const newPP = new PatientProgram();
      newPP.id = 0;
      newPP.definitionId = selectedProgram?.id;
      newPP.patientId = this.patient.patient_ID;
      newPP.definition = _.cloneDeep(selectedProgram);
      newPP.nextStep = 1;

      if (newPP.definition?.actions?.length > 0) {
        newPP.definition.actions[0].isNextAction = true;
      }

      if (this.referralId && this.referralId > 0 && selectedProgram?.type === ProgramType.Referral) {
        newPP.referral_ID = this.referralId;
      }

      this.selectedProgram = newPP;
      this.availablePrograms = this.getAvailablePrograms();
    }
  }

  // when toggling a filter, if selected program is not in
  // listed programs array, reset selected program to the first in the list
  onFilterChanged() {
    this.listedPrograms = _.cloneDeep(this.getListedPrograms());
    if (this.listedPrograms?.length > 0 && !this.listedPrograms?.some(
      (pp) => pp.id === this.selectedProgram.id)) {
      this.selectedProgram = _.cloneDeep(this.listedPrograms[0]);
    }
  }

  // set selected program in dataGrid
  gridContentReady() {
    if (this.selectedProgram) {
      this.selectedRowKeys = [this.selectedProgram.id];
    }
  }

  onSelectionChanged(e: any) {
    const selectedRowsData: PatientProgram = e.selectedRowsData.length > 0 ? e.selectedRowsData[0] : undefined;

    if (selectedRowsData) {
      this.selectedProgram = _.cloneDeep(selectedRowsData);
      this.availablePrograms = this.getAvailablePrograms();
      this.selectedRowKeys = [this.selectedProgram.id];
    } else {
      this.selectedProgram = undefined;
    }
  }

  // add strikeThrough styling for deleted and completed patient connects
  onRowPrepared(e: any) {
    if (e.data && (e.data.complete === true || e.data.deleted === true)) {
      e.rowElement.classList.add('list-item-deleted');
    }
  }
}
