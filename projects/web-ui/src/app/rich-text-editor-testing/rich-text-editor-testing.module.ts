import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevExpressTestComponent } from './dev-express-test/dev-express-test.component';
import { RichEditComponent } from './dev-express-test/rich-edit/rich-edit.component';
import { RichTextEditorTestingRoutingModule } from './rich-text-editor-testing-routing.module';

@NgModule({
  declarations: [DevExpressTestComponent, RichEditComponent],
  imports: [
    CommonModule,
    RichTextEditorTestingRoutingModule
  ]
})
export class RichTextEditorTestingModule { }
