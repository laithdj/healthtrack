import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DxButtonModule, DxFormModule, DxNumberBoxModule, DxDataGridModule, DxToolbarModule, DxDrawerModule, DxListModule,
  DxScrollViewModule } from 'devextreme-angular';
import { SmartTextClient } from '../../../../../../Generated/CoreAPIClient';
import { SharedModule } from '../../shared/shared.module';
import { ClinicalRecordModule } from '../clinical-record.module';
// tslint:disable-next-line: max-line-length
import { EchocardiogramClinicalDetailComponent } from './echocardiogram-content/echocardiogram-clinical-detail/echocardiogram-clinical-detail.component';
import { EchocardiogramContentComponent } from './echocardiogram-content/echocardiogram-content.component';
import { EchocardiogramMMode2DComponent } from './echocardiogram-content/echocardiogram-mmode2d/echocardiogram-mmode2d.component';
import { EchocardiogramRoutingModule } from './echocardiogram-routing.module';
import { EchocardiogramComponent } from './echocardiogram.component';
import { EchocardiogramEffects } from './store/echocardiogram.effects';
import { echocardiogramReducers } from './store/echocardiogram.reducers';

@NgModule({
  declarations: [
    EchocardiogramComponent,
    EchocardiogramClinicalDetailComponent,
    EchocardiogramContentComponent,
    EchocardiogramMMode2DComponent
  ],
  imports: [
    CommonModule,
    ClinicalRecordModule,
    EchocardiogramRoutingModule,
    DxButtonModule,
    DxFormModule,
    DxNumberBoxModule,
    DxToolbarModule,
    DxDataGridModule,
    DxDrawerModule,
    DxScrollViewModule,
    DxListModule,
    SharedModule,
    StoreModule.forFeature('echocardiogramState', echocardiogramReducers),
    EffectsModule.forFeature([EchocardiogramEffects])
  ],
  providers: [
    SmartTextClient
  ]
})
export class EchocardiogramModule { }
