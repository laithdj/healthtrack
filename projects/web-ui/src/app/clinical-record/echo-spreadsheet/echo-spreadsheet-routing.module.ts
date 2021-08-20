import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EchoSpreadsheetComponent } from './echo-spreadsheet.component';

const routes: Routes = [
  { path: '', component: EchoSpreadsheetComponent },
  { path: ':id', component: EchoSpreadsheetComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EchoSpreadsheetRoutingModule { }
