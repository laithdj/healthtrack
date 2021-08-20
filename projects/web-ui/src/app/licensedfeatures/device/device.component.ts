import { Component } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { LicensedFeatureAppState } from '../store/licensedfeatures.reducers';
import { selectedFeatureSelector } from '../store/licensedfeatures.selectors';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
})
export class DeviceComponent {
  selectedFeature$ = this.store.pipe(select(selectedFeatureSelector));

  constructor(private store: Store<LicensedFeatureAppState>) { }
}
