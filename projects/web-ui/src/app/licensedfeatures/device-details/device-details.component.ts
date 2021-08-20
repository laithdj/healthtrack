import { Component, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { LicensedFeatureAppState } from '../store/licensedfeatures.reducers';
import { selectEditMode } from '../../app-store/app-ui.selectors';
import { editingDeviceSelector } from '../store/licensedfeatures.selectors';
import { WorkListDeviceDO } from '../../../../../../Generated/CoreAPIClient';
import { UpdateEditingDevice } from '../store/licensedfeatures.actions';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.css'],
})
export class DeviceDetailsComponent implements OnDestroy {
  private _destroyed$ = new Subject<void>();

  editingDevice: WorkListDeviceDO;
  originalDevice: WorkListDeviceDO;
  editMode$ = this.store.pipe(select(selectEditMode));
  editingDevice$ = this.store.pipe(select(editingDeviceSelector));

  constructor(private store: Store<LicensedFeatureAppState>) {
    this.editingDevice$.pipe(takeUntil(this._destroyed$)).subscribe((d) => {
      this.editingDevice = _.cloneDeep(d);
      this.originalDevice = _.cloneDeep(d);
    });
  }

  onDeviceChanged(event: any) {
    if (event?.dataField === 'name') {
      if (event.value !== this.originalDevice.name) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    } else if (event?.dataField === 'port') {
      if (event?.value !== this.originalDevice.port) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    } else if (event?.dataField === 'model') {
      if (event?.value !== this.originalDevice.model) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    } else if (event?.dataField === 'ipAddress') {
      if (event?.value !== this.originalDevice.ipAddress) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    } else if (event?.dataField === 'make') {
      if (event?.value !== this.originalDevice.make) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    } else if (event?.dataField === 'serialNumber') {
      if (event?.value !== this.originalDevice.serialNumber) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    } else if (event?.dataField === 'enabled') {
      if (event?.value !== this.originalDevice.enabled) {
        this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
      }
    }
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
