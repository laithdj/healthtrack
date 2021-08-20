import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FieldsList } from '../../shared/enums/hiddenFields';
import { CardiacContainerDO, UnitConversionClient, NormalisedResultsType } from '../../../../../../../Generated/CoreAPIClient';
import { takeUntil } from 'rxjs/operators';
import { ClinicalRecordAppState } from '../../store/clinical-record.reducers';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { selectShowReportBeside } from '../../store/clinical-record.selectors';
import { CardiacCTConvertToCentimeters, CardiacCTHeightChanged, CardiacCTConvertToGrams,
  CardiacCTWeightChanged, CardiacCTUpdateNormalisedResult, CardiacCTHeartRateChanged } from '../store/cardiac-ct.actions';
import { alert } from 'devextreme/ui/dialog';
import { selectCardiacCTBloodPressureDiastolic, selectCardiacCTBloodPressureSystolic, selectCardiacCTBmiValues, selectCardiacCTHeartRate, selectCardiacCTHeight, selectCardiacCTWeight } from '../store/cardiac-ct.selectors';

@Component({
  selector: 'app-nursing',
  templateUrl: './nursing.component.html',
  styleUrls: ['./nursing.component.css']
})
export class NursingComponent implements OnInit {
  private _destroyed$ = new Subject<void>();
  private _metricsDestroyed$ = new Subject<void>();
  
  bloodPressureSystolic$ = this.store.pipe(select(selectCardiacCTBloodPressureSystolic));
  bloodPressureDiastolic$ = this.store.pipe(select(selectCardiacCTBloodPressureDiastolic));
  heartRate$ = this.store.pipe(select(selectCardiacCTHeartRate));
  height$ = this.store.pipe(select(selectCardiacCTHeight));
  showReportBeside$ = this.store.pipe(select(selectShowReportBeside));
  bmiValues$ = this.store.pipe(select(selectCardiacCTBmiValues));
  gtnOptions = [{ id: 1, name: 'Yes' }, { id: 2, name: 'No' }];
  adverseOptions = [{ id: 0, name: 'None' }, { id: 1, name: 'Hypotension' }, { id: 2, name: 'Anaphylaxis' },
    { id: 3, name: 'Rash' }, { id: 4, name: 'Vomiting (expanded)' }];
  adverse = false;
  fieldsEnum = new FieldsList();
  hiddenField = this.fieldsEnum.hiddenField;
  height = 0;
  feetEnabled = false;
  inches = 0;
  inchesResultTemp = 0;
  heightUnit = 'cm';
  heightBtn = 'Feet/Inches';
  heightTemp = 0;
  inchesResult = 0;
  feet = 0;
  weight = 0;
  stoneEnabled = false;
  pounds = 0;
  poundsResultTemp = 0;
  formatWeight = '#.000';
  weightUnit = 'kg';
  weightBtn = 'Stone/Pound';
  weightTemp = 0;
  poundsResult = 0;
  stone = 0;
  resultTypeEnum = NormalisedResultsType;
  oralMetoprolol = [25, 50, 100, 150, 200];
  ivMetoprolol = [5, 10, 15, 20];
  ivabradine = [10];
  currentWeight: number;
  currentHeight: number;
  weight$ = this.store.pipe(select(selectCardiacCTWeight));
  feetTemp: number;
  stoneTemp: number;


  constructor(private store: Store<ClinicalRecordAppState>, private unitConversion: UnitConversionClient,
    private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.getHeight();
    this.getWeight();
/*
    this.store.dispatch(new CardiacCTUpdateNormalisedResult({
      result: 1, referenceId: 17037,
      resultType: this.resultTypeEnum.Number
    }));*/
  }
  heartRateChanged(e: any) {
    this.store.dispatch(new CardiacCTHeartRateChanged(e.value));
  }
  heightChanged() {
    this._metricsDestroyed$.next();
    this._metricsDestroyed$.complete();
    this._destroyed$.complete();
    let height = 0;

    if (this.feetEnabled) {
      height = (this.height * 12) + this.inches;
      if (this.inchesResultTemp !== height) {
        this.store.dispatch(new CardiacCTConvertToCentimeters(height));
      }
    } else {
      this.store.dispatch(new CardiacCTHeightChanged(this.height));
    }
  }

  toggle(e: any, index: number) {
    if ((e === 0) || (!e)) {
      this.hiddenField[index] = 0;
    } else {
      this.hiddenField[index] = 1;
    }
  }

