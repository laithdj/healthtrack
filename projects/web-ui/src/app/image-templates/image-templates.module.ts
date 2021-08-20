import { NgModule } from '@angular/core';
import {
  DxDataGridModule,
  DxButtonModule, DxFormModule,
  DxPopupModule,
  DxLoadIndicatorModule,
  DxTemplateModule,
  DxScrollViewModule,
  DxFileUploaderModule,
  DxListModule,
} from 'devextreme-angular';
import { ImageTemplatesComponent } from './image-templates.component';
import { ImageTemplatesClient, ImageTemplateFilesClient } from '../../../../../Generated/CoreAPIClient';
import { ImageTemplatesRoutingModule } from './image-templates-routing.module';
import { CommonModule } from '../../../../../node_modules/@angular/common';
import { ImageTemplatesUploaderComponent } from './image-templates-uploader/image-templates-uploader.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ImageTemplatesComponent,
    ImageTemplatesUploaderComponent,
  ],
  imports: [
    CommonModule,
    ImageTemplatesRoutingModule,
    DxDataGridModule,
    DxButtonModule,
    DxFormModule,
    DxPopupModule,
    SharedModule,
    DxLoadIndicatorModule,
    DxTemplateModule,
    DxScrollViewModule,
    DxFileUploaderModule,
    DxListModule,
  ],
  providers: [
    ImageTemplatesClient,
    ImageTemplateFilesClient,
  ],
})
export class ImageTemplatesModule { }
