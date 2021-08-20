import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  DxFormModule,
  DxButtonModule,
  DxSelectBoxModule,
  DxTreeListModule,
  DxPopupModule,
  DxListModule,
  DxRadioGroupModule,
  DxNumberBoxModule,
  DxTextBoxModule,
  DxDataGridModule,
  DxTextAreaModule,
  DxCheckBoxModule,
  DxDrawerModule,
  DxLoadPanelModule,
} from 'devextreme-angular';
import { RichTextEditorComponent } from './rich-text-editor/rich-text-editor.component';
import { SmartTextConfigurationComponent } from './smart-text-configuration/smart-text-configuration.component';
import { SmartTextDetailsComponent } from './smart-text-configuration/smart-text-details/smart-text-details.component';
import { SmartTextInsertTagComponent } from
  './smart-text-configuration/smart-text-details/smart-text-insert-tag/smart-text-insert-tag.component';
import { TemplateDetailsComponent } from './smart-text-configuration/template-details/template-details.component';
import { SmartTextReportComponent } from './smart-text-report/smart-text-report.component';

@NgModule({
  declarations: [
    RichTextEditorComponent,
    SmartTextReportComponent,
    SmartTextConfigurationComponent,
    TemplateDetailsComponent,
    SmartTextDetailsComponent,
    SmartTextInsertTagComponent,
  ],
  imports: [
    CommonModule,
    DxFormModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxTreeListModule,
    DxPopupModule,
    DxListModule,
    DxRadioGroupModule,
    DxNumberBoxModule,
    DxLoadPanelModule,
    DxTextBoxModule,
    DxDataGridModule,
    DxTextAreaModule,
    DxCheckBoxModule,
    DxDrawerModule,
    DxLoadPanelModule,
  ],
  exports: [
    SmartTextReportComponent,
    SmartTextConfigurationComponent,
  ],
})
export class SmartTextModule { }
