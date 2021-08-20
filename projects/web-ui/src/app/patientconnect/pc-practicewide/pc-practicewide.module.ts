import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DxButtonModule,
  DxCheckBoxModule,
  DxContextMenuModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxDropDownBoxModule,
  DxFormModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxTooltipModule,
} from 'devextreme-angular';
import {
  BookingTypeClient,
  InternalDoctorsClient,
  LocationClient,
  PCActionClient,
  PCPracticeWideClient,
  PCProgramsClient,
} from '../../../../../../Generated/CoreAPIClient';
import { SharedModule } from '../../shared/shared.module';
import { PatientConnectService } from '../patientconnect.service';
import { PracticeWideService } from '../practicewide.service';
import { PcPracticeWideRoutingModule } from './pc-practicewide-routing.module';
import { PcPracticewideComponent } from './pc-practicewide/pc-practicewide.component';
import { PracticewideFilterComponent } from './practicewide-filter/practicewide-filter.component';

@NgModule({
  declarations: [
    PcPracticewideComponent,
    PracticewideFilterComponent,
  ],
  imports: [
    SharedModule,
    CommonModule,
    PcPracticeWideRoutingModule,
    FormsModule,
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
  ],
  providers: [
    PracticeWideService,
    PCPracticeWideClient,
    PatientConnectService,
    PCActionClient,
    PCProgramsClient,
    InternalDoctorsClient,
    BookingTypeClient,
    LocationClient,
  ],
})
export class PcPracticeWideModule { }
