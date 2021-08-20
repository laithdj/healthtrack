import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule, DxFormModule, DxNumberBoxModule,
  DxPopupModule, DxRadioGroupModule, DxSelectBoxModule, DxTabPanelModule, DxListModule, DxTextBoxModule, DxChartModule, DxContextMenuModule,
  DxTooltipModule, DxValidationGroupModule, DxValidatorModule, DxValidationSummaryModule, DxTileViewModule, DxMapModule, DxFileUploaderModule,
  DxCalendarModule } from 'devextreme-angular';
import { SharedModule } from '../shared/shared.module';
import { DoctorBookingRoutingModule } from './doctor-booking.routing';
import { Service } from './app.service';
import { PractiseHeaderComponent } from './practise-header/practise-header.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { BookingTypeComponent } from './booking-type/booking-type.component';
import { AppointmentTimesComponent } from './appointment-times/appointment-times.component';
import { DoctorBookingComponent } from './doctor-booking.component';
import { DxiValidationRuleModule, DxoPagingModule } from 'devextreme-angular/ui/nested';

@NgModule({
  declarations: [
    PractiseHeaderComponent,
    NavBarComponent,
    PatientDetailsComponent,
    BookingTypeComponent,
    AppointmentTimesComponent,
    DoctorBookingComponent
  ],
  exports : [DoctorBookingComponent],
  providers : [Service],

  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    DxButtonModule,
    DxCalendarModule,
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
    DxFileUploaderModule,
    DxContextMenuModule,
    DxValidationGroupModule,
    DxValidatorModule,
    DxTooltipModule,
    DxValidationSummaryModule,
    DxTileViewModule,
    DxiValidationRuleModule,
    DxMapModule,
    DxoPagingModule,
    DoctorBookingRoutingModule
  ]
})

export class DoctorBookingModule { }
