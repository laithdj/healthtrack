import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PcPracticewideComponent } from './pc-practicewide/pc-practicewide.component';


const pcPracticeWideRoutes: Routes = [
  { path: '', component: PcPracticewideComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forChild(pcPracticeWideRoutes)
  ],
  exports: [RouterModule]
})
export class PcPracticeWideRoutingModule  {
}
