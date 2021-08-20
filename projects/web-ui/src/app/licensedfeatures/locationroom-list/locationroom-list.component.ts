import * as _ from 'lodash';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { DxDataGridComponent } from 'devextreme-angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SelectedRoomDO } from '../../../../../../Generated/CoreAPIClient';
import { selectEditMode } from '../../app-store/app-ui.selectors';
import { CheckLocationRooms, UpdateLocationRooms } from '../store/licensedfeatures.actions';
import { LicensedFeatureAppState } from '../store/licensedfeatures.reducers';
import {
  selectedLocationRoomsSelector,
  selectedFeatureSelector,
  editingDeviceSelector,
} from '../store/licensedfeatures.selectors';

@Component({
  selector: 'app-locationroom-list',
  templateUrl: './locationroom-list.component.html',
  styleUrls: ['./locationroom-list.component.css'],
})

export class LocationRoomListComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject<void>();

  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;

  selectedLocationRooms: SelectedRoomDO[];
  locationRooms: SelectedRoomDO[];
  copySelectedLocationRooms: SelectedRoomDO[];
  editMode: boolean;
  selectedLocationRooms$ = this.store.pipe(select(selectedLocationRoomsSelector));
  editingDevice$ = this.store.pipe(select(editingDeviceSelector));
  editMode$ = this.store.pipe(select(selectEditMode));
  selectedFeature$ = this.store.pipe(select(selectedFeatureSelector));
  selectedRowKeys = [];

  constructor(private store: Store<LicensedFeatureAppState>) {
    this.selectedLocationRooms$.pipe(takeUntil(this._destroyed$)).subscribe((d) => {
      this.locationRooms = _.cloneDeep(d);
    });
    this.editingDevice$.pipe(takeUntil(this._destroyed$)).subscribe((d) => {
      this.selectedLocationRooms = _.cloneDeep(d?.selectedLocationRooms);
    });
    this.editMode$.pipe(takeUntil(this._destroyed$)).subscribe((em) => {
      this.editMode = em;
      if ((em) && (this.selectedLocationRooms)) {
        this.selectedLocationRooms.forEach((bt) => {
          this.selectedRowKeys.push(bt?.key);
        });
      } else {
        this.selectedRowKeys = [];
      }
    });
  }

  ngOnInit(): void {
    this.editMode$.subscribe((editing) => {
      if (this.dataGrid) {
        if (editing) {
          this.dataGrid.instance.columnOption('selected', 'filterValue', undefined);
        } else {
          this.dataGrid.instance.columnOption('selected', 'filterValue', true);
        }
      }
    });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
  onCheck(check: boolean) {
    if (check) {
      this.selectedRowKeys = [];
      this.locationRooms.forEach((bt) => {
        this.selectedRowKeys.push(bt?.key);
      });
    } else {
      this.selectedRowKeys = [];
    }
    this.store.dispatch(new CheckLocationRooms(check));
  }

  onChanged(e: any) {
    if (this.editMode) {
      if (e) {
        this.store.dispatch(new UpdateLocationRooms(e.selectedRowsData));
      }
    }
  }
}