  enableFeet(height: number , inches: number) {
    if ((height) || (height === 0) || (inches) || (inches === 0)) {
      if (!this.feetEnabled) {
        this.feetEnabled = true;
        this.cdRef.detectChanges();
        this.heightUnit = 'feet ';
        this.heightBtn = 'Centimeters';
        if(this.heightTemp !== height){
          this.getInchesFromCentimeters(height);
          this.heightTemp = height;
        }else{
          this.height = this.feetTemp;
        }
      } else {
        if(!this.height){
          this.height = 0;
        }
        this.inchesResult = (this.height * 12) + this.inches;
        if (this.inchesResultTemp !== this.inchesResult) {
          this.inchesResultTemp = this.inches;
          this.feetTemp = this.height;
          this.getCentimetersFromInches(this.inchesResult);
        } else {
          this.height = this.heightTemp;
        }
        this.heightBtn = 'Feet/Inches';
        this.heightUnit = 'cm';
        this.feetEnabled = false;
        this.cdRef.detectChanges();
      }
    } else if ((!height) && (height !== 0) || (!inches) && (inches !== 0)) {
      if (!this.feetEnabled) {
        this.feetEnabled = true;
        this.cdRef.detectChanges();
        this.heightUnit = 'feet ';
        this.heightBtn = 'Centimeters';
      } else {
        this.heightBtn = 'Feet/Inches';
        this.heightUnit = 'cm';
        this.feetEnabled = false;
        this.cdRef.detectChanges();
      }
    }
  }

  enableStone(weight: number , pounds: number) {
    if ((weight) || (weight === 0) || (pounds) || (pounds === 0)) {
      if (!this.stoneEnabled) {
        this.stoneEnabled = true;
        this.cdRef.detectChanges();
        this.weightUnit = 'stone';
        this.weightBtn = 'Kg';
        this.formatWeight = '0#.0';
        if(this.weightTemp !== weight){
          this.getPoundsFromGrams(weight);
          this.weightTemp = weight;

        }else{
          this.weight = this.stoneTemp;
        }
        // this.weightTemp = weight;
      } else {
        if(!this.weight){
          this.weight = 0;
        }
        this.poundsResult = (this.weight * 14) + this.pounds;
        if (this.poundsResultTemp !== this.poundsResult) {
          this.poundsResultTemp = this.pounds;
          this.stoneTemp = this.weight;
          this.getGramsFromPounds(this.poundsResult / 1000);
        } else {
          this.weight = this.weightTemp;
        }
        this.weightUnit = 'Kg';
        this.weightBtn = 'Stone/Pound';
        this.formatWeight = '0#.000';
        this.stoneEnabled = false;
        this.cdRef.detectChanges();
      }
    } else if ((!weight) && (weight !== 0) || (!pounds) && (pounds !== 0)) {
      if (!this.stoneEnabled) {
        this.stoneEnabled = true;
        this.cdRef.detectChanges();
        this.weightUnit = 'stone';
        this.weightBtn = 'Kg';
        this.formatWeight = '0#.0';
      } else {
        this.weightUnit = 'Kg';
        this.weightBtn = 'Stone/Pound';
        this.formatWeight = '0#.000';
        this.stoneEnabled = false;
        this.cdRef.detectChanges();
      }
    }
  }

  getInchesFromCentimeters(cm: number) {
    this.unitConversion.getInchesFromCentimeters(cm).subscribe(response => {
      this.inchesResult = response.data;
      this.feet = this.inchesResult / 12;
      this.height = Math.floor(this.feet);
      this.inches = parseFloat((this.inchesResult % 12).toFixed(2));
      this.inchesResultTemp = (this.height * 12) + this.inches;
      this.feetTemp = this.height;
    });
  }

  getCentimetersFromInches(inches: number) {
    this.unitConversion.getCentimetersFromInches(inches).subscribe(response => {
      this.height = parseFloat((response.data).toFixed(2));
      this.heightTemp = this.height;
    });
  }

  getPoundsFromGrams(grams: number) {
    this.unitConversion.getPoundsFromGrams(grams * 1000).subscribe(response => {
      this.poundsResult = response.data;
      this.stone = this.poundsResult / 14;
      this.weight = Math.floor(this.stone);
      this.pounds = parseFloat((this.poundsResult % 14).toFixed(2));
      this.poundsResultTemp = (this.weight * 14) + this.pounds;
      this.stoneTemp = this.weight;
    });
  }

  getGramsFromPounds(pounds: number) {
    this.unitConversion.getGramsFromPounds(pounds).subscribe(response => {
      this.weight = response.data;
      this.weightTemp = this.weight;

    });
  }

  weightChanged() {
    this._metricsDestroyed$.next();
    this._metricsDestroyed$.complete();
    let weight = 0;
    if (this.stoneEnabled) {
      weight = (this.weight * 14) + this.pounds;
      if (this.poundsResultTemp !== weight) {
        this.store.dispatch(new CardiacCTConvertToGrams(weight / 1000));
      }
    } else {
      this.store.dispatch(new CardiacCTWeightChanged(this.weight));
    }
    // this.calculateBMI();
  }

  getHeight() {
    this.height$.pipe(takeUntil(this._metricsDestroyed$)).subscribe(response => {
      this.height = response;
    });
    this.bmiValues$.pipe(takeUntil(this._destroyed$)).subscribe(response => {
      this.currentHeight = response.height;
      this.currentWeight = response.weight;
    });
    this.height = this.currentHeight;
    this.weight = this.currentWeight;
  }

  getWeight() {
    this.weight$.pipe(takeUntil(this._metricsDestroyed$)).subscribe(response => {
      this.weight = response;
    });
  }

  validate(e: any) {
    console.log(e);
    if (e) {
      if(!parseInt(e)){
        alert('Value must be a number. Please insert a number', 'Attention');
      }
    }
  }
}
