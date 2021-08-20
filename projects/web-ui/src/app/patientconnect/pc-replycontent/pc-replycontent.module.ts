import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule, DxFormModule,
  DxNumberBoxModule, DxPopupModule, DxTextBoxModule } from 'devextreme-angular';
import { PcReplycontentComponent } from './pc-replycontent.component';
import { PcReplyContentRoutingModule } from './pc-replycontent-routing.module';
import { ReplyContentDialogModule } from './replycontent-dialog/replycontent-dialog.module';
import { PatientConnectService } from '../patientconnect.service';
import { InternalDoctorsClient, ReplyContentClient, BookingTypeClient, LocationClient, PCProgramsClient, PCActionClient,
  PCPracticeWideClient, PatientProgramsClient, PatientClient } from '../../../../../../Generated/CoreAPIClient';
import { PatientProgramsService } from '../pc-patient-program/patientPrograms.service';
import { SharedModule } from '../../shared/shared.module';



@NgModule({
  declarations: [
    PcReplycontentComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReplyContentDialogModule,
    PcReplyContentRoutingModule,
    DxButtonModule,
    SharedModule,
    DxCheckBoxModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxDropDownBoxModule,
    DxTextBoxModule,
    DxFormModule,
    DxNumberBoxModule,
    DxPopupModule,
  ],
  providers: [
    PatientConnectService,
    PatientProgramsService,
    PCPracticeWideClient,
    PCProgramsClient,
    PatientProgramsClient,
    PatientClient,
    PCActionClient,
    InternalDoctorsClient,
    ReplyContentClient,
    BookingTypeClient,
    LocationClient,
  ]
})
export class PcReplyContentModule  {
}
