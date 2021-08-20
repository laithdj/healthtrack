import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreatorComponent } from './creator/creator.component';
import { QuestionnaireAdminComponent } from './questionnaire-admin.component';

const routes: Routes = [
  { path: '', component: QuestionnaireAdminComponent },
  { path: 'creator', component: CreatorComponent },
  { path: 'creator/:id', component: CreatorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuestionnaireAdminRoutingModule { }
