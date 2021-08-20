import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SmartTextEditorComponent } from './shared/smart-text-editor/smart-text-editor.component';

const clinicalRecordRoutes: Routes = [
  { path: 'smart-text', component: SmartTextEditorComponent },
  { path: 'smart-text/:formDisplay/:recordSubCategory', component: SmartTextEditorComponent },
  // { path: 'echocardiogram', loadChildren: () => import('./echocardiogram/echocardiogram.module')
  //   .then(m => m.EchocardiogramModule) },
  {
    path: 'cardiac-ct/:id',
    loadChildren: () => import('./cardiac-ct/cardiac-ct.module').then((m) => m.CardiacCTModule),
  },
  {
    path: 'cardiac-ct/:id/:containerId',
    loadChildren: () => import('./cardiac-ct/cardiac-ct.module').then((m) => m.CardiacCTModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(clinicalRecordRoutes)],
  exports: [RouterModule],
})
export class ClinicalRecordRoutingModule { }
