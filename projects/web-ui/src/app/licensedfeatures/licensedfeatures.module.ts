import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { DxButtonModule, DxDataGridModule, DxFormModule, DxPopupModule, DxRadioGroupModule, DxSelectBoxModule, DxTabsModule,
  DxTemplateModule } from 'devextreme-angular';
import { LicencedFeatureClient } from '../../../../../Generated/CoreAPIClient';
import { environment } from '../../environments/environment';
import { SharedModule } from '../shared/shared.module';
import { BiomedixEcgComponent } from './biomedix-ecg/biomedix-ecg.component';
import { BookingStatusListComponent } from './bookingstatus-list/bookingstatus-list.component';
import { BookingtypeListComponent } from './bookingtype-list/bookingtype-list.component';
import { DeviceDetailsComponent } from './device-details/device-details.component';
import { DeviceListComponent } from './device-list/device-list.component';
import { DeviceSettingsComponent } from './device-settings/device-settings.component';
import { DeviceComponent } from './device/device.component';
import { DicomServerComponent } from './dicom-server/dicom-server.component';
import { DicomWorklistComponent } from './dicom-worklist/dicom-worklist.component';
import { LicensedFeaturesRoutingModule } from './licensedfeatures-routing.module';
import { LicensedFeaturesComponent } from './licensedfeatures.component';
import { LocationRoomListComponent } from './locationroom-list/locationroom-list.component';
import { SetDefaultsComponent } from './set-defaults/set-defaults.component';
import { LicensedFeatureEffects } from './store/licensedfeatures.effects';
import { licensedfeaturesReducers } from './store/licensedfeatures.reducers';
import { WorklistTestComponent } from './worklist-test/worklist-test.component';


@NgModule({
  declarations: [
    LicensedFeaturesComponent,
    DicomServerComponent,
    DicomWorklistComponent,
    BiomedixEcgComponent,
    DeviceComponent,
    DeviceListComponent,
    DeviceDetailsComponent,
    DeviceSettingsComponent,
    BookingStatusListComponent,
    BookingtypeListComponent,
    LocationRoomListComponent,
    WorklistTestComponent,
    SetDefaultsComponent,
  ],
  imports: [
    CommonModule,
    LicensedFeaturesRoutingModule,
    DxFormModule,
    DxDataGridModule,
    DxTabsModule,
    DxTemplateModule,
    DxButtonModule,
    DxRadioGroupModule,
    DxSelectBoxModule,
    DxPopupModule,
    SharedModule,
    StoreModule.forFeature('licensedFeatureState', licensedfeaturesReducers),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    EffectsModule.forFeature([LicensedFeatureEffects]),
  ],
  providers: [
    LicencedFeatureClient
  ],
})

export class LicensedFeaturesModule { }
