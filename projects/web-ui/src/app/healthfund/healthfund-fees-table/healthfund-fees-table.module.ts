import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DxButtonModule, DxChartModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule, DxFormModule,
  DxListModule, DxNumberBoxModule, DxPopupModule, DxRadioGroupModule, DxSelectBoxModule, DxTextAreaModule, DxTextBoxModule,
  DxTooltipModule } from 'devextreme-angular';
import { NZBillingClient, BillWorksheetClient } from '../../../../../../Generated/CoreAPIClient';
import { SharedModule } from '../../shared/shared.module';
import { HealthfundService } from '../healthfund.service';
import { HealthfundFeesDetailsComponent } from './healthfund-fees-details/healthfund-fees-details.component';
import { HealthfundFeesTableRoutingModule } from './healthfund-fees-table-routing.module';
import { HealthfundFeesTableComponent } from './healthfund-fees-table.component';
import { StoreModule } from '@ngrx/store';
import { healthFundReducers } from './store/healthfund.reducers';
import { EffectsModule } from '@ngrx/effects';
import { HealthFundEffects } from './store/healthfund.effects';



@NgModule({
  declarations: [
    HealthfundFeesTableComponent,
    HealthfundFeesDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DxTooltipModule,
    FormsModule,
    HealthfundFeesTableRoutingModule,
    DxFormModule,
    DxDataGridModule,
    DxCheckBoxModule,
    DxButtonModule,
    DxDateBoxModule,
    DxDropDownBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxSelectBoxModule,
    DxRadioGroupModule,
    DxChartModule,
    DxPopupModule,
    DxListModule,
    StoreModule.forFeature('healthFundState', healthFundReducers),
    EffectsModule.forFeature([HealthFundEffects]),
    DxNumberBoxModule
  ],
  providers: [
    NZBillingClient,
    HealthfundService,
    BillWorksheetClient
  ]
})
export class HealthfundFeesTableModule { }
