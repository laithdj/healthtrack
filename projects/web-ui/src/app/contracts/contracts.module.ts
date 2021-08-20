import { NgModule } from '@angular/core';
import { ContractTypeComponent } from './contract-type/contract-type.component';
import { ContractListComponent } from './contract-list/contract-list.component';
import { ContractDetailComponent } from './contract-detail/contract-detail.component';
import { ContractsComponent } from './contracts.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxButtonModule, DxCheckBoxModule, DxDataGridModule, DxDateBoxModule, DxDropDownBoxModule, DxFormModule,
  DxNumberBoxModule, DxPopupModule, DxRadioGroupModule, DxSelectBoxModule, DxTabPanelModule, DxListModule,
  DxTextBoxModule, DxChartModule, DxContextMenuModule, DxTooltipModule } from 'devextreme-angular';
import { ContractsRoutingModule } from './contracts-routing.module';
import { CompanyClient, ContractsClient, GroupsClient, ItemFeesClient } from '../../../../../Generated/CoreAPIClient';
import { StoreModule } from '@ngrx/store';
import { contractsReducers } from './store/contracts.reducers';
import { CompaniesService } from './contract-type/companies.service';
import { ContractService } from './contract.service';
import { ListsService } from './shared/ListsService';
import { SharedModule } from '../shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { ContractsEffects } from './store/contracts.effects';



@NgModule({
  declarations: [
    ContractTypeComponent,
    ContractListComponent,
    ContractDetailComponent,
    ContractsComponent,
  ],
  imports: [
    CommonModule,
    ContractsRoutingModule,
    FormsModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxDataGridModule,
    SharedModule,
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
    StoreModule.forFeature('contractState', contractsReducers),
    EffectsModule.forFeature([ContractsEffects]),
    StoreModule.forFeature('contracts', contractsReducers),
  ],
  providers: [
    ListsService,
    ContractService,
    CompaniesService,
    CompanyClient,
    ContractsClient,
    GroupsClient,
    ItemFeesClient,
  ]
})
export class ContractsModule {
}
