import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EquipmentRosteringComponent } from './equipment-rostering.component';

const equipmentRosteringRoutes: Routes = [
  { path: '', component: EquipmentRosteringComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [ RouterModule.forChild(equipmentRosteringRoutes) ],
  exports: [ RouterModule ]
})
export class EquipmentRosteringRoutingModule { }
