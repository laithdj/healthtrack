import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TriageViewerComponent } from './triage-viewer/triage-viewer.component';
import { TriageComponent } from './triage/triage.component';


const routes: Routes = [
  {
    path: 'triage-viewer',
    component: TriageViewerComponent,
    pathMatch: 'full'
  },
  {
    path: 'triage',
    component: TriageComponent,
    pathMatch: 'full'
  },
  {
    path: 'triage/:bookingId',
    component: TriageComponent,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TriageRoutingModule { }
