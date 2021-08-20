import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxButtonModule, DxNumberBoxModule, DxFormModule, DxSelectBoxModule, DxLoadIndicatorModule } from 'devextreme-angular';
import { TasksWidgetComponent } from './tasks-widget/tasks-widget.component';
import { DiaryWidgetComponent } from './diary-widget/diary-widget.component';
import { DashboardWidgetComponent } from './dashboard-widget.component';
import { ClinicalRecordsWidgetComponent } from './clinical-records-widget/clinical-records-widget.component';
import { IncomingMatchingWidgetComponent } from './incoming-matching-widget/incoming-matching-widget.component';
import { DocumentsWidgetComponent } from './documents-widget/documents-widget.component';
import { IncomingWidgetComponent } from './incoming-widget/incoming-widget.component';
import { InitialContactWidgetComponent } from './initial-contact-widget/initial-contact-widget.component';
import { InternalReviewWidgetComponent } from './internal-review-widget/internal-review-widget.component';
import { MessengerWidgetComponent } from './messenger-widget/messenger-widget.component';
import { PatientWidgetComponent } from './patient-widget/patient-widget.component';
import { TriageWidgetComponent } from './triage-widget/triage-widget.component';
import { PatientConnectWidgetComponent } from './patient-connect-widget/patient-connect-widget.component';
import { LocationDiaryWidgetComponent } from './location-diary-widget/location-diary-widget.component';
import { LocationClient } from '../../../../../../Generated/CoreAPIClient';
import { IncomingRsdWidgetComponent } from './incoming-rsd-widget/incoming-rsd-widget.component';
import { ManualMatchingWidgetComponent } from './manual-matching-widget/manual-matching-widget.component';
import { DistributionListWidgetComponent } from './distribution-list-widget/distribution-list-widget.component';
import { WorksheetWidgetComponent } from './worksheet-widget/worksheet-widget.component';
import { NewRequestWidgetComponent } from './new-request-widget/new-request-widget.component';

@NgModule({
  declarations: [
    DashboardWidgetComponent,
    DiaryWidgetComponent,
    TasksWidgetComponent,
    ClinicalRecordsWidgetComponent,
    IncomingMatchingWidgetComponent,
    DocumentsWidgetComponent,
    IncomingWidgetComponent,
    InitialContactWidgetComponent,
    InternalReviewWidgetComponent,
    MessengerWidgetComponent,
    PatientWidgetComponent,
    TriageWidgetComponent,
    PatientConnectWidgetComponent,
    LocationDiaryWidgetComponent,
    IncomingRsdWidgetComponent,
    ManualMatchingWidgetComponent,
    DistributionListWidgetComponent,
    IncomingRsdWidgetComponent,
    WorksheetWidgetComponent,
    NewRequestWidgetComponent,
  ],
  imports: [
    CommonModule,
    DxButtonModule,
    DxNumberBoxModule,
    DxFormModule,
    DxSelectBoxModule,
    DxLoadIndicatorModule
  ], exports: [
    DashboardWidgetComponent
  ],

  providers: [
    LocationClient
  ]
})
export class DashboardWidgetModule { }
