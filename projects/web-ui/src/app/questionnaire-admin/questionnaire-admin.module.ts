import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxButtonModule, DxSelectBoxModule, DxDataGridModule, DxFormModule,
  DxCheckBoxModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxTextBoxModule,
  DxRadioGroupModule,
} from 'devextreme-angular';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { QuestionnaireAdminRoutingModule } from './questionnaire-admin-routing.module';
import { SharedModule } from '../shared/shared.module';
import { QuestionnaireAdminComponent } from './questionnaire-admin.component';
import { CreatorComponent } from './creator/creator.component';
import { questionnaireReducers } from './store/questionnaire.reducers';
import { QuestionnaireEffects } from './store/questionnaire.effects';
import { QuestionnaireTemplateClient } from '../../../../../Generated/CoreAPIClient';

@NgModule({
  declarations: [QuestionnaireAdminComponent, CreatorComponent],
  imports: [
    CommonModule,
    SharedModule,
    DxButtonModule,
    DxFormModule,
    DxCheckBoxModule,
    DxPopupModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxDataGridModule,
    DxRadioGroupModule,
    DxNumberBoxModule,
    QuestionnaireAdminRoutingModule,
    StoreModule.forFeature('questionnaireState', questionnaireReducers),
    EffectsModule.forFeature([QuestionnaireEffects]),
  ],
  providers: [QuestionnaireTemplateClient],
})
export class QuestionnaireAdminModule { }
