import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { select, Store } from '@ngrx/store';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { ToggleEditMode } from '../app-store/app-ui-state.actions';
import {
  FetchLicensedFeature,
  FetchLicensedFeatures,
  ResetEditedDevice,
  SetShowWorklist,
  ValidateWorklistDevice,
} from './store/licensedfeatures.actions';
import { LicensedFeatureAppState } from './store/licensedfeatures.reducers';
import { licensedFeaturesSelector,
  editingDeviceSelector,
  selectedFeatureSelector,
} from './store/licensedfeatures.selectors';
import { selectEditMode } from '../app-store/app-ui.selectors';
import { LicensedFeatureDO } from '../../../../../Generated/CoreAPIClient';

@Component({
  selector: 'app-licensedfeatures',
  templateUrl: './licensedfeatures.component.html',
  styleUrls: ['./licensedfeatures.component.css'],
})

export class LicensedFeaturesComponent implements OnInit {
  @ViewChild(DxSelectBoxComponent, { static: true }) featureSelector: DxSelectBoxComponent;

  features$ = this.store.pipe(select(licensedFeaturesSelector));
  features: LicensedFeatureDO[];
  onCancel$ = new Subject<any>();
  currentItemId = -1;
  editMode$ = this.store.pipe(select(selectEditMode));
  editingDevice$ = this.store.pipe(select(editingDeviceSelector));
  selectedFeature$ = this.store.pipe(select(selectedFeatureSelector));

  constructor(private store: Store<LicensedFeatureAppState>, private titleService: Title) {
    this.titleService.setTitle('Licensed Features Configuration');
  }

  ngOnInit(): void {
    this.store.dispatch(new FetchLicensedFeatures());

    this.onCancel$.pipe(
      map(() => this.store.dispatch(new ResetEditedDevice())),
      map(() => this.store.dispatch(new ToggleEditMode())),
    ).subscribe();
  }

  onLicensedFeatureChanged(e: any) {
    const selectedFeature = e?.selectedItem;
    if (selectedFeature?.id > 0 && this.currentItemId !== selectedFeature.id) {
      this.currentItemId = selectedFeature.id;
      this.store.dispatch(new FetchLicensedFeature(selectedFeature.id));
      this.store.dispatch(new SetShowWorklist(false));
    }
  }

  onContentReady() {
    if (!this.featureSelector.value) {
      this.featureSelector.value = 41;
    }
  }

  onSave() {
    this.editingDevice$.pipe(take(1)).subscribe((device) => {
      this.store.dispatch(new ValidateWorklistDevice(device));
    });
  }

  onToggleEdit() {
    this.store.dispatch(new ToggleEditMode());
  }
}
