import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import {
  LetterTemplateDO,
  ListItemDefinition,
  PcAction,
  PcActionDO,
  PortalConfiguration,
  PortalScreenItem,
  ProgramDO,
  ReplyContentTypeDO,
} from '../../../../../../../../Generated/CoreAPIClient';
import { KnownConfigurationScreen } from '../../../../../../../../Generated/HMS.Interfaces';
import { StompService } from '../../../../shared/stomp/stomp.service';
import { ActionVM } from '../action-viewmodel/action.viewmodel';
import { SetError } from '../../../../app-store/app-ui-state.actions';
import { AppState } from '../../../../app-store/reducers';

@Component({
  selector: 'app-pc-action-detail',
  templateUrl: './pc-action-detail.component.html',
  styleUrls: ['./pc-action-detail.component.css'],
})
export class PcActionDetailComponent {
  private _selectedAction: ActionVM;
  private _allPortalScreens: ListItemDefinition[];
  private _allPortalDocuments: ListItemDefinition[];

  @Input() set selectedAction(action: ActionVM) {
    this._selectedAction = action;
  }
  get selectedAction(): ActionVM {
    return this._selectedAction;
  }
  @Input() selectedActions: ActionVM[];
  @Input() actionList: PcActionDO[];
  @Input() letterTemplates: LetterTemplateDO[];
  @Input() smsTemplates: string[] | null;
  @Input() emailTemplates: string[] | null;
  @Input() replyContentList: ReplyContentTypeDO[] | null;
  @Input() selectedProgramDO: ProgramDO;
  @Input() disableSaveReplyContent: boolean;
  @Input() actionDetailPopupVisible: boolean;
  @Input() editMode: boolean;
  @Input() allPortalMessages: ListItemDefinition[];
  @Input() set allPortalScreensList(screens: ListItemDefinition[]) {
    this._allPortalScreens = screens;
    this.selectablePortalScreens = _.cloneDeep(this.allPortalScreensList);
  }
  get allPortalScreensList(): ListItemDefinition[] {
    return this._allPortalScreens;
  }
  @Input() set allPortalDocumentsList(documents: ListItemDefinition[]) {
    this._allPortalDocuments = documents;
    this.selectablePortalDocuments = _.cloneDeep(this.allPortalDocumentsList);
  }
  get allPortalDocumentsList(): ListItemDefinition[] {
    return this._allPortalDocuments;
  }

  @Output() actionDetailPopupVisibleChange = new EventEmitter<boolean>();
  @Output() updateActionOnSelectedProgram = new EventEmitter<ActionVM>();
  @Output() addActionToSelectedProgram = new EventEmitter<ActionVM>();
  @Output() refreshSMSTemplatesList = new EventEmitter<void>();
  @Output() refreshEmailTemplatesList = new EventEmitter<void>();
  @Output() refreshLetterTemplatesList = new EventEmitter<void>();

  actionBeforeList = [
    { display: 'Before', actionBefore: -1 },
    { display: 'After', actionBefore: 1 },
  ];
  printOptionList = [
    { id: 1, printOption: 'Mail' },
    { id: 3, printOption: 'ePost' },
    { id: 2, printOption: 'Save File' } ];
  contentTypeRadioGroupItems = [
    { name: 'Percentage', contentRangeType: 1 },
    { name: 'Value', contentRangeType: 2 },
  ];
  isValid = false;
  showPauseOnError = false;
  pcAction = PcAction;
  selectablePortalScreens: ListItemDefinition[];
  selectablePortalDocuments: ListItemDefinition[];
  showSelectScreen = false;
  animationDone = false;
  selectedScreenKeys = [];
  newScreensList: ListItemDefinition[];
  showSelectDocument = false;
  selectedDocumentKeys = [];
  newDocumentsList: ListItemDefinition[];
  selectedPortalScreenKeys = [];

  constructor(private stompService: StompService, private store: Store<AppState>) { }

