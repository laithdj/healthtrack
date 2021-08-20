import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxFormModule,
  DxDataGridModule,
  DxCheckBoxModule,
  DxButtonModule,
  DxTextBoxModule,
  DxSelectBoxModule,
  DxRadioGroupModule,
  DxChartModule,
  DxPopupModule,
  DxListModule,
  DxDropDownBoxModule,
  DxLoadIndicatorModule,
  DxTextAreaModule,
} from 'devextreme-angular';
import { PcPatientProgramComponent } from './pc-patient-program.component';
import { PatientProgramsService } from './patientPrograms.service';
import { ProgramComponent } from './program/program.component';
import { ProgramDetailsComponent } from './program/program-details/program-details.component';
import { PatientConnectService } from '../patientconnect.service';
import { ReplyContentDialogModule } from '../pc-replycontent/replycontent-dialog/replycontent-dialog.module';
import { SelectBookingTypesComponent } from
  './program/program-details/select-booking-types/select-booking-types.component';
import { ReplyContentComponent } from './program/program-details/reply-content/reply-content.component';
import { HistoryComponent } from './program/program-details/history/history.component';
import { SharedModule } from '../../shared/shared.module';
import { PracticeWideService } from '../practicewide.service';
import { PatientHeaderModule } from '../../../../../patient-header/src/lib/patient-header.module';
import { PcPatientProgramRoutingModule } from './pc-patient-program-routing.module';
import {
  PatientClient,
  PatientProgramsClient,
  InternalDoctorsClient,
  LocationClient,
  PCProgramsClient,
  PCPracticeWideClient,
  PCActionClient,
} from '../../../../../../Generated/CoreAPIClient';
import { NewPatientConnectComponent } from './new-patient-connect/new-patient-connect.component';

@NgModule({
  declarations: [
    PcPatientProgramComponent,
    ProgramComponent,
    ProgramDetailsComponent,
    SelectBookingTypesComponent,
    ReplyContentComponent,
    HistoryComponent,
    NewPatientConnectComponent,
  ],
  imports: [
    CommonModule,
    PcPatientProgramRoutingModule,
    ReplyContentDialogModule,
    DxFormModule,
    DxDataGridModule,
    DxCheckBoxModule,
    DxButtonModule,
    DxDropDownBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    PatientHeaderModule,
    DxSelectBoxModule,
    DxRadioGroupModule,
    DxLoadIndicatorModule,
    DxChartModule,
    DxPopupModule,
    DxListModule,
    SharedModule,
  ],
  providers: [
    PatientProgramsService,
    PatientClient,
    PatientProgramsClient,
    InternalDoctorsClient,
    LocationClient,
    PatientConnectService,
    PCProgramsClient,
    PracticeWideService,
    PCPracticeWideClient,
    PCActionClient,
  ],
})
export class PcPatientProgramModule { }
