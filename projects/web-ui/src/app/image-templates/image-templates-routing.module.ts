import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ImageTemplatesComponent } from './image-templates.component';

const routes: Routes = [
  { path: '', component: ImageTemplatesComponent },
  { path: ':formDisplay/:recordSubCategory', component: ImageTemplatesComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImageTemplatesRoutingModule { }
