import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxFormModule,
  DxButtonModule,
  DxDateBoxModule,
  DxNumberBoxModule,
  DxTextBoxModule,
  DxButtonGroupModule,
  DxBoxModule,
  DxValidationGroupModule,
  DxValidatorModule,
  DxValidationSummaryModule,
 } from 'devextreme-angular';
import { ReplycontentDialogComponent } from './replycontent-dialog.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  declarations: [
    ReplycontentDialogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    DxFormModule,
    DxButtonModule,
    DxDateBoxModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxBoxModule,
    SharedModule,
    DxValidationGroupModule,
    DxValidatorModule,
    DxValidationSummaryModule
  ],
  exports: [
    CommonModule,
    ReplycontentDialogComponent
  ]
})

// this is a shared module. Required for use of the
// ReplycontentDialogComponent in multiple modules
export class ReplyContentDialogModule  {
}
