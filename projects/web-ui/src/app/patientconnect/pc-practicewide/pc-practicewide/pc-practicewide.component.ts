import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { confirm } from 'devextreme/ui/dialog';
import { Subscription } from 'rxjs';
import {
  ConnectStatus,
  PatientConnectBatchDO,
  PcAction,
  PracticeWideConnectDO,
} from '../../../../../../../Generated/CoreAPIClient';
import { GotoPatientAndArea } from '../../../../../../../Generated/HMS.Interfaces';
import { StompService } from '../../../shared/stomp/stomp.service';
import { PracticeWideService } from '../../practicewide.service';
import { PracticewideFilterComponent } from '../practicewide-filter/practicewide-filter.component';
import { PrintPatientConnectListRequest } from './printPatientConnectListRequest.model';

@Component({
  selector: 'app-pc-practicewide',
  templateUrl: './pc-practicewide.component.html',
  styleUrls: ['./pc-practicewide.component.css'],
})
export class PcPracticewideComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  @ViewChild(PracticewideFilterComponent) filter: PracticewideFilterComponent;

  loadedPatientConnects: PracticeWideConnectDO[];
  queryCount: number;
  showBatchPopup = false;
  selectedCount = 0;
  username = '';
  maxNumberToProcess = 9999;
  note = '';
  export = 'Export';
  print = 'Print';
  complete = 'Complete';
  processAction: string;
  isLiveData = true;
  batchDetail = '';

  constructor(private practiceWideService: PracticeWideService,
    private stompService: StompService,
    private titleService: Title) {
    this.titleService.setTitle('Patient Connect: Action');
  }

  ngOnInit(): void {
    this.practiceWideService.patientConnects.subscribe((connects) => {
      this.loadedPatientConnects = connects;
      this.queryCount = this.loadedPatientConnects.length;
      this.selectedCount = this.loadedPatientConnects.filter((pc) => pc.isSelected).length;
      this.filter.isLoading = false;
    });

    this.subscription = this.practiceWideService.liveDataChanged.subscribe((isLive) => { this.isLiveData = isLive; });
    this.subscription = this.practiceWideService.batchDescriptionChanged.subscribe((desc) => {
      this.batchDetail = desc;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  editorPrepared() {
    this.selectedCount = this.loadedPatientConnects?.filter((pc) => pc.isSelected).length;
  }

  onAllSelected(selected: boolean) {
    this.loadedPatientConnects?.forEach((pc) => {
      pc.isSelected = selected;
    });

    this.selectedCount = this.loadedPatientConnects?.filter((pc) => pc.isSelected).length;
  }

  onGoToPatient(patientConnect: PracticeWideConnectDO) {
    this.stompService.goToPatient(patientConnect.patientId, GotoPatientAndArea.Demographics);
  }

  onGoToPatientConnect(patientConnect: PracticeWideConnectDO) {
    this.stompService.goToPatientConnect(patientConnect.patientId, patientConnect.id);
  }

  pausePatientConnect(pausingConnect: PracticeWideConnectDO) {
    const result = confirm(`This will Pause actions for ${pausingConnect.patientName} on
      the<br/>${pausingConnect.program} Program<br/><br/>No further Programs Actions will occur.<br/><br/>
      Select Yes to Confirm`, 'Pause Program for this Patient');

    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        pausingConnect.connectStatus = ConnectStatus.Paused;
        this.practiceWideService.updatePatientConnect(pausingConnect);
      }
    });
  }

  deletePatientConnect(deleteConnect: PracticeWideConnectDO) {
    const result = confirm(`This will Delete ${deleteConnect.patientName}<br/><br/>
      From the '${deleteConnect.program}' Program<br/><br/>Select Yes to Confirm`,
    'Delete Program From This Patient');

    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        deleteConnect.deleted = true;
        this.practiceWideService.updatePatientConnect(deleteConnect);
      }
    });
  }

  completeCycle(completeConnect: PracticeWideConnectDO) {
    const result = confirm(`${'This will Complete the current Patient Connect Cycle<br/>For '}${
      completeConnect.patientName} on the '${completeConnect.program}' Program<br/><br/>`
      + 'Select Yes to Confirm', 'Complete Cycle');

    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        const connects: PracticeWideConnectDO[] = [];
        connects.push(completeConnect);
        this.practiceWideService.batchCompleteCycles(connects, this.getBatch());
      }
    });
  }

  sendToWorkList(patientConnect: PracticeWideConnectDO) {
    const list: number[] = [];
    list.push(patientConnect.patientId);
    this.stompService.sendToWorkList(list);
  }

  allToWorkList() {
    const list: number[] = [];
    this.loadedPatientConnects.map((pc) => {
      list.push(pc.patientId);
      return pc;
    });

    this.stompService.sendToWorkList(list);
  }

  selectedToWorkList() {
    const patientIds: number[] = this.loadedPatientConnects.filter((pc) => pc.isSelected).map((pc) => pc.patientId);
    this.stompService.sendToWorkList(patientIds);
  }

  cancelBatchPopUp() {
    this.showBatchPopup = false;
  }

  openPatientConnect(e: any) {
    const component = this;
    const compEvent = e.component;
    const prevClickTime = compEvent.lastClickTime;
    compEvent.lastClickTime = new Date();

    if (e.data) {
      if (prevClickTime && (compEvent.lastClickTime - prevClickTime < 300)) {
        component.onGoToPatientConnect(e.data as PracticeWideConnectDO);
      }
    }
  }

  onContextMenuPreparing(e: any) {
    if (e.row.rowType === 'data') {
      const component = this;

      e.items = [{
        text: 'Go To Patient',
        onItemClick() {
          component.onGoToPatient(e.row.data as PracticeWideConnectDO);
        },
      }, {
        text: 'Open Patient Connect',
        onItemClick() {
          component.onGoToPatientConnect(e.row.data as PracticeWideConnectDO);
        },
      }, {
        beginGroup: true,
        text: 'Print Preview',
        disabled: (component.filter.filter.action !== PcAction.LetterToPatient
            && component.filter.filter.action !== PcAction.LetterToGP),
        onItemClick() {
          const pcidParam: number = +e.row.data.id;
          component.practiceWideService.mailMergePrint([pcidParam], false, undefined, undefined);
        },
      }, {
        beginGroup: true,
        text: 'Complete This Cycle',
        onItemClick() {
          component.completeCycle(e.row.data as PracticeWideConnectDO);
        },
      }, {
        text: 'Pause Program',
        onItemClick() {
          component.pausePatientConnect(e.row.data as PracticeWideConnectDO);
        },
      }, {
        text: 'Delete From Program',
        onItemClick() {
          component.deletePatientConnect(e.row.data as PracticeWideConnectDO);
        },
      }, {
        beginGroup: true,
        text: 'Send To Worklist',
        onItemClick() {
          component.sendToWorkList(e.row.data as PracticeWideConnectDO);
        },
      }, {
        text: 'All To Worklist',
        onItemClick() {
          component.allToWorkList();
        },
      }];
    }
  }

  onExportData() {
    const patientConnects = this.loadedPatientConnects.filter((pc) => pc.isSelected);
    const pcsExport: number[] = patientConnects.map((pc) => pc.id);

    if (this.isLiveData) {
      this.practiceWideService.nextActionPatientConnects(patientConnects, this.getBatch());
    }

    this.stompService.exportPatientConnects(pcsExport);
  }

  onPrintLetters() {
    let patientConnects = this.loadedPatientConnects.filter((pc) => pc.isSelected);

    if (patientConnects.length > this.maxNumberToProcess) {
      patientConnects = patientConnects.slice(0, this.maxNumberToProcess);
    }

    this.practiceWideService.mailMergePrint(patientConnects.map((pc) => pc.id), this.isLiveData,
      patientConnects, this.getBatch());
  }

  getBatch(): PatientConnectBatchDO {
    const batch = new PatientConnectBatchDO();
    batch.note = this.note;
    batch.userCreated = this.username;
    batch.programId = this.filter.filter.programId;
    batch.attendingMOId = this.filter.filter.attendingMOId;
    batch.locationId = this.filter.filter.locationId;

    return batch;
  }

  onCompleteConnects(): any {
    this.practiceWideService.batchCompleteCycles(
      this.loadedPatientConnects.filter((pc) => pc.isSelected), this.getBatch());
  }

  onProcessing() {
    this.showBatchPopup = false;
    if (this.processAction === this.export) {
      this.onExportData();
    }
    if (this.processAction === this.print) {
      this.onPrintLetters();
    }
    if (this.processAction === this.complete) {
      this.onCompleteConnects();
    }
    if (this.isLiveData) {
      this.practiceWideService.updateFilter(this.filter.filter);
    }
  }

  onProcessConfirm(e: string) {
    if (!this.loadedPatientConnects) {
      return;
    }

    this.username = this.practiceWideService.username;
    this.selectedCount = this.loadedPatientConnects.filter((pc) => pc.isSelected).length;
    this.note = this.getDefaultNote(e);
    this.showBatchPopup = true;
  }

  getDefaultNote(e: string): string {
    if (e === this.export) {
      this.processAction = this.export;
      return 'Export Merge File (csv)';
    }
    if (e === this.print) {
      this.processAction = this.print;
      return 'Printing Letters';
    }
    if (e === this.complete) {
      this.processAction = this.complete;
      return 'Completing Current Cycle';
    }
    return '';
  }

  onPrintList() {
    const pcsToPrint: number[] = this.loadedPatientConnects.filter((pc) => pc.isSelected).map((pc) => pc.id);
    const printPatientConnectListRequest = new PrintPatientConnectListRequest(
      pcsToPrint, this.practiceWideService.lastFilter);
    this.stompService.openPatientConnectList(printPatientConnectListRequest);
  }
}
