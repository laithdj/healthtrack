import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RosterTemplateComponent } from './roster-template.component';
import { SplitRosterComponent } from './split-roster/split-roster.component';

const rosterTemplateRoutes: Routes = [
  { path: '', component: RosterTemplateComponent, pathMatch: 'full' },
  { path: 'split-roster', component: SplitRosterComponent, pathMatch: 'full' },
  { path: 'split-roster/:rosterId', component: SplitRosterComponent, pathMatch: 'full' },
  { path: 'split-roster/:rosterId/:minScreenSize', component: SplitRosterComponent, pathMatch: 'full' },
];

@NgModule({
  imports: [ RouterModule.forChild(rosterTemplateRoutes) ],
  exports: [ RouterModule ]
})
export class RosterTemplateRoutingModule { }
