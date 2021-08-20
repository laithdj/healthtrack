import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import {
  PCPracticeWideClient,
  PatientConnectFilterDO,
  PatientConnectBatchDO,
  PracticeWideConnectDO,
  PracticeWideBatchDO,
  APIResponseOfIEnumerableOfString,
  BatchFilterDO,
  APIResponseOfIEnumerableOfPatientConnectBatchDO,
  APIResponseOfDateTime,
  IAPIResponseOfIEnumerableOfPracticeWideConnectDO,
  APIResponseOfBoolean,
} from '../../../../../Generated/CoreAPIClient';
import { AppState } from '../app-store/reducers';
import { selectUserName } from '../app-store/app-ui.selectors';
import { StompService } from '../shared/stomp/stomp.service';
import {
  PatientConnectMailMergeRequest,
  SendPatientConnectLetterMessage,
} from '../../../../../Generated/HMS.Interfaces';
import { SetError } from '../app-store/app-ui-state.actions';

@Injectable()
export class PracticeWideService implements OnDestroy {
  private currentBatches: PatientConnectBatchDO[];

  patientConnects = new Subject<PracticeWideConnectDO[]>();
  lastFilter: PatientConnectFilterDO;
  liveDataChanged = new Subject<boolean>();
  batchDescriptionChanged = new Subject<string>();
  username = '';
  fromDate = new Subject<Date>();
  subscription = new Subscription();
  pcsForPrinting: PracticeWideConnectDO[];
  batch: PatientConnectBatchDO;

