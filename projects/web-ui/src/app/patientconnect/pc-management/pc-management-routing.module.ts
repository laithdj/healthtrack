import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PcManagementComponent } from './pc-management.component';

const pcManagementRoutes: Routes = [
  { path: '', component: PcManagementComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forChild(pcManagementRoutes)
  ],
  exports: [RouterModule]
})
export class PcManagementRoutingModule  {
}
