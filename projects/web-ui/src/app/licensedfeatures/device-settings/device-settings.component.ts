import * as _ from 'lodash';
import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { confirm } from 'devextreme/ui/dialog';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { selectEditMode } from '../../app-store/app-ui.selectors';
import { DeviceMode, MRNPreference, WorkListDeviceDO } from '../../../../../../Generated/CoreAPIClient';
import { ClearDeviceSettings, FetchDicomWorklist, UpdateEditingDevice } from '../store/licensedfeatures.actions';
import { LicensedFeatureAppState } from '../store/licensedfeatures.reducers';
import {
  editingDeviceSelector,
  modalityListSelector,
  selectedFeatureSelector,
} from '../store/licensedfeatures.selectors';

@Component({
  selector: 'app-device-settings',
  templateUrl: './device-settings.component.html',
  styleUrls: ['./device-settings.component.css'],
})

export class DeviceSettingsComponent {
  private _destroyed$ = new Subject<void>();

  editingDevice: WorkListDeviceDO;
  originalDevice: WorkListDeviceDO;
  modalityList$ = this.store.pipe(select(modalityListSelector));
  editMode$ = this.store.pipe(select(selectEditMode));
  editingDevice$ = this.store.pipe(select(editingDeviceSelector));
  selectedFeature$ = this.store.pipe(select(selectedFeatureSelector));

  modeItems = [
    { text: 'Live', value: DeviceMode.Live },
    { text: 'Pre-Load', value: DeviceMode.Preload },
  ];

  mrnPreferenceItems = [
    { text: 'HealthTrack Patient ID', value: MRNPreference.HealthTrackPatientID },
    { text: 'Primary MRN', value: MRNPreference.PrimaryMRN },
    { text: 'Location MRN', value: MRNPreference.LocationMRN },
  ];

  constructor(private store: Store<LicensedFeatureAppState>) {
    this.editingDevice$.pipe(takeUntil(this._destroyed$)).subscribe((d) => {
      this.editingDevice = _.cloneDeep(d);
      this.originalDevice = _.cloneDeep(d);
    });
  }

  onClearSettings() {
    const result = confirm('You have selected to clear all the settings for this DICOM<br/><br/>'
      + 'worklist. Select \'Yes\' to clear settings or \'No\' to cancel.<br/><br/>', 'Clear DICOM worklist settings');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.store.dispatch(new ClearDeviceSettings());
      }
    });
  }

  onFetchWorklist() {
    this.editingDevice$.pipe(take(1)).subscribe((device) => {
      if (device) {
        const aeTitle = device.name;
        this.store.dispatch(new FetchDicomWorklist(aeTitle));
      }
    });
  }

  onDeviceChanged(event: any) {
    if (event?.dataField === 'modality') {
      if (event.value !== this.originalDevice.modality) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    } else if (event?.dataField === 'deviceMode') {
      if (event?.value !== this.originalDevice.deviceMode) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    } else if (event?.dataField === 'preloadDays') {
      if (event?.value !== this.originalDevice.preloadDays) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    } else if (event?.dataField === 'mrnPreference') {
      if (event?.value !== this.originalDevice.mrnPreference) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    } else if (event?.dataField === 'mrnRequired') {
      if (event?.value !== this.originalDevice.mrnRequired) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    }
  }
}
