import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PcPatientProgramComponent } from './pc-patient-program.component';

const pcPatientProgramRoutes: Routes = [
  { path: '', component: PcPatientProgramComponent, pathMatch: 'full' },
  { path: ':id', component: PcPatientProgramComponent, pathMatch: 'full' },
  { path: ':id/:pcId', component: PcPatientProgramComponent, pathMatch: 'full' },
  { path: ':id/referral/:referralId', component: PcPatientProgramComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forChild(pcPatientProgramRoutes),
  ],
  exports: [RouterModule],
})
export class PcPatientProgramRoutingModule { }
