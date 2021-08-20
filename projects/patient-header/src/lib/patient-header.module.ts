import { NgModule } from '@angular/core';
import { DxFormModule } from 'devextreme-angular';
import { PatientHeaderComponent } from './patient-header.component';

@NgModule({
  declarations: [PatientHeaderComponent],
  imports: [
    DxFormModule,
  ],
  exports: [PatientHeaderComponent],
})
export class PatientHeaderModule { }
