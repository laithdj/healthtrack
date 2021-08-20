import * as _ from 'lodash';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DxDataGridComponent } from 'devextreme-angular';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import {
  ActionDO,
  APIResponseOfPcManagementDO,
  GetAllListItems,
  LetterTemplateDO,
  ListClient,
  ListItemDefinition,
  ListToQuery,
  PcActionDO,
  PCProgramsClient,
  PCProgramTypeColour,
  ProgramDO,
  ProgramTypeDO,
  ReplyContentTypeDO,
  SelectedBookingTypeDO,
} from '../../../../../../Generated/CoreAPIClient';
import { PatientConnectService } from '../patientconnect.service';
import { ActionVM } from './pc-program-detail/action-viewmodel/action.viewmodel';
import { PcProgramDetailComponent } from './pc-program-detail/pc-program-detail.component';
import { AppState } from '../../app-store/reducers';
import { SetError } from '../../app-store/app-ui-state.actions';

@Component({
  selector: 'app-pc-management',
  templateUrl: './pc-management.component.html',
  styleUrls: ['./pc-management.component.css'],
})

export class PcManagementComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @ViewChild(PcProgramDetailComponent) pcProgramDetails: PcProgramDetailComponent;

  programs: ProgramDO[] = [];
  selectedProgramDO: ProgramDO;
  selectedActions: ActionVM[];
  selectedProgramDOReadOnlyCopy: ProgramDO;
  allReasons: {reason: string, id: number}[];
  allEnabledPrograms: ProgramDO[];
  actionList: PcActionDO[];
  letterTemplates: LetterTemplateDO[];
  smsTemplates: string[] | null;
  emailTemplates: string[] | null;
  programTypes: ProgramTypeDO[];
  bookingTypes: SelectedBookingTypeDO[] | null;
  replyContentList: ReplyContentTypeDO[] | null;
  programTypeColours: PCProgramTypeColour[];
  editMode = false;
  addNewPatientConnectClicked = false;
  allPortalMessages: ListItemDefinition[];
  allPortalScreensList: ListItemDefinition[];
  allPortalDocumentsList: ListItemDefinition[];

  constructor(private titleService: Title, private patientConnectService: PatientConnectService,
    private pcProgramsClient: PCProgramsClient, private store: Store<AppState>, private listClient: ListClient) {
    this.patientConnectService = patientConnectService;
    this.titleService.setTitle('Patient Connect: Actions & Properties Editor');

    const getAllMessages = new GetAllListItems();
    getAllMessages.includeDeleted = false;
    getAllMessages.listToQuery = ListToQuery.List_Core;
    getAllMessages.listGroup = 'PatientConnect';
    getAllMessages.listName = 'PortalMessages';

    this.listClient.getAllListItems(getAllMessages).subscribe((response) => {
      if (response?.errorMessage?.length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.allPortalMessages = response?.data?.results?.filter((a) => a.comment === 'Selectable');
      }
    });

    const getAllScreens = new GetAllListItems();
    getAllScreens.includeDeleted = false;
    getAllScreens.listToQuery = ListToQuery.List_Core;
    getAllScreens.listGroup = 'PatientConnect';
    getAllScreens.listName = 'PortalScreens';

    this.listClient.getAllListItems(getAllScreens).subscribe((response) => {
      if (response?.errorMessage?.length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.allPortalScreensList = response.data.results;
      }
    });

    const getAllDocuments = new GetAllListItems();
    getAllDocuments.includeDeleted = false;
    getAllDocuments.listToQuery = ListToQuery.List_Core;
    getAllDocuments.listGroup = 'PatientConnect';
    getAllDocuments.listName = 'PortalDocuments';

    this.listClient.getAllListItems(getAllDocuments).subscribe((response) => {
      if (response?.errorMessage?.length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.allPortalDocumentsList = response.data.results;
      }
    });
  }

  ngOnInit() {
    this.initialiseProgramsList(null);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initialiseProgramsList(selectedProgramID: number | null) {
    this.pcProgramsClient.getPcManagementData().subscribe((response: APIResponseOfPcManagementDO) => {
      if (response?.errorMessage?.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.programs = response.data.programs;
        this.actionList = response.data.actionList;
        this.letterTemplates = response.data.letterTemplates;
        this.smsTemplates = response.data.smsTemplates;
        this.emailTemplates = response.data.emailTemplates;
        this.replyContentList = response.data.replyContentList;
        this.programTypes = response.data.programTypes;
        this.bookingTypes = response.data.allBookingTypes;
        this.programTypeColours = response.data.programTypeColours;
        this.selectedProgramDO = {
          ...(selectedProgramID
            ? this.selectProgramByID(selectedProgramID, this.programs)
            : this.selectFirstProgramFromList(this.programs)),
        };
        this.selectedActions = this.selectedActions
          ? this.selectedProgramDO.actions.map((a: ActionDO) => new ActionVM(a, this.allPortalMessages,
            this.allPortalDocumentsList, this.allPortalScreensList))
          : [new ActionDO().toJSON()];
        this.selectedProgramDOReadOnlyCopy = _.cloneDeep(this.selectedProgramDO);
        this.allReasons = this.programs.map((r) => ({ reason: r.reason, id: r.id }));
        this.allEnabledPrograms = this.programs.filter((p) => p.enabled === true);
      }
    });
  }

  selectProgramByID(selectedProgramID: number, listedPrograms: ProgramDO[]) {
    this.setProgramListKey(selectedProgramID);
    const selectedProg = listedPrograms.filter((p) => p.id === selectedProgramID);

    return selectedProg.length === 1 ? selectedProg[0] : this.selectFirstProgramFromList(listedPrograms);
  }

  selectFirstProgramFromList(listedPrograms: ProgramDO[]) {
    if (listedPrograms && listedPrograms.length > 0) {
      return listedPrograms.length > 0 ? ({ ...listedPrograms[0] }) : new ProgramDO();
    }

    return this.patientConnectService.createEmptyPatientProgram();
  }

  updateProgramsList(selectedProgramID: number | null) {
    this.initialiseProgramsList(selectedProgramID);
  }

  removeDeletedProgramFromList(deletedProgramID: number) {
    this.programs = this.programs.filter((p) => p.id !== deletedProgramID);
    this.selectedProgramDO = this.selectFirstProgramFromList(this.programs);
  }

  onProgramSelected(e: any) {
    if (e.selectedRowsData && e.selectedRowsData.length === 1) {
      this.selectedProgramDO = { ...e.selectedRowsData[0] };
      this.selectedActions = this.selectedProgramDO.actions.map((a) => new ActionVM(a, this.allPortalMessages,
        this.allPortalDocumentsList, this.allPortalScreensList));
      this.selectedProgramDOReadOnlyCopy = _.cloneDeep(this.selectedProgramDO);
    }
  }

  setProgramListKey(id: number) {
    this.dataGrid.selectedRowKeys = [id];
  }

  gridContentReady() {
    if (this.selectedProgramDO) {
      this.setProgramListKey(this.selectedProgramDO.id);
    }
  }

  refreshEmailTemplates() {
    this.subscription.add(this.patientConnectService.getEmailTemplates().subscribe((response: string[]) => {
      this.emailTemplates = response;
    }));
  }

  refreshSMSTemplates() {
    this.subscription.add(this.patientConnectService.getSMSTemplates().subscribe((response: string[]) => {
      this.smsTemplates = response;
    }));
  }

  refreshLetterTemplates() {
    this.subscription.add(this.patientConnectService.getLetterTemplates().subscribe((response: LetterTemplateDO[]) => {
      this.letterTemplates = response;
    }));
  }

  editModeChanged(e: boolean) {
    this.editMode = e;
  }
}
