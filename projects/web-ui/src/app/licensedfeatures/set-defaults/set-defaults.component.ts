import { Component, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { DxRadioGroupComponent } from 'devextreme-angular';
import { DeviceMode } from '../../../../../../Generated/CoreAPIClient';
import { SetDefaultSettings } from '../store/licensedfeatures.actions';
import { LicensedFeatureAppState } from '../store/licensedfeatures.reducers';
import { selectEditMode } from '../../app-store/app-ui.selectors';


@Component({
  selector: 'app-set-defaults',
  templateUrl: './set-defaults.component.html',
  styleUrls: ['./set-defaults.component.css']
})

export class SetDefaultsComponent {
  @ViewChild(DxRadioGroupComponent) selectDefaultSettingRef: DxRadioGroupComponent;

  setDefaultsPopup = false;
  editMode$ = this.store.pipe(select(selectEditMode));

  defaultSettings = [
    { deviceMode: DeviceMode.Live, preloadDays: 0},
    { deviceMode: DeviceMode.Preload, preloadDays: 0},
    { deviceMode: DeviceMode.Preload, preloadDays: 28}
  ];

  setDefaultItems = [
    { label: 'Connected', settings: this.defaultSettings[0]},
    { label: 'In Ward (same day)', settings: this.defaultSettings[1]},
    { label: 'Remote Clinic', settings: this.defaultSettings[2]},
  ];

  constructor(private store: Store<LicensedFeatureAppState>) { }

  onSetDefaults(selectedSettings: { deviceMode, preloadDays}) {
    this.store.dispatch( new SetDefaultSettings(selectedSettings));
    this.closeDefaultSettingPopup();
  }

  closeDefaultSettingPopup() {
    this.setDefaultsPopup = false;
    this.selectDefaultSettingRef.value = this.defaultSettings[0];
  }
}
