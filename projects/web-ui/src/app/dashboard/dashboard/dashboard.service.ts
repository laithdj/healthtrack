import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  DashboardDataMessage,
  DashboardWidget,
  DashboardSubscriptionRequest,
} from '../../../../../../Generated/HMS.Interfaces';
import { StompService } from '../../shared/stomp/stomp.service';
import { WidgetConfiguration } from '../../../../../../Generated/CoreAPIClient';
import { DoctorDiaryData } from '../../shared/models/Dashboard/DoctorDiaryData';
import { LocationDiaryData } from '../../shared/models/Dashboard/LocationDiaryData';
import { TasksData } from '../../shared/models/Dashboard/TasksData';
import { InternalReviewData } from '../../shared/models/Dashboard/InternalReviewData';
import { DocumentsData } from '../../shared/models/Dashboard/DocumentsData';
import { ClinicalRecordsData } from '../../shared/models/Dashboard/ClinicalRecordsData';
import { IncomingData } from '../../shared/models/Dashboard/IncomingData';
import { IncomingMatchingData } from '../../shared/models/Dashboard/IncomingMatchingData';
import { IncomingRSDData } from '../../shared/models/Dashboard/IncomingRSDData';
import { ManualMatchingData } from '../../shared/models/Dashboard/ManualMatchingData';
import { DistributionListData } from '../../shared/models/Dashboard/DistributionListData';

@Injectable()
export class DashboardService {
  private _diaryData = new Subject<DoctorDiaryData>();
  diaryData$ = this._diaryData.asObservable();
  private _tasksData = new Subject<TasksData>();
  tasksData$ = this._tasksData.asObservable();
  private _internalReviewData = new Subject<InternalReviewData>();
  internalReviewData$ = this._internalReviewData.asObservable();
  private _documentsData = new Subject<DocumentsData>();
  documentsData$ = this._documentsData.asObservable();
  private _clinicalRecordsData = new Subject<ClinicalRecordsData>();
  clinicalRecordsData$ = this._clinicalRecordsData.asObservable();
  private _incomingData = new Subject<IncomingData>();
  incomingData$ = this._incomingData.asObservable();
  private _incomingMatchingData = new Subject<IncomingMatchingData>();
  incomingMatchingData$ = this._incomingMatchingData.asObservable();
  private locationDiaryDataArray: LocationDiaryData[] = [];
  private _locationDiaryDataArray = new Subject<Array<LocationDiaryData>>();
  locationDiaryDataArray$ = this._locationDiaryDataArray.asObservable();
  private _incomingRSDData = new Subject<IncomingRSDData>();
  incomingRSDData$ = this._incomingRSDData.asObservable();
  private _manualMatchingData = new Subject<ManualMatchingData>();
  manualMatchingData$ = this._manualMatchingData.asObservable();
  private _distributionListData = new Subject<DistributionListData>();
  distributionListData$ = this._distributionListData.asObservable();

  constructor(private stompService: StompService) { }

  // for each widget attempt to subscribe using the widget config
  requestDashboardSubscriptions(dashboardContents: string[][], widgetConfigurations: WidgetConfiguration[]): void {
    dashboardContents.forEach((row) => {
      row.forEach((widget) => {
        if (widget !== DashboardWidget.LocationDiary) {
          const widgetConfiguration = widgetConfigurations.find((w) => w.widget === widget);
          this.subscribeWidget(widgetConfiguration);
          this.sendWidgetSubscriptionRequest(widgetConfiguration);
        }
      });
    });

    widgetConfigurations.filter((config) => config.widget === DashboardWidget.LocationDiary)
      .forEach((req) => {
        this.subscribeWidget(req);
        this.sendWidgetSubscriptionRequest(req);
      });
  }

  sendWidgetSubscriptionRequest(widgetConfig: WidgetConfiguration) {
    if (widgetConfig === undefined) { return; }
    console.log('WIDGET SUB REQUEST', widgetConfig);
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MQ.Request.DashboardSubscriptionRequest:HMS.Interfaces',
    };
    const subRequest = new DashboardSubscriptionRequest();
    subRequest.widgetName = widgetConfig.widget;
    subRequest.parameters = widgetConfig.widgetParameters;

