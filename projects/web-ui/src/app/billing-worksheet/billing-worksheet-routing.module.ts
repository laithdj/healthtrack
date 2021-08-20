import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingWorksheetComponent } from './billing-worksheet.component';
import { EditClaimServicesComponent } from './edit-claim-services/edit-claim-services.component';

const routes: Routes = [
  { path: '', component: BillingWorksheetComponent },
  { path: ':bookingId', component: EditClaimServicesComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BillingWorksheetRoutingModule { }
