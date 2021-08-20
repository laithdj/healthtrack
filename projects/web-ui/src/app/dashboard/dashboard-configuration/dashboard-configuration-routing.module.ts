import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardConfigurationComponent } from './dashboard-configuration.component';

const dashboardConfigurationRoutes: Routes = [
  { path: '', component: DashboardConfigurationComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forChild(dashboardConfigurationRoutes)
  ],
  exports: [RouterModule]
})
export class DashboardConfigurationRoutingModule {
}
