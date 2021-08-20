import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardiacCTComponent } from './cardiac-ct.component';

const cardiacCTRoutes: Routes = [
  { path: '', component: CardiacCTComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forChild(cardiacCTRoutes)],
  exports: [RouterModule],
})
export class CardiacCTRoutingModule { }
