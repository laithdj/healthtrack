import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContractsComponent } from './contracts.component';
import { ContractDetailComponent } from './contract-detail/contract-detail.component';

const contractRoutes: Routes = [
  // { path: '', component: ContractsComponent, pathMatch: 'full' },
  { path: '', component: ContractsComponent, children: [
    { path: 'new', component: ContractDetailComponent },
    { path: ':id', component: ContractDetailComponent },
  ] },
];

@NgModule({
  imports: [
    RouterModule.forChild(contractRoutes)
  ],
  exports: [RouterModule]
})
export class ContractsRoutingModule {
}
