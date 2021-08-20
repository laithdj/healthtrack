import { Component, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { editingDeviceSelector } from '../store/licensedfeatures.selectors';
import { selectEditMode } from '../../app-store/app-ui.selectors';
import { LicensedFeatureAppState } from '../store/licensedfeatures.reducers';
import { WorkListDeviceDO } from '../../../../../../Generated/CoreAPIClient';
import { UpdateEditingDevice } from '../store/licensedfeatures.actions';

@Component({
  selector: 'app-bookingstatus-list',
  templateUrl: './bookingstatus-list.component.html',
  styleUrls: ['./bookingstatus-list.component.css'],
})

export class BookingStatusListComponent implements OnDestroy {
  private _destroyed$ = new Subject<void>();

  editMode$ = this.store.pipe(select(selectEditMode));
  editingDevice$ = this.store.pipe(select(editingDeviceSelector));
  editMode: boolean;
  editingDevice: WorkListDeviceDO;
  copyDevice: WorkListDeviceDO;

  constructor(private store: Store<LicensedFeatureAppState>) {
    this.editingDevice$.pipe(takeUntil(this._destroyed$)).subscribe((d) => {
      this.editingDevice = _.cloneDeep(d);
      this.copyDevice = _.cloneDeep(d);
    });

    this.editMode$.pipe(takeUntil(this._destroyed$)).subscribe((editMode) => {
      this.editMode = editMode;
    });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  onDeviceChanged() {
    if (this.editMode) {
      for (let index = 0; index < this.editingDevice?.selectedBookingStatus?.length; index++) {
        const element = this.editingDevice?.selectedBookingStatus[index];
        const idx = this.copyDevice?.selectedBookingStatus.findIndex((a) => a.bookingStatus === element.bookingStatus);

        if (idx > -1) {
          if (element.selected !== this.copyDevice?.selectedBookingStatus[idx]?.selected) {
            this.store.dispatch(new UpdateEditingDevice(this.editingDevice));
          }
        }
      }
    }
  }
}
