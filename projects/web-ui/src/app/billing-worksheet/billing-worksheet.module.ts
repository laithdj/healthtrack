import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import {
  DxButtonModule,
  DxDataGridModule,
  DxDateBoxModule,
  DxFormModule,
  DxLoadIndicatorModule,
  DxPopupModule,
  DxTextBoxModule,
  DxSelectBoxModule,
  DxNumberBoxModule,
  DxCheckBoxModule,
  DxRadioGroupModule,
  DxTextAreaModule,
  DxTooltipModule,
} from 'devextreme-angular';
import {
  BillWorksheetClient,
  CompanyClient,
  DoctorClient,
  LocationClient,
} from '../../../../../Generated/CoreAPIClient';
import { SharedModule } from '../shared/shared.module';
import { BillingWorksheetRoutingModule } from './billing-worksheet-routing.module';
import { BillingWorksheetComponent } from './billing-worksheet.component';
import { EditClaimServicesComponent } from './edit-claim-services/edit-claim-services.component';
import { LoadBookingsComponent } from './load-bookings/load-bookings.component';
import { BillingWorksheetEffects } from './store/billing-worksheet.effects';
import { billingWorksheetReducers } from './store/billing-worksheet.reducers';
import { DateTimeHelperService } from '../shared/helpers/date-time-helper.service';
import { AuditInfoPopupComponent } from './audit-info-popup/audit-info-popup.component';

@NgModule({
  declarations: [
    BillingWorksheetComponent,
    LoadBookingsComponent,
    EditClaimServicesComponent,
    AuditInfoPopupComponent,
  ],
  imports: [
    CommonModule,
    BillingWorksheetRoutingModule,
    DxDataGridModule,
    DxFormModule,
    DxRadioGroupModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxTooltipModule,
    DxCheckBoxModule,
    DxLoadIndicatorModule,
    DxPopupModule,
    DxTextAreaModule,
    DxTextBoxModule,
    SharedModule,
    StoreModule.forFeature('billingWorksheetState', billingWorksheetReducers),
    EffectsModule.forFeature([BillingWorksheetEffects]),
  ],
  providers: [
    DoctorClient,
    LocationClient,
    BillWorksheetClient,
    CompanyClient,
    DateTimeHelperService,
  ],
})

export class BillingWorksheetModule { }