  onActionChanged(e) {
    this.handleActionChanged(e, this.selectedAction, this.letterTemplates);
  }

  onActionSaved(action: ActionVM) {
    let error = '';
    if (action.action === 1) {
      if (!action.smsTemplate) {
        error = 'Please select an SMS Template';
      }
    }
    if (error.length > 0) {
      this.store.dispatch(new SetError({ errorMessages: [error] }));
    } else {
      if (action.action === PcAction.Portal) {
        action.portalConfiguration.documentsList = undefined;
        action.portalConfiguration.screensList = undefined;

        if (action.portalDocumentList?.length > 0) {
          const newDocumentsList = [];
          action.portalDocumentList.forEach((doc) => {
            if (!newDocumentsList.some((a) => a === doc.list_ID)) {
              newDocumentsList.push(doc.list_ID);
            }
          });

          action.portalConfiguration.documentsList = newDocumentsList;
        }

        if (action.portalScreenList?.length > 0) {
          const newScreenList: PortalScreenItem[] = [];
          action.portalScreenList.forEach((screen) => {
            if (!newScreenList.some((a) => a.list_ID === screen.list_ID)) {
              const screenItem = new PortalScreenItem();
              screenItem.list_ID = screen.list_ID;
              screenItem.displayOrder = screen.displayOrder;
              newScreenList.push(screenItem);
            }
          });

          action.portalConfiguration.screensList = newScreenList;
        }
      }

      if (action.step > this.selectedActions.length) {
        this.addActionToSelectedProgram.emit(new ActionVM(action, this.allPortalMessages,
          this.allPortalDocumentsList, this.allPortalScreensList));
      } else {
        this.updateActionOnSelectedProgram.emit(new ActionVM(action, this.allPortalMessages,
          this.allPortalDocumentsList, this.allPortalScreensList));
      }

      this.actionDetailPopupVisibleChange.emit(false);
    }
  }

  onActionCancelled() {
    this.actionDetailPopupVisibleChange.emit(false);
  }

  handleActionChanged(e: any, selectedAction: ActionVM, lettertemplates: LetterTemplateDO[]) {
    if (selectedAction) {
      if ((e.dataField === 'actionBefore' || e.dataField === 'absActionDays') && e.value) {
        const updatedAction = new ActionVM(selectedAction, this.allPortalMessages,
          this.allPortalDocumentsList, this.allPortalScreensList);
        selectedAction.actionDays = updatedAction.actionDays;
      }

      if (e.dataField === 'actionBefore' && e.value === 0) {
        selectedAction.absActionDays = 0;
        selectedAction.actionDays = 0;
      }

      if (e.dataField === 'smsTemplate' && e.value) {
        this.isValid = e.value.length > 0;
        selectedAction.smsTemplate = e.value;
        selectedAction.description = e.value;
      }

      if (e.dataField === 'letterTemplateId' && e.value) {
        this.isValid = e.value > 0;
        const letterTemplateDesc = lettertemplates.find((l) => l.id === e.value).templateDescription;
        selectedAction.letterTemplateDescription = letterTemplateDesc;
        selectedAction.description = letterTemplateDesc;
      }

      if (e.dataField === 'portalMessage.additionalNotesOrDescription' && e.value) {
        selectedAction.description = this.allPortalMessages
          .find((a) => a.list_ID === selectedAction.portalConfiguration.messageList_ID).itemValue;
      }

      // 7 is the action id for portal
      if (e.dataField === 'action' && e.value === 7) {
        if (this.actionDetailPopupVisible) {
          selectedAction.portalScreenList = undefined;
          this.selectablePortalScreens = _.cloneDeep(this.allPortalScreensList);
          this.selectedScreenKeys = [];
          selectedAction.portalDocumentList = undefined;
          this.selectablePortalDocuments = _.cloneDeep(this.allPortalDocumentsList);
          this.selectedDocumentKeys = [];

          const portalConfig = new PortalConfiguration();
          selectedAction.portalConfiguration = portalConfig;
        }
      }

      if (selectedAction.id === 0 && e.dataField === 'action') {
        selectedAction.pauseOnError = selectedAction.action !== PcAction.PauseUserAction;
      }
    }
  }

