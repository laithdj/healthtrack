import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { EchocardiogramMeasurement, SimpleMeasurement, MeasurementUnit } from '../../echocardiogram-measurement.model';
import { EchocardiogramAppState } from '../../store/echocardiogram.reducers';
import { selectEchocardiogramMeasurements, selectSimpleMeasurements, selectClinicalRecordData, selectLVDiastole, selectLVSystole,
  selectLVDiastoleIndex, selectLVDiastoleHeight, selectLVSystoleIndex, selectIVSeptum, selectInferolateralWall, selectRVDiastole,
  selectTAPSE, selectAorticRoot, selectAscAorta, selectLeftAtrium, selectLeftAtriumIndex, selectEjectionFraction, selectEFCorrected,
  selectFractionalShortening, selectLVMass } from '../../store/echocardiogram.selectors';
import { selectEditMode } from '../../../../app-store/app-ui.selectors';

@Component({
  selector: 'app-echocardiogram-mmode2d',
  templateUrl: './echocardiogram-mmode2d.component.html',
  styleUrls: ['./echocardiogram-mmode2d.component.css']
})
export class EchocardiogramMMode2DComponent implements OnInit {
  // measurements: EchocardiogramMeasurement[];
  // simpleMeasurements: SimpleMeasurement[];
  // mMode2DMeasurements: EchocardiogramMeasurement[];
  mMode2DMeasurements$ = this.store.pipe(select(selectEchocardiogramMeasurements));
  // simpleMeasurements$ = this.store.pipe(select(selectSimpleMeasurements));
  // clinicalRecordData$ = this.store.pipe(select(selectClinicalRecordData));
  lvDiastole$ = this.store.pipe(select(selectLVDiastole));
  lvDiastoleIndex$ = this.store.pipe(select(selectLVDiastoleIndex));
  lvDiastoleHeight$ = this.store.pipe(select(selectLVDiastoleHeight));
  lvSystole$ = this.store.pipe(select(selectLVSystole));
  lvSystoleIndex$ = this.store.pipe(select(selectLVSystoleIndex));
  ivSeptum$ = this.store.pipe(select(selectIVSeptum));
  inferolateralWall$ = this.store.pipe(select(selectInferolateralWall));
  rvDiastole$ = this.store.pipe(select(selectRVDiastole));
  TAPSE$ = this.store.pipe(select(selectTAPSE));
  aorticRoot$ = this.store.pipe(select(selectAorticRoot));
  ascAorta$ = this.store.pipe(select(selectAscAorta));
  leftAtrium$ = this.store.pipe(select(selectLeftAtrium));
  leftAtriumIndex$ = this.store.pipe(select(selectLeftAtriumIndex));
  ejectionFraction$ = this.store.pipe(select(selectEjectionFraction));
  efCorrected$ = this.store.pipe(select(selectEFCorrected));
  fractionalShortening$ = this.store.pipe(select(selectFractionalShortening));
  lvMass$ = this.store.pipe(select(selectLVMass));
  measurementUnit = MeasurementUnit;
  editMode$ = this.store.pipe(select(selectEditMode));

  constructor(private store: Store<EchocardiogramAppState>) { }

  ngOnInit() {
    // this.mMode2DMeasurements$.subscribe(measurements => this.measurements = measurements);
    // this.simpleMeasurements$.subscribe(a => this.simpleMeasurements = a);
  }
}
