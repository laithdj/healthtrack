import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxContextMenuModule,
  DxTooltipModule,
  DxListModule,
  DxValidationGroupModule,
  DxValidatorModule,
  DxValidationSummaryModule,
} from 'devextreme-angular';
import { PcManagementRoutingModule } from './pc-management-routing.module';
import { PcManagementComponent } from './pc-management.component';
import { PcProgramDetailComponent } from './pc-program-detail/pc-program-detail.component';
import { PcActionListComponent } from './pc-program-detail/pc-action-list/pc-action-list.component';
import { PatientConnectService } from '../patientconnect.service';
import {
  PCActionClient,
  BookingTypeClient,
  LocationClient,
  PCProgramsClient,
  InternalDoctorsClient,
  ListClient,
} from '../../../../../../Generated/CoreAPIClient';
import { PcActionChangedComponent } from './pc-program-detail/pc-action-changed/pc-action-changed.component';
import { PcProgramTimelineComponent } from './pc-program-detail/pc-program-timeline/pc-program-timeline.component';
import {
  PcPatientsOnProgramComponent,
} from './pc-program-detail/pc-patients-on-program/pc-patients-on-program.component';
import { PcProgramMoveComponent } from './pc-program-detail/pc-program-move/pc-program-move.component';
import { PcProgramWizardComponent } from './pc-program-detail/pc-program-wizard/pc-program-wizard.component';
import { PcBookingtypesListComponent } from './pc-program-detail/pc-bookingtypes-list/pc-bookingtypes-list.component';
import { PcActionDetailComponent } from './pc-program-detail/pc-action-detail/pc-action-detail.component';
import { SharedModule } from '../../shared/shared.module';
import {
  PcMovingStepSelectComponent,
} from './pc-program-detail/pc-program-move/pc-moving-step-select/pc-moving-step-select.component';

@NgModule({
  declarations: [
    PcManagementComponent,
    PcProgramDetailComponent,
    PcActionListComponent,
    PcActionChangedComponent,
    PcProgramTimelineComponent,
    PcPatientsOnProgramComponent,
    PcProgramMoveComponent,
    PcProgramWizardComponent,
    PcBookingtypesListComponent,
    PcActionDetailComponent,
    PcMovingStepSelectComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    PcManagementRoutingModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxDropDownBoxModule,
    DxTextBoxModule,
    DxFormModule,
    DxNumberBoxModule,
    DxPopupModule,
    DxRadioGroupModule,
    DxSelectBoxModule,
    DxContextMenuModule,
    DxTooltipModule,
    DxListModule,
    DxValidationGroupModule,
    DxValidatorModule,
    DxValidationSummaryModule,
  ],
  providers: [
    PatientConnectService,
    PCProgramsClient,
    PCActionClient,
    InternalDoctorsClient,
    BookingTypeClient,
    LocationClient,
    ListClient,
  ],
})
export class PcManagementModule {
}
