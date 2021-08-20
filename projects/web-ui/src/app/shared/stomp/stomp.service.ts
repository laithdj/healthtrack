import * as Stomp from 'stompjs';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { custom } from 'devextreme/ui/dialog';
import {
  KnownConfigurationScreen, GotoPatientAndArea, SendFileMessage, PrintReportRequest, PatientConnectExportRequest,
  EquipmentTrackingScreen, EquipmentManagementScreen,
} from '../../../../../../Generated/HMS.Interfaces';
import { RetrieveDataForTokenResult } from '../../../../../../Generated/CoreAPIClient';
// eslint-disable-next-line max-len
import { PrintPatientConnectListRequest } from '../../patientconnect/pc-practicewide/pc-practicewide/printPatientConnectListRequest.model';
import { NotificationService } from '../notification-service';
import { AppUiState } from '../../app-store/app-ui-state.reducer';
import { SetError } from '../../app-store/app-ui-state.actions';

@Injectable()
export class StompService {
  public client: any;
  public clientId = 'user.PUTUSERNAMEHERE.';
  public webSessionId = 'any';
  public commsId = 'comms.';

  constructor(private notificationService: NotificationService, private store: Store<AppUiState>) { }

  setupWebSubscriptions(webSessionIdToUse: string, tokenResult: RetrieveDataForTokenResult) {
    const { stompDetails } = tokenResult;
    // Connect to stomp service
    this.clientId = tokenResult.username;
    this.client = Stomp.client(stompDetails.url);
    this.client.heartbeat.outgoing = 30000;
    this.client.heartbeat.incoming = 30000;
    // console.log(stompDetails);
    // console.log('STOMP ', stompDetails.user, stompDetails.password, stompDetails.vHost);
    // this.client.debug = null; // Comment out to enable debugging.
    this.webSessionId = webSessionIdToUse;
    this.client.connect(stompDetails.user, stompDetails.password, null, null, stompDetails.vHost);

    setTimeout(() => {
      this.validateComms(webSessionIdToUse, tokenResult);
      this.configOnConnect();
    }, 5000);
  }
  validateComms(webSessionIdToUse: string, tokenResult: RetrieveDataForTokenResult) {
    const myDialog = custom({
      title: 'Connection Error',
      messageHtml: 'Unable to connect to the HealthTrack Server.',
      buttons: [{
        text: 'Try Again',
        onClick: () => ({ value: true }),
      },
      {
        text: 'Close',
        onClick: () => ({ value: false }),
      },
      ],
    });
    if (this.client) {
      if (!this.client.connected) {
        myDialog.show().then((dialogResult) => {
          if (dialogResult.value) {
            this.setupWebSubscriptions(webSessionIdToUse, tokenResult);
          } else {
            window.close();
          }
        });
      }
    } else {
      myDialog.show().then((dialogResult) => {
        if (dialogResult.value) {
          this.setupWebSubscriptions(webSessionIdToUse, tokenResult);
        } else {
          window.close();
        }
      });
    }
  }

  configOnConnect() {
    const { notificationService } = this;
    // console.log('adding subscriptions for webSessionId: ' + this.webSessionId);
    // eslint-disable-next-line max-len
    this.client.subscribe(`/exchange/HMS.MQ.Common.Persistent.JobNotificationMessage:HMS.Interfaces/${this.webSessionId}`,
      (d) => {
        // console.log(d);
        notificationService.broadcastJobNotificationJson(d.body);
      },
    );

    this.client.subscribe(`/exchange/HMS.MQ.Request.SendFileMessage:HMS.Interfaces/${this.webSessionId}`, (d) => {
      const received = new SendFileMessage();
      received.init(JSON.parse(d.body));
      // console.log('STOMP RECEIVED', received);
      if (received && received.data) {
        // console.log(received.filename + ' / ' + received.mimeType);
        // console.log('length of data: ' + received.data.length);

        const byteCharacters = atob(received.data);
        const byteNumbers = new Array(byteCharacters.length);

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        // console.log('length of byteArray: ' + byteArray.length);

        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([byteArray], { type: received.mimeType });
        // console.log(newBlob);

        // IE doesn't allow using a blob object directly as link href
        // instead it is necessary to use msSaveOrOpenBlob
        // if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        //    window.navigator.msSaveOrOpenBlob(newBlob);
        //    return;
        // }

        // For other browsers:
        // Create a link pointing to the ObjectURL containing the blob.
        const data = window.URL.createObjectURL(newBlob);

        const link = document.createElement('a');
        link.href = data;
        link.target = '_blank';
        if (received.mimeType !== 'application/pdf') { // PDFs can be opened in browser
          // If filename is specified this downloads rather than opening a new window (chrome)
          link.download = received.filename;
        }
        link.click();
      } else {
        // console.log('Reply content is null.');
      }
    });
  }

