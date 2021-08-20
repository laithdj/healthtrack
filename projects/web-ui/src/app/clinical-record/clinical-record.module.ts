import {
  DxButtonModule,
  DxTreeListModule,
  DxFormModule,
  DxSelectBoxModule,
  DxTextBoxModule,
  DxCheckBoxModule,
  DxTextAreaModule,
  DxDrawerModule,
  DxNumberBoxModule,
  DxLoadPanelModule,
  DxRadioGroupModule,
  DxPopupModule,
  DxDataGridModule,
  DxListModule,
} from 'devextreme-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { clinicalRecordReducers } from './store/clinical-record.reducers';
import { ClinicalRecordEffects } from './store/clinical-record.effects';
import { MeasurementTemplateComponent } from './shared/measurement-template/measurement-template.component';
import { SmartTextClient, CardiacCTClient } from '../../../../../Generated/CoreAPIClient';
import { ClinicalRecordRoutingModule } from './clinical-record-routing.module';
import { HmsTextBoxComponent } from './shared/cardiac-ct-controls/hms-text-box/hms-text-box.component';
import { HmsCheckBoxComponent } from './shared/cardiac-ct-controls/hms-check-box/hms-check-box.component';
import { HmsTextAreaComponent } from './shared/cardiac-ct-controls/hms-text-area/hms-text-area.component';
import { HmsRadioGroupComponent } from './shared/cardiac-ct-controls/hms-radio-group/hms-radio-group.component';
import { HmsSelectBoxComponent } from './shared/cardiac-ct-controls/hms-select-box/hms-select-box.component';
import { HmsNumberBoxComponent } from './shared/cardiac-ct-controls/hms-number-box/hms-number-box.component';
import { HmsLabelTextComponent } from './shared/cardiac-ct-controls/hms-label-text/hms-label-text.component';
// import { SmartTextEditorComponent } from './shared/smart-text-editor/smart-text-editor.component';
import { SmartTextModule } from '../../../../smart-text/src/lib/smart-text.module';
import { SmartTextEditorComponent } from './shared/smart-text-editor/smart-text-editor.component';

@NgModule({
  declarations: [
    MeasurementTemplateComponent,
    HmsCheckBoxComponent,
    HmsRadioGroupComponent,
    HmsTextAreaComponent,
    HmsTextBoxComponent,
    HmsSelectBoxComponent,
    HmsNumberBoxComponent,
    HmsLabelTextComponent,
    SmartTextEditorComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    DxButtonModule,
    DxTreeListModule,
    DxRadioGroupModule,
    DxFormModule,
    DxListModule,
    DxSelectBoxModule,
    SmartTextModule,
    DxTextBoxModule,
    DxPopupModule,
    DxDataGridModule,
    DxCheckBoxModule,
    DxLoadPanelModule,
    DxNumberBoxModule,
    DxDrawerModule,
    ClinicalRecordRoutingModule,
    DxTextAreaModule,
    StoreModule.forFeature('clinicalRecordState', clinicalRecordReducers),
    EffectsModule.forFeature([ClinicalRecordEffects]),
  ],
  exports: [
    MeasurementTemplateComponent,
    HmsCheckBoxComponent,
    HmsRadioGroupComponent,
    HmsTextAreaComponent,
    HmsTextBoxComponent,
    HmsSelectBoxComponent,
    HmsNumberBoxComponent,
    HmsLabelTextComponent,
  ],
  providers: [
    SmartTextClient,
    CardiacCTClient,
  ],
})

export class ClinicalRecordModule { }
