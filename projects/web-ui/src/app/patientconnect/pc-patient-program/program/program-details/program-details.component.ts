import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  addDays,
  addYears,
  addMonths,
  startOfDay,
} from 'date-fns';
import { confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { FrequencyItem } from '../../../../shared/models/FrequencyItem';
import {
  PatientProgram,
  InternalDoctorInfo,
  ConnectStatus,
  Patient,
  ActionDO,
  LocationInfo,
  LocationClient,
  InternalDoctorsClient,
  GetAllLocationParams,
  APIResponseOfGetAllLocationResult,
  GetAllInternalDoctorsParams,
  APIResponseOfGetAllInternalDoctorsResult,
  PatientProgramsClient,
  APIResponseOfIEnumerableOfConnectStatusDO,
  SelectedBookingTypeDO,
  ConnectStatusDO,
  ProgramDO,
  APIResponseOfPatientProgram,
  ProgramType,
  PatientConnectLogDO,
  ProgramTypeDO,
} from '../../../../../../../../Generated/CoreAPIClient';
import { AppState } from '../../../../app-store/reducers';
import { SetError } from '../../../../app-store/app-ui-state.actions';
import { PracticeWideService } from '../../../../patientconnect/practicewide.service';
import { selectDoctorId } from '../../../../app-store/app-ui.selectors';

@Component({
  selector: 'app-program-details',
  templateUrl: './program-details.component.html',
  styleUrls: ['./program-details.component.css'],
})
export class ProgramDetailsComponent {
  private _patientProgram: PatientProgram;

  @Input() set selectedProgram(program: PatientProgram) {
    if (program) {
      this.newProgram = program.id === 0;

      if (this.newProgram) {
        this.getNewPatientProgram(program);

        if (this._patientProgram !== null && this._patientProgram !== undefined) {
          this.nextAction = this._patientProgram.definition?.actions.find(
            (a) => a.step === this._patientProgram.nextStep);
          this.programType = this.programTypes.find(
            (p) => p.id === this._patientProgram.definition?.type)?.typeName;
          this.graphSeries = this.selectedProgram.definition?.hasReplyContent ? this.getReplyContentFields() : [];
          this.selectedLog = this.selectedProgram.history ? this.selectedProgram.history[0] : new PatientConnectLogDO();
          this.programCommenced = false;
          this.setEditMode(true);
        } else {
          this._patientProgram = program;
          this.setEditMode(false);
        }
      } else {
        this._patientProgram = program;
        this.nextAction = program.definition?.actions.find((a) => a.step === this._patientProgram.nextStep);
        this.programType = this.programTypes.find((p) => p.id === program.definition?.type).typeName;
        this.graphSeries = this._patientProgram.definition?.hasReplyContent ? this.getReplyContentFields() : [];
        this.selectedLog = this._patientProgram.history ? this._patientProgram.history[0] : new PatientConnectLogDO();
        this.calcActionDates(this._patientProgram.referenceDate, this._patientProgram.definition?.actions);
        this.programCommenced = program.nextStep > 1 || program.cycleCount > 1;
      }
    } else {
      this._patientProgram = program;
    }
  }
  get selectedProgram(): PatientProgram {
    return this._patientProgram;
  }

  @Input() availablePrograms: ProgramDO[];
  @Input() patient: Patient;
  @Input() lastBillingLocation: number;
  @Input() username: string;
  @Input() editMode: boolean;
  @Input() programTypes: ProgramTypeDO[];

  @Output() refreshPrograms = new EventEmitter<PatientProgram>();
  @Output() editModeToggled = new EventEmitter<boolean>();
  @Output() selectProgram = new EventEmitter<PatientProgram>();

  frequencyRadioGroupItems: FrequencyItem[] = [
    { id: 'Y', name: 'Years' },
    { id: 'M', name: 'Months' },
    { id: 'D', name: 'Days' }];
  nextAction: ActionDO;
  programType = 'Recall';
  programCommenced = false;
  newProgram = false;
  locations: LocationInfo[];
  doctors: InternalDoctorInfo[];
  connectStatuses: ConnectStatusDO[];
  showBookingTypesPopup = false;
  showConfirmAddProgram = false;
  graphSeries: string[] = [];
  selectedLog: PatientConnectLogDO;
  connectStatus = ConnectStatus;
  doctorId$ = this.store.select(selectDoctorId);

  constructor(private locationClient: LocationClient,
    private internalDoctorsClient: InternalDoctorsClient,
    private patientProgramsClient: PatientProgramsClient,
    private practiceWideService: PracticeWideService,
    private store: Store<AppState>) {
    this.locationClient.getAllLocations(new GetAllLocationParams()).subscribe(
      (response: APIResponseOfGetAllLocationResult) => {
        if (response.errorMessage && response.errorMessage.length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else { this.locations = response.data.results; }
      });

    this.internalDoctorsClient.getAllInternalDoctors(new GetAllInternalDoctorsParams()).subscribe(
      (response: APIResponseOfGetAllInternalDoctorsResult) => {
        if (response.errorMessage && response.errorMessage.length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else { this.doctors = response.data.results; }
      });

    this.patientProgramsClient.getConnectStatuses().subscribe(
      (response: APIResponseOfIEnumerableOfConnectStatusDO) => {
        if (response.errorMessage && response.errorMessage.length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else { this.connectStatuses = response.data; }
      });
  }

  getReplyContentFields(): string[] {
    if (!this.selectedProgram || !this.selectedProgram.replyContent) { return []; }

    const unique = this.selectedProgram.replyContent.map((item) => item.contentField)
      .filter((value, index, self) => self.indexOf(value) === index);
    return unique;
  }

  onSelectProgramClicked() {
    this.selectProgram.emit(this.selectedProgram);
  }

  setEditMode(editMode: boolean) {
    this.editModeToggled.emit(editMode);
  }

  getNewPatientProgram(pp: PatientProgram) {
    pp.cycleCount = 1;
    pp.enrollmentDate = startOfDay(new Date());
    pp.program = pp.definition?.reason;
    pp.cyclesToComplete = pp.definition?.recurringCount;
    pp.nextStep = 1;
    pp.connectStatus = ConnectStatus.Active;
    pp.frequencyValue = pp.definition?.frequencyValue;
    pp.frequencyUnit = pp.definition?.frequencyUnit;
    pp.canPrintPreview = false;

    // if you are a doctor, set attending mo to you,
    // else if patient has attending mo and mo is an active doctor, set them as the patient connect attending mo
    this.doctorId$.pipe(take(1)).subscribe((drId: number) => {
      if (drId && drId > 0 && this.doctors.some((d) => d.doctorId === drId)) {
        pp.attendingDoctorId = drId;
      } else if (this.patient.attendingMO && this.doctors.some((d) => d.doctorId === this.patient.attendingMO)) {
        pp.attendingDoctorId = this.patient.attendingMO;
      }
    });

    // if last billing location, set it as the default location, else select the first location
    if (this.lastBillingLocation && this.locations.some((l) => l.locationId === this.lastBillingLocation)) {
      pp.locationId = this.lastBillingLocation;
    } else {
      pp.locationId = this.locations[0].locationId;
    }

    pp.referenceDate = this.getReferenceDate(pp);
    pp.bookingTypes = this.getBookingTypes(pp);

    if (pp.definition?.actions) {
      pp.definition?.actions.map((action: ActionDO) => {
        action.actionDate = addDays(new Date(pp.referenceDate), action.actionDays);
        return action;
      });

      pp.nextConnectDue = this.getNextConnectDue(pp.referenceDate, pp.definition?.actions[0].actionDays);
      this.calcActionDates(pp.referenceDate, pp.definition?.actions);
    }

    this._patientProgram = pp;
  }

  getReferenceDate(pp: PatientProgram): Date {
    if (pp.enrollmentDate) {
      if (pp.definition?.type === ProgramType.Recall) {
        switch (pp.definition?.frequencyUnit) {
          case 'Y': { return addYears(new Date(pp.enrollmentDate), pp.definition?.frequencyValue); }
          case 'M': { return addMonths(new Date(pp.enrollmentDate), pp.definition?.frequencyValue); }
          case 'D': { return addDays(new Date(pp.enrollmentDate), pp.definition?.frequencyValue); }
          default: { return new Date(pp.enrollmentDate); }
        }
      } else {
        return new Date(pp.enrollmentDate);
      }
    } else {
      return new Date();
    }
  }

  getNextConnectDue(date: Date, actionDays: number): Date {
    return addDays(new Date(date), actionDays);
  }

  calcActionDates(referenceDate: Date, actions: ActionDO[]): void {
    if (actions) {
      actions.map((action: ActionDO) => {
        action.actionDate = addDays(new Date(referenceDate), action.actionDays);
        return action;
      });
    }
  }

  onPauseProgram() {
    const result = confirm(`This will pause all actions for ${this.selectedProgram.patientName} on the <br/> '${
      this.selectedProgram.program}' Program <br/><br/> Do you wish to continue?`, 'Pause Program');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.selectedProgram.connectStatus = ConnectStatus.Paused;
        this.savePatientProgram(this.selectedProgram.program, 'paused');
      }
    });
  }

  clearErrorStatus() {
    this.selectedProgram.connectStatus = ConnectStatus.Active;
    this.onSaveClicked();
  }

  onActivateProgram() {
    const result = confirm(`This will activate all actions for ${this.selectedProgram.patientName} on the <br/> '${
      this.selectedProgram.program}' Program <br/><br/> Do you wish to continue?`, 'Activate Program');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.selectedProgram.connectStatus = ConnectStatus.Active;
        this.savePatientProgram(this.selectedProgram.program, 'activated');
      }
    });
  }

  onPreviewLetters() {
    this.practiceWideService.mailMergePrint([this.selectedProgram.id], false, undefined, undefined);
  }

  onSaveClicked() {
    if (this.newProgram) {
      this.showConfirmAddProgram = true;
    } else if (this.selectedProgram.connectStatus === ConnectStatus.Error) {
      const result = confirm('This Patient Connect is currently in Error status.<br>'
          + 'Do you wish to attempt to clear the error and re-commence this Patient Connect?', 'Attention');
      result.then((dialogResult: boolean) => {
        if (dialogResult) {
          this.selectedProgram.connectStatus = ConnectStatus.Active;
        }
        this.savePatientProgram(this.selectedProgram.program, 'activated');
      });
    } else if (this.selectedProgram.connectStatus === ConnectStatus.Paused) {
      const result = confirm('This Patient Connect is currently Paused.<br>'
          + 'Do you wish to re-activate it?', 'Attention');
      result.then((dialogResult: boolean) => {
        if (dialogResult) {
          this.selectedProgram.connectStatus = ConnectStatus.Active;
        }
        this.savePatientProgram(this.selectedProgram.program, 'activated');
      });
    } else {
      this.savePatientProgram(this.selectedProgram.program, 'updated');
    }
  }

  onDeleteClicked() {
    const result = confirm(`<span style='text-align:center'><p>This will permanently delete the 
      ${this.selectedProgram.program} ${this.programType} for ${this.selectedProgram.patientName}.
      <br/><br/> Do you wish to continue?</p></span>`, 'Confirm Delete');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.selectedProgram.connectStatus = ConnectStatus.Deleted;
        this.selectedProgram.deleted = true;
        this.savePatientProgram(this.selectedProgram.program, 'deleted');
        this.refreshPrograms.emit(undefined);
      }
    });
  }

  onConfirmSavePatientProgram() {
    this.selectedProgram.connectStatus = ConnectStatus.Active;
    this.savePatientProgram(this.selectedProgram.program, 'created');
  }

  savePatientProgram(patientProgramName: string, action: string) {
    this.showConfirmAddProgram = false;
    this.patientProgramsClient.savePatientProgram(this.selectedProgram, this.username).subscribe(
      (result: APIResponseOfPatientProgram) => {
        if (result.errorMessage && result.errorMessage.length > 0) {
          this.store.dispatch(new SetError({
            errorMessages: ['Patient Connect could not be saved, please try again.'],
          }));
        } else {
          this.setEditMode(false);
          this.newProgram = false;
          this.refreshPrograms.emit(result.data);
          if (action !== 'cycle completed') {
            notify(`${patientProgramName} was ${action} successfully`, 'success', 3000);
          } else {
            notify(`The current cycle for ${patientProgramName} was completed successfully`, 'success', 3000);
          }
        }
      });
  }

  cancelPopup() {
    this.showConfirmAddProgram = false;
  }

  referenceDateChanged = () => {
    const component = this;
    if (component.editMode) {
      component.selectedProgram.nextConnectDue = component.getNextConnectDue(component.selectedProgram.referenceDate,
        component.selectedProgram.definition.actions[0].actionDays);
      component.calcActionDates(component.selectedProgram.referenceDate, component.selectedProgram.definition.actions);
    }
  }

  onConfirmAddNewProgramChanged(e: any) {
    if (e.dataField === 'referenceDate') {
      this.referenceDateChanged();
    }
  }

  onProgramChanged(e: any) {
    if (e.itemData) {
      this.selectedProgram.definition = _.cloneDeep(e.itemData);
      this.selectedProgram.program = e.itemData.reason;
      this.programType = this.programTypes.find(
        (p) => p.id === this.selectedProgram.definition.type).typeName;
      this.selectedProgram.frequencyUnit = this.selectedProgram.definition.frequencyUnit;
      this.selectedProgram.frequencyValue = this.selectedProgram.definition.frequencyValue;
      this.selectedProgram.referenceDate = this.getReferenceDate(this.selectedProgram);
      this.referenceDateChanged();
      this.selectedProgram.bookingTypes = this.getBookingTypes(this.selectedProgram);
    }
  }

  getBookingTypes(pp: PatientProgram): string {
    return (pp.definition?.bookingTypes) ? pp.definition?.bookingTypes.map((bt) => bt.bookingType).join() : undefined;
  }

  onSelectBookingTypesClicked() {
    this.showBookingTypesPopup = true;
  }

  bookingPopupClosed() {
    this.showBookingTypesPopup = false;
  }

  bookingTypesUpdated(e: SelectedBookingTypeDO[]) {
    this.showBookingTypesPopup = false;
    this.selectedProgram.definition.bookingTypes = e;
    this.selectedProgram.bookingTypes = this.getBookingTypes(this.selectedProgram);
  }

  onCompleteCycle() {
    let remainingCycles = (this.selectedProgram.cyclesToComplete - this.selectedProgram.cycleCount - 1);
    if (remainingCycles < 0) {
      remainingCycles = 0;
    }

    const result = confirm(`${'Please confirm you wish to complete the current cycle.<br><b>THIS ACTION '
      + 'CANNOT BE UNDONE</b><br><br>After completing the current cycle there will be'
      + ' '}${remainingCycles} cycles remaining`, 'Complete Cycle');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        if (this.selectedProgram.connectStatus === ConnectStatus.Error) {
          this.selectedProgram.connectStatus = ConnectStatus.Active;
        }

        this.patientProgramsClient.patientProgramCompleteCycle(this.selectedProgram, this.username)
          .subscribe((response: APIResponseOfPatientProgram) => {
            if (response.errorMessage && response.errorMessage.length > 0) {
              this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
            } else {
              this.editModeToggled.emit(false);
              this.refreshPrograms.emit(response.data);
              notify(`The current cycle for ${response.data.program} was completed successfully`, 'success', 3000);
            }
          });
      }
    });
  }

  onFreqUnitChange = (e: any) => {
    if (this.newProgram || !this.programCommenced) {
      this.selectedProgram.frequencyUnit = e.value;
      this.selectedProgram.definition.frequencyUnit = e.value;
      this.selectedProgram.referenceDate = this.getReferenceDate(this.selectedProgram);
      this.referenceDateChanged();
    }
  }

  onFreqValueChange = (e: any) => {
    if (!this.programCommenced) {
      if (this.newProgram) {
        this.selectedProgram.frequencyValue = e.value;
        this.selectedProgram.definition.frequencyValue = e.value;
        this.selectedProgram.referenceDate = this.getReferenceDate(this.selectedProgram);
        this.referenceDateChanged();
      }
    }
  }

  onEnrolmentDateChanged = () => {
    // enrolment date should only be editable on create and for programs that have not yet commenced
    if (this.newProgram || !this.programCommenced) {
      this.selectedProgram.referenceDate = this.getReferenceDate(this.selectedProgram);
      this.referenceDateChanged();
    }
  }

  statusClass(status: number): string {
    switch (status) {
      case 0: return 'normalStatus'; // Active
      case 1: return 'pausedStatus'; // Paused = 1
      case 2: return 'errorStatus'; // Error = 2
      case 3: return 'completedStatus'; // Completed = 3
      case 4: return 'completedStatus'; // Deleted = 4
      default: return 'normal';
    }
  }

  moveToNextStep(e: any) {
    const actionId = e?.value as number;
    const component = this;
    const actionIdx = component.selectedProgram?.definition?.actions.findIndex((a) => a.id === actionId);
    const nextAction = actionIdx > -1 ? component.selectedProgram.definition.actions[actionIdx] : undefined;

    if (nextAction) {
      const result = confirm(`${'Are you sure you would like to set the next action'
        + ' step to '}${nextAction.step}?`, 'Confirm next step');
      result.then((dialogResult: boolean) => {
        if (dialogResult) {
          component.nextAction = nextAction;
          component.selectedProgram.nextStep = nextAction.step;

          // deactivate current action as next step & set selected action as next step
          const index = component?.selectedProgram?.definition?.actions?.findIndex((a) => a.id === nextAction.id);
          if (index > -1) {
            component?.selectedProgram?.definition?.actions.map((a) => {
              a.isNextAction = false;
              return a;
            });

            component.selectedProgram.definition.actions[index].isNextAction = true;

            if (component.selectedProgram.connectStatus === ConnectStatus.Error) {
              component.selectedProgram.connectStatus = ConnectStatus.Active;
            }
          }
        }
      });
    }
  }

  // created next step context menu for datagrid when in edit mode only
  onContextMenuPreparing(e: any) {
    if (this.editMode && !this.newProgram) {
      if (e?.row?.rowType === 'data') {
        const component = this;
        e.items = [{
          text: `Move to Step #${e.row.data.step}`,
          onItemClick() {
            const nextAction = e.row.data as ActionDO;
            component.moveToNextStep({ value: nextAction.id });
          },
        }];
      }
    }
  }
}