  constructor(private practiceWideClient: PCPracticeWideClient,
    private appUiStore: Store<AppState>,
    private stompService: StompService) {
    this.practiceWideClient.getOldestNextConnectDue().subscribe(
      (response: APIResponseOfDateTime) => this.fromDate.next(response.data));
    this.appUiStore.pipe(take(1), select(selectUserName)).subscribe((username) => { this.username = username; });

    setTimeout(() => {
      this.sendLetterMessage();
    }, 6000);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  sendLetterMessage() {
    if (this.stompService?.client?.connected) {
      this.stompService.client.subscribe(`/exchange/HMS.MQ.Request.SendPatientConnectLetterMessage:HMS.Interfaces/${
        this.stompService.webSessionId}`, (d) => {
        const received = new SendPatientConnectLetterMessage();
        received.init(JSON.parse(d.body));

        if (received && received.data) {
          const byteCharacters = atob(received.data);
          const byteNumbers = new Array(byteCharacters.length);

          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          const newBlob = new Blob([byteArray], { type: received.mimeType });
          const data = window.URL.createObjectURL(newBlob);
          const link = document.createElement('a');
          link.href = data;
          link.target = '_blank';

          if (received.mimeType !== 'application/pdf') { // PDFs can be opened in browser
            link.download = received.filename;
            // If filename is specified this downloads rather than opening a new window (chrome)
          }
          link.click();
        } else {
          console.log('Reply content is null.');
        }
      });
    }
  }

  mailMergePrint(patientConnectIds: number[], moveToNextCycle: boolean,
    patientConnects: PracticeWideConnectDO[], batch: PatientConnectBatchDO) {
    this.pcsForPrinting = patientConnects;
    this.batch = batch;
    const messageType = 'HMS.Interfaces.PatientConnectMailMergeRequest:HMS.Interfaces';
    const headersObj = { 'content-type': 'application/json', type: messageType };
    const exportOptions = new PatientConnectMailMergeRequest();
    exportOptions.patientConnectIds = patientConnectIds;
    exportOptions.replyToTopic = this.stompService.webSessionId;
    exportOptions.moveToNextCycle = moveToNextCycle;

    if (moveToNextCycle === true) {
      const client = this.practiceWideClient;
      const { lastFilter } = this;
      const service = this;
      this.stompService.client.subscribe(`/exchange/HMS.MQ.Request.SendPatientConnectLetterMessage:HMS.Interfaces/${
        this.stompService.webSessionId}`, (d) => {
        const received = new SendPatientConnectLetterMessage();
        received.init(JSON.parse(d.body));
        if (received && received.data) {
          if (received.moveToNextCycle === true) {
            if (patientConnects) {
              batch.userCreated = this.username;
              const batchToProcess = new PracticeWideBatchDO();
              batchToProcess.practiceWideConnects = patientConnects;
              batchToProcess.batch = batch;
              client.nextActionPatientConnects(batchToProcess, this.username)
                .subscribe(() => service.updateFilter(lastFilter));
            }
          }
        } else {
          console.log('Reply content is null.');
        }
      });
    }

    this.stompService.client.send(`/exchange/${messageType}/${this.stompService.commsId}`,
      headersObj, JSON.stringify(exportOptions));
  }

  updateFilter(filter: PatientConnectFilterDO) {
    if (!filter.dueFrom) {
      return;
    }

    this.lastFilter = filter;
    this.liveDataChanged.next(true);

    this.practiceWideClient.getAllPatientConnects(filter).subscribe((connects) => {
      this.patientConnects.next(connects.data);
    });
  }

  updatePatientConnect(patientConnect: PracticeWideConnectDO) {
    if (!patientConnect) {
      this.appUiStore.dispatch(new SetError({ errorMessages: ['No selected patient connect to update'] }));
    } else {
      this.practiceWideClient.savePatientConnect(patientConnect, this.username)
        .subscribe((response: APIResponseOfBoolean) => {
          if (response?.errorMessage?.length > 0) {
            this.appUiStore.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
          } else if (this.lastFilter) {
            this.updateFilter(this.lastFilter);
          }
        });
    }
  }

  batchCompleteCycles(patientConnects: PracticeWideConnectDO[], batch: PatientConnectBatchDO) {
    if (!patientConnects) {
      this.appUiStore.dispatch(new SetError({ errorMessages: ['No selected patient connect to complete cycle'] }));
    } else {
      batch.userCreated = this.username;
      const batchToProcess = new PracticeWideBatchDO();
      batchToProcess.practiceWideConnects = patientConnects;
      batchToProcess.batch = batch;

      this.practiceWideClient.batchCompleteCycles(batchToProcess, this.username)
        .subscribe((response: IAPIResponseOfIEnumerableOfPracticeWideConnectDO) => {
          if (response?.errorMessage?.length > 0) {
            this.appUiStore.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
          } else {
            if (response?.data?.length > 0) {
              const errorArray = ['Unable to process these Patient Connects'];

              response.data.forEach((patientConnect: PracticeWideConnectDO) => {
                const errorString = `${patientConnect.program} - ${patientConnect.patientName}`;
                errorArray.push(errorString);
              });

              this.appUiStore.dispatch(new SetError({ errorMessages: errorArray }));
            }
            if (this.lastFilter) {
              this.updateFilter(this.lastFilter);
            }
          }
        });
    }
  }

  nextActionPatientConnects(patientConnects: PracticeWideConnectDO[], batch: PatientConnectBatchDO) {
    if (!patientConnects) {
      this.appUiStore.dispatch(new SetError({ errorMessages: ['No selected patient connects to process'] }));
    } else {
      batch.userCreated = this.username;
      const batchToProcess = new PracticeWideBatchDO();
      batchToProcess.practiceWideConnects = patientConnects;
      batchToProcess.batch = batch;

      this.practiceWideClient.nextActionPatientConnects(batchToProcess, this.username)
        .subscribe((response: IAPIResponseOfIEnumerableOfPracticeWideConnectDO) => {
          if (response?.errorMessage?.length > 0) {
            this.appUiStore.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
          } else {
            if (response?.data?.length > 0) {
              const errorArray = ['Unable to process these Patient Connects'];

              response.data.forEach((patientConnect: PracticeWideConnectDO) => {
                const errorString = `${patientConnect.program} - ${patientConnect.patientName}`;
                errorArray.push(errorString);
              });

              this.appUiStore.dispatch(new SetError({ errorMessages: errorArray }));
            }
            if (this.lastFilter) {
              this.updateFilter(this.lastFilter);
            }
          }
        });
    }
  }

  getUserLists(): Observable<string[]> {
    return this.practiceWideClient.getBatchUserNames()
      .pipe(map((response: APIResponseOfIEnumerableOfString) => response.data, (err) => console.log(err)));
  }

  getBatches(filter: BatchFilterDO): Observable<PatientConnectBatchDO[]> {
    if (filter.user === 'All') {
      filter.user = '';
    }

    return this.practiceWideClient.getPatientConnectBatches(filter)
      .pipe(map((response: APIResponseOfIEnumerableOfPatientConnectBatchDO) => {
        this.currentBatches = response.data;
        return this.currentBatches;
      }, (err) => console.log(err)));
  }

  loadBatch(batchId: number) {
    return this.practiceWideClient.getPatientConnectByBatchId(batchId)
      .subscribe((connects) => {
        this.liveDataChanged.next(false);
        const currentBatch = this.currentBatches.find((b) => b.id === batchId);
        this.batchDescriptionChanged.next(currentBatch.details);
        this.patientConnects.next(connects.data);
      });
  }
}
