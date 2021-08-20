import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import {
  DxTextBoxModule,
  DxFormModule,
  DxCheckBoxModule,
  DxButtonModule,
  DxDataGridModule,
  DxRadioGroupModule,
  DxSelectBoxModule,
  DxPopupModule,
  DxDateBoxModule,
} from 'devextreme-angular';
import { ErrorComponent } from './error/error.component';
import { PatientSummaryComponent } from '../shared/patient-summary/patient-summary.component';
import { HMSButtonDeleteComponent } from './hms-button/hms-button-delete/hms-button-delete.component';
import { HMSButtonSaveComponent } from './hms-button/hms-button-save/hms-button-save.component';
import { HMSButtonEditComponent } from './hms-button/hms-button-edit/hms-button-edit.component';
import { HMSButtonCloseComponent } from './hms-button/hms-button-close/hms-button-close.component';
import { HMSButtonNewComponent } from './hms-button/hms-button-new/hms-button-new.component';
import { HMSButtonCancelComponent } from './hms-button/hms-button-cancel/hms-button-cancel.component';
import { HMSButtonSetComponent } from './hms-button/hms-button-set/hms-button-set.component';
import { HMSButtonSetSaveComponent } from './hms-button/hms-button-set-save/hms-button-set-save.component';
import { DateSelectorComponent } from './date-selector/date-selector.component';
import { DateSelectorPopupComponent } from './date-selector/date-selector-popup/date-selector-popup.component';
import { DateTimeDOPipe } from './pipes/date-time-do.pipe';
import { HMSConfirmComponent } from './hms-confirm/hms-confirm.component';

@NgModule({
  declarations: [
    ErrorComponent,
    PatientSummaryComponent,
    HMSButtonDeleteComponent,
    HMSButtonSaveComponent,
    HMSButtonEditComponent,
    HMSButtonCloseComponent,
    HMSButtonNewComponent,
    HMSButtonSetComponent,
    HMSButtonCancelComponent,
    HMSButtonSetSaveComponent,
    HMSConfirmComponent,
    DateSelectorComponent,
    DateSelectorPopupComponent,
    DateTimeDOPipe,
  ],
  imports: [
    CommonModule,
    DxTextBoxModule,
    DxFormModule,
    DxCheckBoxModule,
    DxButtonModule,
    DxPopupModule,
    DxDataGridModule,
    DxPopupModule,
    DxRadioGroupModule,
    DxSelectBoxModule,
    DxDateBoxModule,
  ],
  exports: [
    ErrorComponent,
    PatientSummaryComponent,
    HMSButtonDeleteComponent,
    HMSButtonSaveComponent,
    HMSButtonEditComponent,
    HMSButtonCloseComponent,
    HMSButtonNewComponent,
    HMSButtonSetComponent,
    HMSButtonCancelComponent,
    HMSButtonSetSaveComponent,
    HMSConfirmComponent,
    DateSelectorComponent,
    DateSelectorPopupComponent,
    DateTimeDOPipe,
  ],
})

export class SharedModule {
  public static forRoot(): ModuleWithProviders {
    return { ngModule: SharedModule };
  }
}
