import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EchocardiogramComponent } from './echocardiogram.component';

const echocardiogramRoutes: Routes = [
  { path: '', component: EchocardiogramComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(echocardiogramRoutes)],
  exports: [RouterModule]
})
export class EchocardiogramRoutingModule { }