  openHealthTrackWindow(windowId: KnownConfigurationScreen) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.OpenKnownConfigurationScreenMessage:HMS.MessageHandler',
    };
    const htMessage = { screen: windowId };

    // eslint-disable-next-line max-len
    this.client.send(`/exchange/HMS.MessageHandler.OpenKnownConfigurationScreenMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  openNewRequest() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoNewRequestMessage:HMS.MessageHandler',
    };
    const htMessage = {};

    // eslint-disable-next-line max-len
    this.client.send(`/exchange/HMS.MessageHandler.GotoNewRequestMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToPatient(patientId: number, area: GotoPatientAndArea) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoPatientMessage:HMS.MessageHandler',
    };
    const htMessage = {
      Patient_ID: patientId,
      Area: area,
    };

    this.client.send(`/exchange/HMS.MessageHandler.GotoPatientMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToPatientConnect(patientId: number, pcid: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoPatientConnectMessage:HMS.MessageHandler',
    };
    const htMessage = {
      Patient_ID: patientId,
      PatientConnect_ID: pcid,
    };

    this.client.send(`/exchange/HMS.MessageHandler.GotoPatientConnectMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToPatientConnectPracticeWide() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoPatientConnectPracticeWideMessage:HMS.MessageHandler',
    };
    const htMessage = {
      working: true,
    };

    // eslint-disable-next-line max-len
    this.client.send(`/exchange/HMS.MessageHandler.GotoPatientConnectPracticeWideMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToIncomingMatching() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoIncomingMatchingMessage:HMS.MessageHandler',
    };
    const htMessage = {
      working: true,
    };

    this.client.send(`/exchange/HMS.MessageHandler.GotoIncomingMatchingMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToTransactionViewer(transactionId: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoEquipmentTransactionViewerMessage:HMS.MessageHandler',
    };
    const htMessage = {
      Transaction_ID: transactionId,
    };

    // eslint-disable-next-line max-len
    this.client.send(`/exchange/HMS.MessageHandler.GotoEquipmentTransactionViewerMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToTaskList() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoTaskListMessage:HMS.MessageHandler',
    };
    const htMessage = {
    };

    this.client.send(`/exchange/HMS.MessageHandler.GotoTaskListMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToIncomingRSD() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoIncomingRSDMessage:HMS.MessageHandler',
    };
    const htMessage = {
    };
    // console.log('open Transaction Viewer' + transactionId);
    this.client.send(`/exchange/HMS.MessageHandler.GotoIncomingRSDMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToDocumentManagement(areaToGoto: string, relevantContainerID: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoDocumentManagementMessage:HMS.MessageHandler',
    };
    const htMessage = {
      AreaToGoto: areaToGoto,
      RelevantContainer_ID: relevantContainerID,
    };
    this.client.send(`/exchange/HMS.MessageHandler.GotoDocumentManagementMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToBillingWorksheet() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoBillingWorksheetMessage:HMS.MessageHandler',
    };
    const htMessage = {
      Working: true,
    };
    this.client.send(`/exchange/HMS.MessageHandler.GotoBillingWorksheetMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  subscribeLocations(username: string) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GetUserLocationsAndDoctorsMessage:HMS.MessageHandler',
    };
    const htMessage = {
      username,
    };
    this.client.send(`/exchange/HMS.MessageHandler.GetUserLocationsAndDoctorsMessage:HMS.MessageHandler/${
      this.clientId}`, headersObj, JSON.stringify(htMessage));
  }

  goToLocationDiary(roomID: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoLocationDiaryMessage:HMS.MessageHandler',
    };
    const htMessage = {
      roomID,
    };
    this.client.send(`/exchange/HMS.MessageHandler.GotoLocationDiaryMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToDiaryDoctor(day: number, doctorID: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoDiaryDoctorMessage:HMS.MessageHandler',
    };
    const htMessage = {
      day,
      doctorID,
    };

    this.client.send(`/exchange/HMS.MessageHandler.GotoDiaryDoctorMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }







  goToPatientWorkList(fromDate: Date, dateRange: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoPatientWorklistMessage:HMS.MessageHandler',
    };
    const htMessage = {
      fromDate,
      dateRange,
    };

    this.client.send(`/exchange/HMS.MessageHandler.GotoPatientWorklistMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToTriage() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoTriageMessage:HMS.MessageHandler',
    };
    const htMessage = {
    };

    this.client.send(`/exchange/HMS.MessageHandler.GotoTriageMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }
  
  goToMessengerSelectTargetUsers() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoMessengerSelectTargetUsersMessage:HMS.MessageHandler',
    };
    const htMessage = {
      working: true,
    };

    // eslint-disable-next-line max-len
    this.client.send(`/exchange/HMS.MessageHandler.GotoMessengerSelectTargetUsersMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToEquipmentTrackingScreen(screen: EquipmentTrackingScreen, transactionId: number,
    equipmentId: number, patientId: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoEquipmentTrackingScreenMessage:HMS.MessageHandler',
    };
    const htMessage = {
      Screen: screen,
      TransactionID: transactionId,
      PatientID: patientId,
      EquipmentID: equipmentId,
    };

    // eslint-disable-next-line max-len
    this.client.send(`/exchange/HMS.MessageHandler.GotoEquipmentTrackingScreenMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToEquipmentManagementScreen(screen: EquipmentManagementScreen, equipmentId: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoEquipmentManagementScreenMessage:HMS.MessageHandler',
    };
    const htMessage = {
      Screen: screen,
      equipmentId,
    };

    // eslint-disable-next-line max-len
    this.client.send(`/exchange/HMS.MessageHandler.GotoEquipmentManagementScreenMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToProductManagementScreen(screen: EquipmentManagementScreen) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoEquipmentManagementScreenMessage:HMS.MessageHandler',
    };
    const htMessage = {
      Screen: screen,
      // 'equipmentId': equipmentId
    };

    // eslint-disable-next-line max-len
    this.client?.send(`/exchange/HMS.MessageHandler.GotoEquipmentManagementScreenMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToCompanyManager() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoCompanyManagerMessage:HMS.MessageHandler',
    };
    const htMessage = {
      test: 1,
    };
    this.client?.send(`/exchange/HMS.MessageHandler.GotoCompanyManagerMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToDashboard(dashboardId: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoDashboardMessage:HMS.MessageHandler',
    };
    const htMessage = {
      dashboardId,
    };

    this.client?.send(`/exchange/HMS.MessageHandler.GotoDashboardMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  goToInvoice(claimId: number, invoiceType: string) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoInvoiceMessage:HMS.MessageHandler',
    };
    const htMessage = {
      claimId,
      invoiceType,
    };

    if (this.client) {
      this.client.send(`/exchange/HMS.MessageHandler.GotoInvoiceMessage:HMS.MessageHandler/${this.clientId}`,
        headersObj, JSON.stringify(htMessage));
    } else {
      this.store.dispatch(new SetError({
        errorMessages: ['Unable to generate Invoice, connection to'
        + ' the HealthTrack comms service could not be established.'],
      }));
    }
  }

  viewInvoice(claimId: number, invoiceType: string) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.ViewInvoiceMessage:HMS.MessageHandler',
    };
    const htMessage = {
      claimId,
      invoiceType,
    };

    if (this.client) {
      this.client.send(`/exchange/HMS.MessageHandler.ViewInvoiceMessage:HMS.MessageHandler/${this.clientId}`,
        headersObj, JSON.stringify(htMessage));
    } else {
      this.store.dispatch(new SetError({
        errorMessages: ['Unable to view Invoice, connection to'
        + ' the HealthTrack Comms Service could not be established.'],
      }));
    }
  }

  goToAngularScreen(screen: string, parameters: string[]) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoAngularScreenMessage:HMS.MessageHandler',
    };
    const htMessage = {
      screenName: screen,
      parameters,
    };

    if (this.client) {
      this.client.send(`/exchange/HMS.MessageHandler.GotoAngularScreenMessage:HMS.MessageHandler/${this.clientId}`,
        headersObj, JSON.stringify(htMessage));
    } else {
      this.store.dispatch(new SetError({
        errorMessages: ['Unable to connect to HealthTrack Comms Service.'],
      }));
    }
  }

  addTask(patientId: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.NewTaskMessage:HMS.MessageHandler',
    };
    const htMessage = {
      Patient_ID: patientId,
    };

    this.client?.send(`/exchange/HMS.MessageHandler.NewTaskMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  sendToWorkList(patientIds: number[]) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.SendToWorkListMessage:HMS.MessageHandler',
    };
    const htMessage = {
      patientIds,
    };

    this.client?.send(`/exchange/HMS.MessageHandler.SendToWorkListMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  closeClinicalRecord(containerId: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.SaveWebClinicalRecordMessage:HMS.MessageHandler',
    };
    const htMessage = {
      containerId,
    };

    this.client?.send(`/exchange/HMS.MessageHandler.SaveWebClinicalRecordMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
  }

  CancelClinicalRecord(containerId: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.CancelWebClinicalRecordMessage:HMS.MessageHandler',
    };
    const htMessage = {
      containerId,
    };

    if (this.client) {
      // eslint-disable-next-line max-len
      this.client?.send(`/exchange/HMS.MessageHandler.CancelWebClinicalRecordMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
    } else {
      this.showClientError();
  }
  }

  deleteClinicalRecord() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.DeleteWebClinicalRecordMessage:HMS.MessageHandler',
    };
    const htMessage = {
      formName: '',
    };

    if (this.client) {
      // eslint-disable-next-line max-len
    this.client.send(`/exchange/HMS.MessageHandler.DeleteWebClinicalRecordMessage:HMS.MessageHandler/${this.clientId}`,
      headersObj, JSON.stringify(htMessage));
    } else {
      this.showClientError();
  }
  }

  openPatientConnectList(pcListRequest: PrintPatientConnectListRequest) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.Interfaces.PrintReportRequest:HMS.Interfaces',
    };

    const printOptions = new PrintReportRequest();
    printOptions.pGroup = 'PatientConnect';
    printOptions.pSet = 'PatientConnectList';
    printOptions.converter = 'PatientConnectList';
    printOptions.argsAsJSON = JSON.stringify(pcListRequest);
    printOptions.replyToTopic = this.webSessionId;

    if (this.client) {
      this.client?.send(`/exchange/HMS.Interfaces.PrintReportRequest:HMS.Interfaces/${
      this.commsId}`, headersObj, JSON.stringify(printOptions));
    } else {
      this.showClientError();
  }
  }

  exportPatientConnects(patientConnectIds: number[]) {
    const messageType = 'HMS.Interfaces.PatientConnectExportRequest:HMS.Interfaces';
    const headersObj = { 'content-type': 'application/json', type: messageType };
    const exportOptions = new PatientConnectExportRequest();
    exportOptions.patientConnectIds = patientConnectIds;
    exportOptions.replyToTopic = this.webSessionId;

    if (this.client) {
      this.client?.send(`/exchange/${messageType}/${this.commsId}`, headersObj, JSON.stringify(exportOptions));
    } else {
      this.showClientError();
  }
}

  printPriorApprovalForm(claimId: number) {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.PrintNZPriorApprovalFormMessage:HMS.MessageHandler',
    };
    const htMessage = {
      claimId,
    };

    if (this.client) {
      this.client.send(`/exchange/HMS.MessageHandler.PrintNZPriorApprovalFormMessage:HMS.MessageHandler/${
        this.clientId}`, headersObj, JSON.stringify(htMessage));
    } else {
      this.showClientError();
    }
  }

  showClientError() {
    this.store.dispatch(new SetError({
      errorMessages: ['Unable to connect to HealthTrack Comms Service.'],
    }));
  }
}
