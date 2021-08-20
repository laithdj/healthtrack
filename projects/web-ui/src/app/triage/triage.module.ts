import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxTextBoxModule, DxFormModule, DxCheckBoxModule, DxButtonModule, DxDataGridModule, DxRadioGroupModule,
  DxSelectBoxModule, DxPopupModule, DxDateBoxModule, DxValidatorModule, DxValidationSummaryModule,
  DxValidationGroupModule, DxTextAreaModule, DxNumberBoxModule,  DxTreeViewModule, DxListModule,
  DxTreeListModule } from 'devextreme-angular';
import { TriageRoutingModule } from './triage-routing.module';
import { TriageViewerComponent } from './triage-viewer/triage-viewer.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { TriageComponent } from './triage/triage.component';
import { TriageSystemService } from './triage-system.service';
import { TriageClient, LocationClient, DoctorClient, PatientClient, } from '../../../../../Generated/CoreAPIClient';

@NgModule({
  declarations: [TriageViewerComponent, TriageComponent],
  imports: [
    CommonModule,
    TriageRoutingModule,
    SharedModule,
    FormsModule,
    CommonModule,
    DxTextBoxModule,
    DxFormModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxButtonModule,
    DxListModule,
    DxDataGridModule,
    DxRadioGroupModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxTextAreaModule,
    DxValidationGroupModule,
    DxPopupModule,
    DxValidatorModule,
    DxTreeViewModule,
  DxTreeListModule,
  DxValidationSummaryModule
  ]
,
providers: [ TriageClient,
TriageSystemService,
LocationClient,
DoctorClient,
PatientClient,]
})
export class TriageModule { }
