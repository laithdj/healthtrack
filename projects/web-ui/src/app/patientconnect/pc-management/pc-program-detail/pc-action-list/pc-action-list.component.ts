import {
  Component, ViewChild, Input, Output, EventEmitter,
} from '@angular/core';
// import { confirm } from 'devextreme/ui/dialog';
import { DxDataGridComponent } from 'devextreme-angular';
import * as _ from 'lodash';
import { ActionVM } from '../action-viewmodel/action.viewmodel';
import {
  ProgramDO,
  PcActionDO,
  LetterTemplateDO,
  ReplyContentTypeDO,
  ProgramType,
  ListItemDefinition,
} from '../../../../../../../../Generated/CoreAPIClient';
import { PatientConnectService } from '../../../patientconnect.service';

@Component({
  selector: 'app-pc-action-list',
  templateUrl: './pc-action-list.component.html',
  styleUrls: ['./pc-action-list.component.css'],
})
export class PcActionListComponent {
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;

  @Input() selectedProgramDO: ProgramDO;
  @Input() actionList: PcActionDO[];
  @Input() letterTemplates: LetterTemplateDO[];
  @Input() smsTemplates: string[] | null;
  @Input() emailTemplates: string[] | null;
  @Input() selectedActions: ActionVM[];
  @Input() replyContentList: ReplyContentTypeDO[] | null;
  @Input() editMode: boolean;
  @Input() allPortalMessages: ListItemDefinition[];
  @Input() allPortalScreensList: ListItemDefinition[];
  @Input() allPortalDocumentsList: ListItemDefinition[];

  @Output() selectedActionsChange = new EventEmitter<ActionVM[]>();
  @Output() updateActionOnSelectedProgramDO = new EventEmitter<ActionVM>();
  @Output() addActionToSelectedProgramDO = new EventEmitter<ActionVM>();
  @Output() refreshSMSTemplatesList = new EventEmitter<void>();
  @Output() refreshEmailTemplatesList = new EventEmitter<void>();
  @Output() refreshLetterTemplatesList = new EventEmitter<void>();

  initialSms: string;
  initialLetterTemplate: {};
  actionDetailPopupVisible = false;
  selectedAction: ActionVM;
  disableSaveReplyContent = false;
  programTypeName: string;

  constructor(private patientConnectService: PatientConnectService) {
    this.patientConnectService = patientConnectService;
  }

  onEditAction(cell: any) {
    this.disableSaveReplyContent = cell.data.content ? false
      : this.selectedActions.filter((action) => action.content === true).length > 0;
    const action = _.cloneDeep(cell.data as ActionVM);
    this.selectedAction = action;

    setTimeout(() => {
      this.actionDetailPopupVisible = true;
    }, 100);
  }

  // evalActionsForReplyContent() {
  //   return this.selectedActions.filter((action) => action.content === true).length > 0;
  // }

  onAddAction() {
    this.disableSaveReplyContent = this.selectedActions.filter((action) => action.content === true).length > 0;
    const newAction = this.patientConnectService.createNewAction(this.selectedProgramDO.id,
      this.selectedActions.length);
    newAction.smsTemplate = this.initialSms;
    newAction.description = this.initialSms;
    newAction.letterTemplate = this.initialLetterTemplate;
    const newActionVM = new ActionVM(newAction, this.allPortalMessages,
      this.allPortalScreensList, this.allPortalDocumentsList);
    newActionVM.actionBefore = (this.selectedProgramDO.type === ProgramType.Program
      || this.selectedProgramDO.type === ProgramType.Referral) ? 1 : -1;
    this.selectedAction = newActionVM;
    this.actionDetailPopupVisible = true;
  }

  onDeleteAction(cell: any) {
    const deleteAction = cell.data as ActionVM;
    // const result = confirm('Are you sure you would like to delete this Action: Step ' +
    // deleteAction.step + '?', 'Confirm Delete');
    // result.then((dialogResult: boolean) => {
    //   if (dialogResult) {
    this.selectedActions = this.selectedActions
      .filter((action: ActionVM) => action.step !== deleteAction.step)
      .map((action: ActionVM, i: number) => {
        action.step = i + 1;
        return action;
      });
    this.selectedActionsChange.emit(this.selectedActions);
    //   }
    // });
  }

  updateActionOnSelectedProgram(action: ActionVM) {
    this.updateActionOnSelectedProgramDO.emit(action);
  }

  addActionToSelectedProgram(action: ActionVM) {
    this.addActionToSelectedProgramDO.emit(action);
  }

  closeActionDetailPopup() {
    this.actionDetailPopupVisible = false;
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
