import { Component, OnInit, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { DxDataGridComponent } from 'devextreme-angular';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectedBookingTypeDO } from '../../../../../../Generated/CoreAPIClient';
import { selectEditMode } from '../../app-store/app-ui.selectors';
import { CheckBookingTypes, UpdateBookingTypes } from '../store/licensedfeatures.actions';
import { LicensedFeatureAppState } from '../store/licensedfeatures.reducers';
import {
  selectedBookingTypesSelector,
  selectedFeatureSelector,
  editingDeviceSelector,
} from '../store/licensedfeatures.selectors';

@Component({
  selector: 'app-bookingtype-list',
  templateUrl: './bookingtype-list.component.html',
  styleUrls: ['./bookingtype-list.component.css'],
})

export class BookingtypeListComponent implements OnInit {
  private _destroyed$ = new Subject<void>();

  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;

  bookingTypes: SelectedBookingTypeDO[];
  selectedBookingTypes: SelectedBookingTypeDO[] = [];
  bookingTypes$ = this.store.pipe(select(selectedBookingTypesSelector));
  editingDevice$ = this.store.pipe(select(editingDeviceSelector));
  editMode$ = this.store.pipe(select(selectEditMode));
  selectedFeature$ = this.store.pipe(select(selectedFeatureSelector));
  editMode: boolean;
  selectedRowKeys = [];

  constructor(private store: Store<LicensedFeatureAppState>) {
    this.bookingTypes$.pipe(takeUntil(this._destroyed$)).subscribe((d) => {
      this.bookingTypes = _.cloneDeep(d);
    });
    this.editingDevice$.pipe(takeUntil(this._destroyed$)).subscribe((d) => {
      this.selectedBookingTypes = _.cloneDeep(d?.selectedBookingTypes);
    });
    this.editMode$.pipe(takeUntil(this._destroyed$)).subscribe((em) => {
      this.editMode = em;
      if ((em) && (this.selectedBookingTypes)) {
        this.selectedBookingTypes.forEach((bt) => {
          this.selectedRowKeys.push(bt?.bookingType);
        });
      } else {
        this.selectedRowKeys = [];
      }
    });
  }

  ngOnInit(): void {}

  onCheck(check: boolean) {
    if (check) {
      this.selectedRowKeys = [];
      this.bookingTypes.forEach((bt) => {
        this.selectedRowKeys.push(bt?.bookingType);
      });
    } else {
      this.selectedRowKeys = [];
    }
    this.store.dispatch(new CheckBookingTypes(check));
  }

  onChanged(e: any) {
    if (this.editMode) {
      if (e) {
        this.store.dispatch(new UpdateBookingTypes(e.selectedRowsData));
      }
    }
  }
}