    if (this.stompService?.client) {
      this.stompService.client.send(`/exchange/HMS.MQ.Request.DashboardSubscriptionRequest:HMS.Interfaces/${
        this.stompService.commsId}`, headersObj, JSON.stringify(subRequest));
    } else {
      setTimeout(() => {
        this.sendWidgetSubscriptionRequest(widgetConfig);
      }, 5000);

      console.log('sendWidgetSubscriptionRequest try to connect to rabbit again');
    }
  }

  // subscribe to a widget's topic if there is widget config, otherwise do nothing
  subscribeWidget(widgetConfig: WidgetConfiguration) {
    if (widgetConfig === undefined) { return; }

    if (this.stompService?.client) {
      this.stompService.client.subscribe(`/exchange/HMS.MQ.Request.DashboardDataMessage:HMS.Interfaces/${
        widgetConfig.rabbitTopic}`, (p: any) => {
        const dashboardMessage: DashboardDataMessage = JSON.parse(p.body);

        const dbWidget: DashboardWidget = <DashboardWidget> dashboardMessage.widget;
        switch (dbWidget) {
          case (DashboardWidget.Diary): {
            this._diaryData.next(new DoctorDiaryData(dashboardMessage.data));
            // console.log('DIARY DATA UPDATED ', this._diaryData);
            break;
          }
          case (DashboardWidget.Tasks): {
            this._tasksData.next(new TasksData(dashboardMessage.data));
            // console.log('TASKS DATA UPDATED ', this._tasksData);
            break;
          }
          case (DashboardWidget.InternalReview): {
            this._internalReviewData.next(new InternalReviewData(dashboardMessage.data));
            // console.log('INTERNAL REVIEW DATA UPDATED ', this._internalReviewData);
            break;
          }
          case (DashboardWidget.Documents): {
            this._documentsData.next(new DocumentsData(dashboardMessage.data));
            // console.log('DOCUMENTS DATA UPDATED ', this._documentsData);
            break;
          }
          case (DashboardWidget.ClinicalRecords): {
            this._clinicalRecordsData.next(new ClinicalRecordsData(dashboardMessage.data));
            // console.log('CLINICAL RECORDS DATA UPDATED ', this._clinicalRecordsData);
            break;
          }
          case (DashboardWidget.Incoming): {
            this._incomingData.next(new IncomingData(dashboardMessage.data));
            // console.log('INCOMING DATA UPDATED ', this._incomingData);
            break;
          }
          case (DashboardWidget.IncomingMatching): {
            this._incomingMatchingData.next(new IncomingMatchingData(dashboardMessage.data));
            // console.log('INCOMING MATCHING DATA UPDATED ', this._incomingMatchingData);
            break;
          }
          case (DashboardWidget.LocationDiary): {
            const existingIndex = this.locationDiaryDataArray.findIndex(
              (x) => x.locationId === dashboardMessage.data[3]);
            if (existingIndex !== -1) {
              this.locationDiaryDataArray[existingIndex] = new LocationDiaryData(dashboardMessage.data);
            } else {
              this.locationDiaryDataArray.push(new LocationDiaryData(dashboardMessage.data));
            }
            this._locationDiaryDataArray.next(this.locationDiaryDataArray);
            // console.log('DIARY DATA UPDATED ', this._diaryData);
            break;
          }
          case (DashboardWidget.IncomingRSD): {
            this._incomingRSDData.next(new IncomingRSDData(dashboardMessage.data));
            // console.log('INCOMING RSD DATA UPDATED ', this._incomingRSDData);
            break;
          }
          case (DashboardWidget.ManualMatching): {
            this._manualMatchingData.next(new ManualMatchingData(dashboardMessage.data));
            // console.log('INCOMING RSD DATA UPDATED ', this._manualMatchingData);
            break;
          }
          case (DashboardWidget.DistributionList): {
            this._distributionListData.next(new DistributionListData(dashboardMessage.data));
            // console.log('INCOMING RSD DATA UPDATED ', this._distributionListData);
            break;
          }
          default:
            break;
        }
      });
    } else {
      /// RETRY IN 5 SECONDS
      setTimeout(() => {
        this.subscribeWidget(widgetConfig);
      }, 5000);

      console.log('subscribeWidget try to connect to rabbit again');
    }
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

    console.log(`open doctorDiary area: ${day} doctor_ID: ${doctorID}`);

    this.stompService.client.send(`/exchange/HMS.MessageHandler.GotoDiaryDoctorMessage:HMS.MessageHandler/
      ${this.stompService.clientId}`, headersObj, JSON.stringify(htMessage));
  }

  goToTriage() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoTriageMessage:HMS.MessageHandler',
    };
    const htMessage = { working: true };

    console.log('open Messenger Select Target user');

    this.stompService.client.send(`/exchange/HMS.MessageHandler.GotoTriageMessage:HMS.MessageHandler/
      ${this.stompService.clientId}`, headersObj, JSON.stringify(htMessage));
  }

  goToTaskList() {
    const headersObj = {
      'content-type': 'application/json',
      type: 'HMS.MessageHandler.GotoTaskListMessage:HMS.MessageHandler',
    };
    const htMessage = { };

    console.log('open Messenger Select Target user');

    this.stompService.client.send(`/exchange/HMS.MessageHandler.GotoTaskListMessage:HMS.MessageHandler/
      ${this.stompService.clientId}`, headersObj, JSON.stringify(htMessage));
  }
}
