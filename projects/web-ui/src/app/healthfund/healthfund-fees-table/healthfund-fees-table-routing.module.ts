import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HealthfundFeesTableComponent } from './healthfund-fees-table.component';

const healthFundFeesTableRoutes: Routes = [
  { path: '', component: HealthfundFeesTableComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [ RouterModule.forChild(healthFundFeesTableRoutes) ],
  exports: [ RouterModule ]
})
export class HealthfundFeesTableRoutingModule { }
