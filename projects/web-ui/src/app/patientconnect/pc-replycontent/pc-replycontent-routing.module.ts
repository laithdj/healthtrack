import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PcReplycontentComponent } from './pc-replycontent.component';


const pcReplyContentRoutes: Routes = [
  { path: '', component: PcReplycontentComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forChild(pcReplyContentRoutes)
  ],
  exports: [RouterModule]
})
export class PcReplyContentRoutingModule  {
}
