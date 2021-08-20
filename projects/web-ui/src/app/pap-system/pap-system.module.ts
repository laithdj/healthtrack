import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { PapSystemRoutingModule } from './pap-system-routing.module';
import { PapTrackingComponent } from './pap-tracking/pap-tracking.component';
import { PapManagementComponent } from './pap-management/pap-management.component';
import { TransactionViewerComponent } from './pap-tracking/transaction-viewer/transaction-viewer.component';
import { AssignEquipmentComponent } from './pap-tracking/assign-equipment/assign-equipment.component';
import { FormsModule } from '@angular/forms';
import { DxTextBoxModule, DxFormModule, DxCheckBoxModule, DxButtonModule, DxDataGridModule, DxRadioGroupModule,
  DxSelectBoxModule, DxPopupModule, DxDateBoxModule, DxValidatorModule, DxValidationSummaryModule,
  DxValidationGroupModule, DxTextAreaModule, DxNumberBoxModule, DxTooltipModule } from 'devextreme-angular';
import { PatientClient } from '../../../../../Generated/CoreAPIClient';
import { EquipmentHistoryComponent } from './equipment-history/equipment-history.component';
import { HmsDropdownComponent } from '../shared/hms-controls/hms-dropdown/hms-dropdown.component';

@NgModule({
  declarations: [
    PapTrackingComponent,
    PapManagementComponent,
    TransactionViewerComponent,
    AssignEquipmentComponent,
    EquipmentHistoryComponent,
    HmsDropdownComponent
  ],
  imports: [
    SharedModule,
    FormsModule,
    CommonModule,
    DxTextBoxModule,
    DxFormModule,
    DxNumberBoxModule,
    DxCheckBoxModule,
    DxButtonModule,
    DxDataGridModule,
    DxRadioGroupModule,
    DxTooltipModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxTextAreaModule,
    DxValidationGroupModule,
    DxPopupModule,
    PapSystemRoutingModule,
    DxValidatorModule,
    DxValidationSummaryModule
  ],
  providers: [ PatientClient ]
})
export class PapSystemModule { }
