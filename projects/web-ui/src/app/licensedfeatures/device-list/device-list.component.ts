import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { SelectDevice } from '../store/licensedfeatures.actions';
import { LicensedFeatureAppState } from '../store/licensedfeatures.reducers';
import { selectEditMode } from '../../app-store/app-ui.selectors';
import { worklistDevicesSelector } from '../store/licensedfeatures.selectors';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.css'],
})

export class DeviceListComponent {
  editMode$ = this.store.pipe(select(selectEditMode));
  worklistDevices$ = this.store.pipe(select(worklistDevicesSelector));
  selectedRowKeys = [];

  constructor(private store: Store<LicensedFeatureAppState>) { }

  onContentReady() {
    this.worklistDevices$.pipe(take(1)).subscribe((d) => {
      const deviceExist = d.find((wl) => wl.id === this.selectedRowKeys[0]);
      if ((this.selectedRowKeys.length < 1) || (!deviceExist)) {
        this.selectedRowKeys = [d[0].id];
      }
    });
  }

  onDeviceSelected(e: any) {
    const selectedDevice = e.selectedRowsData;
    if (selectedDevice && selectedDevice.length === 1) {
      this.selectedRowKeys = [selectedDevice[0].id];
      this.store.dispatch(new SelectDevice(selectedDevice[0]));
    }
  }
}
