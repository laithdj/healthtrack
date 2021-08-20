import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import {
  DxTabsModule,
  DxButtonModule,
  DxTreeListModule,
  DxFormModule,
  DxRadioGroupModule,
  DxCheckBoxModule,
  DxTextBoxModule,
  DxSelectBoxModule,
  DxDataGridModule,
  DxPopupModule,
  DxTextAreaModule,
  DxDateBoxModule,
  DxNumberBoxModule,
  DxListModule,
  DxLoadPanelModule,
} from 'devextreme-angular';
import { SharedModule } from '../../shared/shared.module';
import { ClinicalRecordModule } from '../clinical-record.module';
import { CardiacCTComponent } from './cardiac-ct.component';
import { CardiacCTRoutingModule } from './cardiac-ct-routing.module';
import { cardiacCTReducers } from './store/cardiac-ct.reducers';
import { CardiacCTEffects } from './store/cardiac-ct.effects';
import { ClinicalDetailsComponent } from './clinical-details/clinical-details.component';
import { PreAdmissionComponent } from './pre-admission/pre-admission.component';
import {
  PatientClient,
  LocationClient,
  CardiacCTClient,
  RolesClient,
  ListClient,
  UnitConversionClient,
} from '../../../../../../Generated/CoreAPIClient';
import { NursingComponent } from './nursing/nursing.component';
import { RadiographerComponent } from './radiographer/radiographer.component';
import { CoronariesComponent } from './coronaries/coronaries.component';
import { StructuralComponent } from './structural/structural.component';
import { DateTimeHelperService } from '../../shared/helpers/date-time-helper.service';
import { AttachmentsComponent } from './attachments/attachments.component';
import { InternalComponent } from './internal/internal.component';
import { SmartTextModule } from '../../../../../smart-text/src/lib/smart-text.module';
import { DescriptionComponent } from './coronaries/description/description.component';

@NgModule({
  declarations: [
    CardiacCTComponent,
    ClinicalDetailsComponent,
    PreAdmissionComponent,
    NursingComponent,
    RadiographerComponent,
    CoronariesComponent,
    StructuralComponent,
    AttachmentsComponent,
    InternalComponent,
    DescriptionComponent,
  ],
  imports: [
    CommonModule,
    ClinicalRecordModule,
    CardiacCTRoutingModule,
    DxRadioGroupModule,
    DxCheckBoxModule,
    DxTextBoxModule,
    DxRadioGroupModule,
    SharedModule,
    DxTabsModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxDataGridModule,
    DxDateBoxModule,
    DxTextAreaModule,
    SmartTextModule,
    DxPopupModule,
    DxListModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxFormModule,
    DxLoadPanelModule,
    DxTreeListModule,
    StoreModule.forFeature('cardiacCTState', cardiacCTReducers),
    EffectsModule.forFeature([CardiacCTEffects]),
  ],
  providers: [
    PatientClient,
    LocationClient,
    RolesClient,
    LocationClient,
    CardiacCTClient,
    ListClient,
    DateTimeHelperService,
    UnitConversionClient,
  ],
})
export class CardiacCTModule { }
