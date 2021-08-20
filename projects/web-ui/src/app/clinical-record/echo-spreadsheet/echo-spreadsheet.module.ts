import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IgxExcelModule } from 'igniteui-angular-excel';
import { IgxSpreadsheetModule } from 'igniteui-angular-spreadsheet';
import {
  DxButtonModule,
  DxDateBoxModule,
  DxFormModule,
  DxListModule,
  DxLoadPanelModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule,
  DxTabsModule,
  DxTextAreaModule,
  DxTextBoxModule,
} from 'devextreme-angular';
import { SharedModule } from '../../shared/shared.module';
import { EchoSpreadsheetComponent } from './echo-spreadsheet.component';
import { EchoSpreadsheetRoutingModule } from './echo-spreadsheet-routing.module';
import { ClinicalRecordModule } from '../clinical-record.module';
import { SmartTextModule } from '../../../../../smart-text/src/lib/smart-text.module';
import { PatientClient } from '../../../../../../Generated/CoreAPIClient';

@NgModule({
  declarations: [
    EchoSpreadsheetComponent,
  ],
  imports: [
    CommonModule,
    EchoSpreadsheetRoutingModule,
    SharedModule,
    ClinicalRecordModule,
    DxTabsModule,
    DxFormModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxTextBoxModule,
    DxLoadPanelModule,
    DxListModule,
    DxTextAreaModule,
    DxPopupModule,
    SmartTextModule,
    IgxExcelModule,
    IgxSpreadsheetModule,
  ],
  providers: [
    PatientClient,
  ],
})
export class EchoSpreadsheetModule { }