  onManageSms() {
    this.stompService.openHealthTrackWindow(KnownConfigurationScreen.NotificationManager);
  }

  onManageLetters() {
    this.stompService.openHealthTrackWindow(KnownConfigurationScreen.LetterTemplateManagement);
  }

  onRefreshEmailTemplatesList() {
    this.refreshEmailTemplatesList.emit();
  }

  onRefreshSMSTemplatesList() {
    this.refreshSMSTemplatesList.emit();
  }

  onRefreshLetterTemplatesList() {
    this.refreshLetterTemplatesList.emit();
  }

  moveScreenUpClicked() {
    if (this.selectedPortalScreenKeys?.length > 0) {
      const selectedItem = this.selectedPortalScreenKeys[0] as ListItemDefinition;

      if (selectedItem.displayOrder > 1) {
        const indexBefore = this.selectedAction.portalScreenList
          .findIndex((a) => a.displayOrder === (selectedItem.displayOrder - 1));
        const itemBefore = _.cloneDeep(this.selectedAction.portalScreenList[indexBefore]);
        itemBefore.displayOrder = selectedItem.displayOrder;
        this.selectedAction.portalScreenList[indexBefore] = itemBefore;

        const indexMoved = this.selectedAction.portalScreenList.findIndex((a) => a.list_ID === selectedItem.list_ID);
        const itemMoved = _.cloneDeep(selectedItem);
        itemMoved.displayOrder = selectedItem.displayOrder - 1;
        this.selectedAction.portalScreenList[indexMoved] = itemMoved;
      }
    }
  }

  moveScreenDownClicked() {
    if (this.selectedPortalScreenKeys?.length > 0) {
      const selectedItem = this.selectedPortalScreenKeys[0] as ListItemDefinition;

      if (selectedItem.displayOrder < this.selectedAction.portalScreenList.length) {
        const indexAfter = this.selectedAction.portalScreenList
          .findIndex((a) => a.displayOrder === (selectedItem.displayOrder + 1));
        const itemAfter = _.cloneDeep(this.selectedAction.portalScreenList[indexAfter]);
        itemAfter.displayOrder = selectedItem.displayOrder;
        this.selectedAction.portalScreenList[indexAfter] = itemAfter;

        const indexMoved = this.selectedAction.portalScreenList.findIndex((a) => a.list_ID === selectedItem.list_ID);
        const itemMoved = _.cloneDeep(selectedItem);
        itemMoved.displayOrder = selectedItem.displayOrder + 1;
        this.selectedAction.portalScreenList[indexMoved] = itemMoved;
      }
    }
  }

  onSelectedScreensChanged(e: any) {
    if (!this.newScreensList) {
      this.newScreensList = [];
    }

    const selectedList = e.selectedRowsData as ListItemDefinition[];

    if (selectedList?.length > 0) {
      // add item if not in list already
      selectedList.forEach((item: ListItemDefinition) => {
        if (!this.newScreensList.some((a) => a.list_ID === item.list_ID)) {
          this.newScreensList.push(item);
        }
      });
    }

    const idxToRemove = [];

    // remove from list if de-selected
    this.newScreensList.forEach((item: ListItemDefinition, index: number) => {
      // if not in selected items list and not in original list, remove it
      if (!selectedList.some((a: ListItemDefinition) => a.list_ID === item.list_ID)
        && !this.selectedAction?.portalScreenList?.some((b) => b.list_ID === item.list_ID)) {
        // mark for removal
        idxToRemove.push(index);
      }
    });

    // remove de-selected if any
    if (idxToRemove.length > 0) {
      idxToRemove.forEach((idx: number) => {
        this.newScreensList.splice(idx, 1);
      });
    }
  }

