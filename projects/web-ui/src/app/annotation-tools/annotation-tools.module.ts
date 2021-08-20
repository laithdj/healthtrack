import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { AnnotationToolsComponent } from './annotation-tools.component';
import { annotationToolsReducers } from './store/annotation-tools.reducers';
import { DxDataGridModule, DxButtonModule } from 'devextreme-angular';
import { AnnotationToolsRoutingModule } from './annotation-tools-routing.module';
import { AnnotationToolsClient } from '../../../../../Generated/CoreAPIClient';
import { EffectsModule } from '@ngrx/effects';
import { AnnotationToolsEffects } from './store/annotation-tools.effects';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    AnnotationToolsComponent
  ],
  imports: [
    CommonModule,
    AnnotationToolsRoutingModule,
    DxDataGridModule,
    DxButtonModule,
    SharedModule,
    StoreModule.forFeature('annotationToolsState', annotationToolsReducers),
    EffectsModule.forFeature([AnnotationToolsEffects])
  ],
  providers: [
    AnnotationToolsClient
  ]
})

export class AnnotationToolsModule { }
