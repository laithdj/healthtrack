import * as _ from 'lodash';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { DxCheckBoxComponent, DxValidationGroupComponent } from 'devextreme-angular';
import { alert, confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { pipe, Subscription } from 'rxjs';
import {
  ActionDO,
  APIResponseOfInt32,
  APIResponseOfProgramDO,
  EffectedConnectsOnProgramDO,
  LetterTemplateDO,
  MovingConnectsDO,
  PcActionDO,
  PCProgramTypeColour,
  ProgramDO,
  ProgramTypeDO,
  ReplyContentTypeDO,
  SelectedBookingTypeDO,
  BookingToCompleteType,
  ProgramType,
  PCProgramsClient,
  ListItemDefinition,
  PcAction,
  PortalConfiguration,
  PortalScreenItem,
} from '../../../../../../../Generated/CoreAPIClient';
import { selectAppUiState } from '../../../app-store/app-ui.selectors';
import { AppState } from '../../../app-store/reducers';
import { PatientConnectService } from '../../patientconnect.service';
import { reorderActions } from '../pc-management-utils';
import { ActionVM } from './action-viewmodel/action.viewmodel';
import { PcActionChangedComponent } from './pc-action-changed/pc-action-changed.component';
import { PcPatientsOnProgramComponent } from './pc-patients-on-program/pc-patients-on-program.component';
import { PcProgramMoveComponent } from './pc-program-move/pc-program-move.component';
import { PcProgramTimelineComponent } from './pc-program-timeline/pc-program-timeline.component';
import { SetError } from '../../../app-store/app-ui-state.actions';
import { PCProgramTypeColours } from '../../models/PCColoursEnum.model';

@Component({
  selector: 'app-pc-program-detail',
  templateUrl: './pc-program-detail.component.html',
  styleUrls: ['./pc-program-detail.component.css'],
})
export class PcProgramDetailComponent implements OnInit, OnDestroy, OnChanges {
  private _subscription: Subscription = new Subscription();

  @Input() selectedProgramDO: ProgramDO;
  @Input() selectedActions: ActionVM[];
  @Input() selectedProgramDOReadOnlyCopy: ProgramDO;
  @Input() allEnabledPrograms: ProgramDO[];
  @Input() allReasons: {reason: string, id: number}[];
  @Input() actionList: PcActionDO[];
  @Input() letterTemplates: LetterTemplateDO[];
  @Input() smsTemplates: string[] | null;
  @Input() emailTemplates: string[] | null;
  @Input() programTypes: ProgramTypeDO[] | null;
  @Input() bookingTypes: SelectedBookingTypeDO[] | null;
  @Input() replyContentList: ReplyContentTypeDO[] | null;
  @Input() programTypeColours: PCProgramTypeColour[];
  @Input() editMode: boolean;
  @Input() allPortalMessages: ListItemDefinition[];
  @Input() allPortalScreensList: ListItemDefinition[];
  @Input() allPortalDocumentsList: ListItemDefinition[];

  @Output() editModeChange = new EventEmitter<boolean>();
  @Output() updateProgramsList = new EventEmitter<number>();
  @Output() setProgramListKey = new EventEmitter<number>();
  @Output() removeDeletedProgramFromList = new EventEmitter<number>();
  @Output() refreshSMSTemplatesList = new EventEmitter<void>();
  @Output() refreshEmailTemplatesList = new EventEmitter<void>();
  @Output() refreshLetterTemplatesList = new EventEmitter<void>();

  @ViewChild('enabledCheckBox') enabledCheckBox: DxCheckBoxComponent;
  @ViewChild(PcProgramMoveComponent) moveComponentChild: PcProgramMoveComponent;
  @ViewChild(PcActionChangedComponent) actionChangedChild: PcActionChangedComponent;
  @ViewChild(DxValidationGroupComponent) vcValidationGroup: DxValidationGroupComponent;
  @ViewChild(PcProgramTimelineComponent) pcProgramTimeline: PcProgramTimelineComponent;
  @ViewChild(PcPatientsOnProgramComponent) pcPatientProgram: PcPatientsOnProgramComponent;

  username: string;
  error = '';
  showWizard = false;
  newProgram: ProgramDO;
  programType = 'Recall';
  ptColour = 'unset';
  isValid = false;
  duplicatingProgram = false;
  movingStepSelectPopupVisible = false;
  movingConnects: MovingConnectsDO;
  disableMovingFrom = false;
  frequencyRadioGroupItems = [
    { id: 'Y', name: 'Years' },
    { id: 'M', name: 'Months' },
    { id: 'D', name: 'Days' }];
  programTypeEnum = ProgramType;

  constructor(private patientConnectService: PatientConnectService, private pcProgramsClient: PCProgramsClient,
    private appUiStore: Store<AppState>) {
    this.patientConnectService = patientConnectService;
  }

  ngOnInit() {
    this._subscription.add(this.appUiStore.select(pipe(selectAppUiState))
      .subscribe((state) => { this.username = state.username; }));
  }

  ngOnChanges() {
    if (this.selectedProgramDO?.type) {
      this.programType = this.programTypeForUI(this.selectedProgramDO.type - 1, this.programTypes);
      this.ptColour = this.programTypeColourForUI(this.programTypeColours,
        PCProgramTypeColours, this.selectedProgramDO.type);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  programTypeForUI(type: number, programTypes: ProgramTypeDO[]): string {
    return ((type === 0 || type > 0) && programTypes && programTypes[type]
      && programTypes[type].typeName) ? programTypes[type].typeName : 'Patient Connect';
  }

  programTypeColourForUI(programTypeColours: PCProgramTypeColour[],
    pcProgramTypeColoursEnum: any, selectedProgramType: number): string {
    if (programTypeColours && programTypeColours && selectedProgramType) {
      const programTypeColour = programTypeColours.filter(
        (c) => c.pcProgramType === pcProgramTypeColoursEnum[selectedProgramType]);
      return programTypeColour.length === 1 ? programTypeColour[0].pcColour : 'unset';
    }
    return 'unset';
  }

  showProgramTimeLinePopup() {
    this.pcProgramTimeline.showProgramTimeLinePopup();
  }

  handleShowPopup() {
    this.pcPatientProgram.handleShowPopup();
  }

  moveProgramPopup() {
    this.moveComponentChild.moveProgramPopup();
  }

  onEditProgram() {
    this.editModeChange.emit(true);
    this.isValid = true;
  }

  onCancelEditProgram() {
    this.editModeChange.emit(false);
    this.error = '';
    this.selectedProgramDO = _.cloneDeep(this.selectedProgramDOReadOnlyCopy);
    this.selectedActions = this.selectedProgramDO.actions.map((a) => new ActionVM(a, this.allPortalMessages,
      this.allPortalDocumentsList, this.allPortalScreensList));
    this.setProgramListKey.emit(this.selectedProgramDO.id);
  }

  getProgramType(programType) {
    return this.patientConnectService.getProgramType(programType);
  }

  loadNewProgram = (newProgram) => {
    this.setProgramListKey.emit(-1);
    this.editModeChange.emit(true);
    this.showWizard = false;
    this.isValid = true;
    this.selectedProgramDO = newProgram;
    this.selectedActions = this.newProgram.actions.map((a) => new ActionVM(a, this.allPortalMessages,
      this.allPortalDocumentsList, this.allPortalScreensList));
    this._subscription.add(this.patientConnectService.getAllBookingTypes().subscribe((bt: SelectedBookingTypeDO[]) => {
      this.bookingTypes = bt;
    }));
  }

  onNewProgram() {
    this.showWizard = true;
    this.newProgram = this.patientConnectService.createNewProgram(null);
  }

  onDuplicateProgram() {
    this.duplicatingProgram = true;
    this.selectedProgramDO = this.patientConnectService.createNewProgram(_.cloneDeep(this.selectedProgramDO));
    this.isValid = true;

    this.editModeChange.emit(true);
    this.setProgramListKey.emit(-1);
  }

  initialiseActionChangedPopup(selectedProgramID: number, enabled: boolean) {
    const effected$ = this.patientConnectService.getConnectsEffectedByProgramChange(selectedProgramID);
    this._subscription.add(effected$.subscribe((effectedConnectSteps) => {
      const effectedCount = this.getCountOfEffectedPatients(effectedConnectSteps);
      if (effectedCount > 0) {
        this.selectedProgramDO.enabled = enabled;
        this.actionChangedChild.actionChangedPopup(true, effectedConnectSteps, this.selectedProgramDO,
          this.selectedActions, this.actionList, this.commitSave);
      } else {
        this.commitSave(this.selectedProgramDO, this.selectedProgramDO.reason);
      }
    }));
  }

  initialiseMovingStepPopup(params) {
    this.movingStepSelectPopupVisible = true;
    this.movingConnects = params.movingConnects;
    this.disableMovingFrom = params.disableMovingFrom;
  }

  onSaveProgram() {
    if (!this.selectedProgramDO.reason || this.selectedProgramDO.reason.trim().length === 0) {
      this.appUiStore.dispatch(new SetError({ errorMessages: ['Name cannot be empty'] }));
      this.isValid = false;
    }

    this.programAlerts(this.selectedActions, this.selectedProgramDO.bookingToCompleteType, this.bookingTypes);
    this.checkReason(this.selectedProgramDO.reason, this.selectedProgramDO.id);

    if (!this.isValid) {
      this.isValid = true;
      return;
    }

    const haveActionsChanged = this.selectedProgramDO?.id > 0
      ? this.actionsHaveBeenChanged(this.selectedProgramDO.actions, this.selectedActions) : false;
    if (haveActionsChanged) {
      this.initialiseActionChangedPopup(this.selectedProgramDO.id, this.selectedProgramDO.enabled);
    } else if (haveActionsChanged === false) {
      this.commitSave(this.selectedProgramDO, this.selectedProgramDO.reason);
    }
  }

  updateActionOnSelectedProgramDO(action: ActionVM) {
    if (action.id > 0) {
      this.selectedActions = reorderActions(this.selectedActions.map(
        (a: ActionVM) => (a.id === action.id ? action : a)));
    } else if (action.id === 0) {
      this.selectedActions = reorderActions(this.selectedActions.map(
        (a: ActionVM) => (a.step === action.step ? action : a)));
    }
  }

  addActionToSelectedProgramDO(action: ActionVM) {
    this.selectedActions = reorderActions(this.selectedActions.concat(action));
  }

  getPortalConfiguration(action: ActionDO): PortalConfiguration {
    const actionVM = new ActionVM(action, this.allPortalMessages,
      this.allPortalDocumentsList, this.allPortalScreensList);

    const config = new PortalConfiguration();
    config.messageList_ID = action?.portalConfiguration?.messageList_ID
      ? action.portalConfiguration.messageList_ID : 0;
    config.documentsList = actionVM?.portalDocumentList?.map((a) => a.list_ID);
    config.screensList = actionVM?.portalScreenList?.map((a) => {
      const item = new PortalScreenItem();
      item.list_ID = a.list_ID;
      item.displayOrder = a.displayOrder;
      return item;
    });

    return config;
  }

  commitSave = (selectedProgramDO: ProgramDO, programReason: string) => {
    this.error = '';

    if (selectedProgramDO.bookingTypes) {
      selectedProgramDO.bookingTypes = selectedProgramDO.bookingTypes.filter((bt) => bt.selected);
    }

    selectedProgramDO.userLastModified = this.username;
    this.selectedProgramDO.actions = this.duplicatingProgram ? this.selectedProgramDO.actions : this.selectedActions;

    this.selectedProgramDO.actions.forEach((action) => {
      if (action.action === PcAction.Portal) {
        // set portal config
        action.portalConfiguration = this.getPortalConfiguration(action);
      }
    });

    this.pcProgramsClient.saveProgram(selectedProgramDO).subscribe((response: APIResponseOfProgramDO) => {
      if (response?.errorMessage?.length > 0) {
        this.error = response.errorMessage;
      } else {
        this.updateProgramsList.emit(response.data.id ? response.data.id : null);
        this.editModeChange.emit(false);
        this.error = '';

        notify({
          message: `${programReason} saved successfully`,
          maxWidth: '400px',
        }, 'success', 2000);
      }
    });

    this.duplicatingProgram = false;
  }

  actionsHaveBeenChanged(aInit: ActionDO[], aChanged: ActionDO[]) {
    if (aInit !== undefined && aInit.length > 0) {
      if (aInit.length !== aChanged.length) {
        return true;
      }

      for (let i = 0; i < aInit.length; i++) {
        if (aInit[i].action !== aChanged[i].action) {
          return true;
        }

        if (aInit[i].step !== aChanged[i].step
            && aInit[aInit[i].step - 1].action !== aChanged[aChanged[i].step - 1].action) {
          return true;
        }
      }
    }

    return false;
  }

  onDeleteProgramConfirmed() {
    this.selectedProgramDO.userLastModified = this.username;
    const programReason = this.selectedProgramDO.reason.repeat(1);

    const result = confirm(`<span style='text-align:center'><p>This will <b>Delete</b> ${this.selectedProgramDO.reason
    }. <br><br> Do you wish to continue?</p></span>`, 'Confirm changes');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this._subscription.add(this.patientConnectService.deleteProgram(this.selectedProgramDO)
          .subscribe((response: APIResponseOfInt32) => {
            if (response.errorMessage && response.errorMessage.length > 0) {
              this.error = response.errorMessage;
            } else {
              alert('If you have patients on this Program <b>NO further Actions</b> will be taken', '');
              notify({
                message: `${programReason} deleted successfully`,
                maxWidth: '400px',
              }, 'success', 2000);
              this.removeDeletedProgramFromList.emit(response.data ? response.data : null);
              this.updateProgramsList.emit(null);
              this.editModeChange.emit(false);
              this.error = '';
            }
          }));
      }
    });
  }

  getCountOfEffectedPatients(effected: EffectedConnectsOnProgramDO): number {
    let effectedCount = 0;
    if (effected.effectedConnectSteps.length > 0) {
      for (let i = 0; i < effected.effectedConnectSteps.length; i++) {
        effectedCount += effected.effectedConnectSteps[i].effectedCount;
      }
    }
    return effectedCount;
  }

  programAlerts(actions: ActionVM[], bookingToCompleteType: number, bookingTypes: SelectedBookingTypeDO[] | null) {
    let alertMsg = '';
    if (actions.length === 0) {
      alertMsg = 'Program has no Actions. Add Action/s before saving.';
      this.isValid = false;
    }

    if (bookingToCompleteType === BookingToCompleteType.Selected
      && bookingTypes.findIndex((bt) => bt.selected) === -1) {
      alertMsg += 'Program requires selected Booking Types to complete. Select Booking Types before saving.';
      this.isValid = false;
    }

    if (alertMsg.length > 0) {
      alert(alertMsg, 'Saving Program');
    }
  }

  checkReason(newReason: string, id: number) {
    const findReason = this.allReasons.findIndex((e) => e.reason === newReason && (id === 0 || e.id !== id));
    if (findReason >= 0) {
      this.appUiStore.dispatch(new SetError({ errorMessages: [`Program ${newReason} Already in Use!`] }));
      this.isValid = false;
    }
  }

  onSetFrequency(i: number) {
    this.selectedProgramDO.frequencyValue = i;
  }

  refreshEmailTemplates() {
    this.refreshEmailTemplatesList.emit();
  }

  refreshSMSTemplates() {
    this.refreshSMSTemplatesList.emit();
  }

  refreshLetterTemplates() {
    this.refreshLetterTemplatesList.emit();
  }
}
