import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipmentRosteringComponent } from './equipment-rostering.component';
import { DxSchedulerModule, DxContextMenuModule, DxLoadPanelModule, DxFormModule, DxSelectBoxModule,
  DxButtonModule, DxDateBoxModule, DxCheckBoxModule, DxPopupModule, DxRadioGroupModule } from 'devextreme-angular';
import { LocationClient, EquipmentRosteringClient } from '../../../../../Generated/CoreAPIClient';
import { EquipmentRosteringRoutingModule } from './equipment-rostering-routing.module';
import { EquipmentRosteringService } from './equipment-rostering.service';
import { EditEquipmentRosterPopupComponent } from './edit-equipment-roster-popup/edit-equipment-roster-popup.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    EquipmentRosteringComponent,
    EditEquipmentRosterPopupComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    DxSchedulerModule,
    DxContextMenuModule,
    DxLoadPanelModule,
    DxFormModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxDateBoxModule,
    DxCheckBoxModule,
    DxPopupModule,
    DxRadioGroupModule,
    EquipmentRosteringRoutingModule
  ],
  providers: [
    EquipmentRosteringService,
    LocationClient,
    EquipmentRosteringClient
  ]
})
export class EquipmentRosteringModule { }
