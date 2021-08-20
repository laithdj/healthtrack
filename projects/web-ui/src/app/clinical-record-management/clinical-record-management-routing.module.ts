import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';


const routes: Routes = [
  { path: '', component: MainComponent, children: [
    { path: 'new', component: MainComponent },
    { path: ':id', component: MainComponent },
  ] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClinicalRecordManagementRoutingModule { }
