import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AnnotationToolsComponent } from './annotation-tools.component';

const routes: Routes = [
  { path: '', component: AnnotationToolsComponent },
  { path: ':formDisplay/:recordSubCategory', component: AnnotationToolsComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnnotationToolsRoutingModule { }
