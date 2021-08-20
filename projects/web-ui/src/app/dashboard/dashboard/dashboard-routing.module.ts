import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';

const dashboardRoutes: Routes = [
  { path: '', component: DashboardComponent, pathMatch: 'full' },
  { path: ':id', component: DashboardComponent, pathMatch: 'full' },
  { path: ':id/:width/:height', component: DashboardComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forChild(dashboardRoutes)
  ],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
}