  onAddDocumentClicked() {
    this.selectedDocumentKeys = [];
    this.newDocumentsList = (this.selectedAction.portalDocumentList?.length > 0)
      ? _.cloneDeep(this.selectedAction.portalDocumentList) : [];
    this.selectablePortalDocuments = (this.selectedAction.portalDocumentList?.length > 0)
      ? _.cloneDeep(this.allPortalDocumentsList.filter((a) => !this.selectedAction.portalDocumentList
        .some((b) => b.list_ID === a.list_ID))) : _.cloneDeep(this.allPortalDocumentsList);

    setTimeout(() => {
      this.showSelectDocument = true;
    }, 100);
  }

  onSelectedDocumentsChanged(e: any) {
    if (!this.newDocumentsList) {
      this.newDocumentsList = [];
    }

    const selectedList = e.selectedRowsData as ListItemDefinition[];

    if (selectedList?.length > 0) {
      selectedList.forEach((item) => {
        if (!this.newDocumentsList.some((a) => a.list_ID === item.list_ID)) {
          this.newDocumentsList.push(item);
        }
      });
    }

    const idxToRemove = [];

    this.newDocumentsList.forEach((item: ListItemDefinition, index: number) => {
      if (!selectedList.some((a: ListItemDefinition) => a.list_ID === item.list_ID)
        && !this.selectedAction?.portalDocumentList?.some((b) => b.list_ID === item.list_ID)) {
        idxToRemove.push(index);
      }
    });

    if (idxToRemove.length > 0) {
      idxToRemove.forEach((idx: number) => {
        this.newDocumentsList.splice(idx, 1);
      });
    }
  }

  onConfirmAddDocumentClicked() {
    this.selectedAction.portalDocumentList = this.newDocumentsList;
    this.selectedAction.portalDocumentList = this.selectedAction.portalDocumentList
      .sort((a, b) => a.displayOrder - b.displayOrder);

    this.showSelectDocument = false;

    this.selectedDocumentKeys = [];
    this.newDocumentsList = [];
    this.selectedDocumentKeys = (this.selectedAction.portalDocumentList) ? _.cloneDeep(this.allPortalDocumentsList
      .filter((a) => !this.selectedAction.portalDocumentList.some((b) => b.list_ID === a.list_ID)))
      : _.cloneDeep(this.allPortalDocumentsList);
  }

  onAddScreenClicked() {
    this.selectedScreenKeys = [];
    this.newScreensList = (this.selectedAction.portalScreenList?.length > 0)
      ? _.cloneDeep(this.selectedAction.portalScreenList) : [];
    this.selectablePortalScreens = (this.selectedAction.portalScreenList?.length > 0)
      ? _.cloneDeep(this.allPortalScreensList.filter((a) => !this.selectedAction.portalScreenList
        .some((b) => b.list_ID === a.list_ID))) : _.cloneDeep(this.allPortalScreensList);

    setTimeout(() => {
      this.showSelectScreen = true;
    }, 100);
  }

  onConfirmAddScreenClicked() {
    this.showSelectScreen = false;

    this.selectedAction.portalScreenList = this.newScreensList;
    this.selectedAction.portalScreenList = this.selectedAction.portalScreenList
      .sort((a, b) => a.displayOrder - b.displayOrder);

    for (let index = 0; index < this.selectedAction.portalScreenList.length; index++) {
      this.selectedAction.portalScreenList[index].displayOrder = index + 1;
    }

    this.selectedScreenKeys = [];
    this.newScreensList = [];
    this.selectablePortalScreens = (this.selectedAction.portalScreenList) ? _.cloneDeep(this.allPortalScreensList
      .filter((a) => !this.selectedAction.portalScreenList.some((b) => b.list_ID === a.list_ID)))
      : _.cloneDeep(this.allPortalScreensList);
  }
}
