import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClinicalRecordManagementRoutingModule } from './clinical-record-management-routing.module';
import { MainComponent } from './main/main.component';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule, DxFormModule,
  DxNumberBoxModule, DxPopupModule, DxRadioGroupModule, DxSelectBoxModule, DxTabPanelModule, DxListModule,
  DxTextBoxModule, DxChartModule, DxContextMenuModule, DxTooltipModule } from 'devextreme-angular';
import { RecordClassificationsClient } from '../../../../../Generated/CoreAPIClient';
import { classificationReducers } from './store/classification.reducers';
import { StoreModule } from '@ngrx/store';
import { RecordManagementService } from './service/recordManagement.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    ClinicalRecordManagementRoutingModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxDropDownBoxModule,
    DxListModule,
    DxTextBoxModule,
    DxFormModule,
    DxNumberBoxModule,
    DxPopupModule,
    DxRadioGroupModule,
    DxSelectBoxModule,
    DxTabPanelModule,
    DxChartModule,
    DxContextMenuModule,
    DxTooltipModule,
    StoreModule.forFeature('classifications', classificationReducers),
  ],
  providers: [
    RecordClassificationsClient,
    RecordManagementService
  ],
  exports : [MainComponent],
  declarations: [MainComponent]
})
export class ClinicalRecordManagementModule { }
