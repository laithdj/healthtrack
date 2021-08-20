import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PapManagementComponent } from './pap-management/pap-management.component';
import { PapTrackingComponent } from './pap-tracking/pap-tracking.component';
import { AssignEquipmentComponent } from './pap-tracking/assign-equipment/assign-equipment.component';
import { TransactionViewerComponent } from './pap-tracking/transaction-viewer/transaction-viewer.component';
import { EquipmentHistoryComponent } from './equipment-history/equipment-history.component';

const routes: Routes = [
  {
    path: 'pap-management',
    component: PapManagementComponent,
    pathMatch: 'full',
  },
  {
    path: 'pap-management/:master-category-id',
    component: PapManagementComponent,
    pathMatch: 'full',
  },
  {
    path: 'pap-management/:master-category-id/:asset-id',
    component: PapManagementComponent,
    pathMatch: 'full',
  },
  {
    path: 'pap-management/equipment-resource/:master-category-id',
    component: PapManagementComponent,
    pathMatch: 'full',
  },  
  {
    path: 'pap-tracking',
    component: PapTrackingComponent,
    pathMatch: 'full',
  },
  {
    path: 'pap-tracking/:patientId/:master-category-id',
    component: PapTrackingComponent,
    pathMatch: 'full',
  },
  {
    path: 'assign-equipment',
    component: AssignEquipmentComponent,
    pathMatch: 'full',
  },
  {
    path: 'transaction-viewer',
    component: TransactionViewerComponent,
    pathMatch: 'full',
  },
  {
    path: 'equipment-history/:assetID/:master-category-id',
    component: EquipmentHistoryComponent,
    pathMatch: 'full',
  }, 
  {
    path: 'transaction-viewer/:transactionId',
    component: TransactionViewerComponent,
    pathMatch: 'full',
  },
  {
    path: 'transaction-viewer/:patientId/:master-category-id/:equipmentId',
    component: TransactionViewerComponent,
    pathMatch: 'full',
  },
  {
    path: 'transaction-viewer/:patientId/:master-category-id/:equipmentId/:transactionId',
    component: TransactionViewerComponent,
    pathMatch: 'full',
  },
  {
    path: 'assign-equipment/:patientId/:master-category-id',
    component: AssignEquipmentComponent,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PapSystemRoutingModule { }
