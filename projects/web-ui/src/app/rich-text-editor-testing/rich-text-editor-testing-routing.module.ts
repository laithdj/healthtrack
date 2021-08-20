import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DevExpressTestComponent } from './dev-express-test/dev-express-test.component';


const routes: Routes = [
  { path: '', component: DevExpressTestComponent }
  // , { path: ':formDisplay/:recordSubCategory', component: ImageTemplatesComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RichTextEditorTestingRoutingModule { }
