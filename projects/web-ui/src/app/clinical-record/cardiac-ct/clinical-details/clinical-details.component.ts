import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { addMinutes } from 'date-fns';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CardiacContainerDO,
  GetAllListItems,
  ListClient,
  ListItemDefinition,
  ListToQuery,
  UnitConversionClient,
} from '../../../../../../../Generated/CoreAPIClient';
import { DateTimeHelperService } from '../../../shared/helpers/date-time-helper.service';
import { ClinicalRecordAppState } from '../../store/clinical-record.reducers';
import { selectShowReportBeside } from '../../store/clinical-record.selectors';
import {
  CardiacCTBloodPressureChanged,
  CardiacCTCalculateBMI,
  CardiacCTCalculateBSA,
  CardiacCTConvertToCentimeters,
  CardiacCTConvertToGrams,
  CardiacCTFetchBMIDesc,
  CardiacCTHeartRateChanged,
  CardiacCTHeightChanged,
  CardiacCTHospitalSiteChange,
  CardiacCTProcedureDateChanged,
  CardiacCTTestDateChanged,
  CardiacCTWeightChanged,
  CardiacCTDurationChanged,
  CardiacCTStaffChanged,
  CardiacCTIndicationsChanged,
  CardiacCTRiskFactorsChanged,
  CardiacCTRiskFactorsDetailsChanged,
  CardiacCTIndicationsDetailsChanged,
} from '../store/cardiac-ct.actions';
import {
  selectCardiacCTBloodPressureDiastolic,
  selectCardiacCTBloodPressureSystolic,
  selectCardiacCTBMI,
  selectCardiacCTBmiDesc,
  selectCardiacCTBmiValues,
  selectCardiacCTBSA,
  selectCardiacCTDuration,
  selectCardiacCTHeartRate,
  selectCardiacCTHeight,
  selectCardiacCTHospitalLocation,
  selectCardiacCTIndications,
  selectCardiacCTIndicationsDetails,
  selectCardiacCTLocations,
  selectCardiacCTProcedureEndDate,
  selectCardiacCTRiskFactors,
  selectCardiacCTRiskFactorsDetails,
  selectCardiacCTStaffByRoleName,
  selectCardiacCTStaffId,
  selectCardiacCTTestDate,
  selectCardiacCTWeight,
  selectCardiacCTStaffUsed,
  selectCardiacCTIndicationsListGrid,
  selectCardiacCTIndicationsList,
  selectCardiacCTRiskFactorsListGrid,
  selectCardiacCTRiskFactorsList,
} from '../store/cardiac-ct.selectors';

@Component({
  selector: 'app-clinical-details',
  templateUrl: './clinical-details.component.html',
  styleUrls: ['./clinical-details.component.css'],
})
export class ClinicalDetailsComponent implements OnInit, OnDestroy, AfterViewInit {
  private _destroyed$ = new Subject<void>();
  private _metricsDestroyed$ = new Subject<void>();
  private _duration$ = new Subject<void>();

  @Output() event: EventEmitter<CardiacContainerDO> = new EventEmitter();
  @Output() contentReady: EventEmitter<void> = new EventEmitter();

  showReportBeside$ = this.store.pipe(select(selectShowReportBeside));
  durationSelectors$ = this.store.pipe(select(selectCardiacCTProcedureEndDate));
  selectDuration$ = this.store.pipe(select(selectCardiacCTDuration));
  selectTestDate$ = this.store.pipe(select(selectCardiacCTTestDate));
  hospitalLocations$ = this.store.pipe(select(selectCardiacCTLocations));
  selectedLocation$ = this.store.pipe(select(selectCardiacCTHospitalLocation));
  height$ = this.store.pipe(select(selectCardiacCTHeight));
  weight$ = this.store.pipe(select(selectCardiacCTWeight));
  bmiDesc$ = this.store.pipe(select(selectCardiacCTBmiDesc));
  bmi$ = this.store.pipe(select(selectCardiacCTBMI));
  bsa$ = this.store.pipe(select(selectCardiacCTBSA));
  bmiValues$ = this.store.pipe(select(selectCardiacCTBmiValues));
  indications$ = this.store.pipe(select(selectCardiacCTIndications));
  indicationsDetails$ = this.store.pipe(select(selectCardiacCTIndicationsDetails));
  indicationsListGrid$ = this.store.pipe(select(selectCardiacCTIndicationsListGrid));
  riskFactorsListGrid$ = this.store.pipe(select(selectCardiacCTRiskFactorsListGrid));
  riskFactorsList$ = this.store.pipe(select(selectCardiacCTRiskFactorsList));
  indicationsList$ = this.store.pipe(select(selectCardiacCTIndicationsList));
  riskFactors$ = this.store.pipe(select(selectCardiacCTRiskFactors));
  riskFactorsDetails$ = this.store.pipe(select(selectCardiacCTRiskFactorsDetails));
  heartRate$ = this.store.pipe(select(selectCardiacCTHeartRate));
  bloodPressureSystolic$ = this.store.pipe(select(selectCardiacCTBloodPressureSystolic));
  bloodPressureDiastolic$ = this.store.pipe(select(selectCardiacCTBloodPressureDiastolic));
  staffUsed$ = this.store.pipe(select(selectCardiacCTStaffUsed));
  procedures = [{ name: 'Cardiac CT', procedureId: 1 }];
  fellowList$ = this.store.pipe(select(selectCardiacCTStaffByRoleName('CT Fellow')));
  cardiologistsList$ = this.store.pipe(select(selectCardiacCTStaffByRoleName('CT Doctor')));
  radiographersList$ = this.store.pipe(select(selectCardiacCTStaffByRoleName('CT Radiographer')));
  techniciansList$ = this.store.pipe(select(selectCardiacCTStaffByRoleName('CT Technician')));
  cardiologist$ = this.store.pipe(select(selectCardiacCTStaffId('CT Doctor')));
  radiographer$ = this.store.pipe(select(selectCardiacCTStaffId('CT Radiographer')));
  technician$ = this.store.pipe(select(selectCardiacCTStaffId('CT Technician')));
  fellow$ = this.store.pipe(select(selectCardiacCTStaffId('CT Fellow')));
  mosteller = ['Mosteller'];
  feetEnabled = false;
  stoneEnabled = false;
  heightUnit = 'cm';
  weightUnit = 'kg';
  heightBtn = 'Feet/Inches';
  weightBtn = 'Stone/Pound';
  formatWeight = '#.000';
  containerId: number;
  now = new Date();
  duration = 60;
  selectedItems: ListItemDefinition[] = [];
  selectedRiskItems: ListItemDefinition[] = [];
  indicationsList = false;
  riskFactorsList = false;
  list: GetAllListItems = new GetAllListItems();
  listType = ListToQuery;
  indicationsListItems: ListItemDefinition[] = [];
  riskFactorsListItems: ListItemDefinition[] = [];
  feet = 0;
  inches: number;
  height = 0;
  inchesResult = 0;
  poundsResult = 0;
  stone = 0;
  weight = 0;
  pounds: number;
  heightTemp = 0;
  inchesResultTemp = 0;
  weightTemp = 0;
  poundsResultTemp = 0;
  currentHeight: number;
  currentWeight: number;
  feetTemp: number;
  stoneTemp: number;

  constructor(private store: Store<ClinicalRecordAppState>,
    private listClient: ListClient, private dateHelper: DateTimeHelperService,
    private cdRef: ChangeDetectorRef, private unitConversion: UnitConversionClient) { }

  ngOnInit() {
    this.getDuration();
    this.getHeight();
    this.getWeight();
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  ngAfterViewInit() {
    this.contentReady.emit();
  }

  getDuration() {
    this.durationSelectors$.pipe(takeUntil(this._duration$)).subscribe((response) => {
      if ((!response.end) && (response.start)) {
        const procedureEndDate = addMinutes(response.start, this.duration);
        this.store.dispatch(new CardiacCTProcedureDateChanged(this.dateHelper.getDateTimeDO(procedureEndDate)));
      }
      if ((response.end) && (response.start)) {
        const procedureEndDate = moment(response.end);
        const testDate = moment(response.start);
        if ((moment.duration(procedureEndDate.diff(testDate)).asMinutes() <= 0)
         || (!moment.duration(procedureEndDate.diff(testDate)).asMinutes())) {
          this.duration = 60;
        } else {
          this.duration = moment.duration(procedureEndDate.diff(testDate)).asMinutes();
        }
      }
    });
  }

  getInchesFromCentimeters(cm: number) {
    this.unitConversion.getInchesFromCentimeters(cm).subscribe((response) => {
      this.inchesResult = response.data;
      this.feet = this.inchesResult / 12;
      this.height = Math.floor(this.feet);
      this.inches = parseFloat((this.inchesResult % 12).toFixed(2));
      this.inchesResultTemp = (this.height * 12) + this.inches;
      this.feetTemp = this.height;
    });
  }

  getCentimetersFromInches(inches: number) {
    this.unitConversion.getCentimetersFromInches(inches).subscribe((response) => {
      this.height = parseFloat((response.data).toFixed(2));
      this.heightTemp = this.height;
    });
  }

  getPoundsFromGrams(grams: number) {
    this.unitConversion.getPoundsFromGrams(grams * 1000).subscribe((response) => {
      this.poundsResult = response.data;
      this.stone = this.poundsResult / 14;
      this.weight = Math.floor(this.stone);
      this.pounds = parseFloat((this.poundsResult % 14).toFixed(2));
      this.poundsResultTemp = (this.weight * 14) + this.pounds;
      this.stoneTemp = this.weight;
    });
  }

  getGramsFromPounds(pounds: number) {
    this.unitConversion.getGramsFromPounds(pounds).subscribe((response) => {
      this.weight = response.data;
      this.weightTemp = this.weight;
    });
  }

  onTestDateChanged(e: any) {
    this._duration$.next();
    this._duration$.complete();
    const testDate = this.dateHelper.getDateTimeDO(new Date(e.value));
    const procedureEndDate = addMinutes(e.value, this.duration);
    this.store.dispatch(new CardiacCTProcedureDateChanged(this.dateHelper.getDateTimeDO(procedureEndDate)));
    this.store.dispatch(new CardiacCTTestDateChanged(testDate));
  }

  onHospitalSiteChanged(e: any) {
    this.store.dispatch(new CardiacCTHospitalSiteChange(e.value));
  }

  onDurationChanged(e: any) {
    this.store.dispatch(new CardiacCTDurationChanged(e.value));
    // this.selectTestDate$.pipe(takeUntil(this._duration$)).subscribe(response => {
    //   const procedureEndDate = addMinutes(response, e.value);
    //   this.store.dispatch(new CardiacCTProcedureDateChanged(this.dateHelper.getDateTimeDO(procedureEndDate)));
    // });
  }

  bloodPressureChanged(e: any, typeString: string) {
    this.store.dispatch(new CardiacCTBloodPressureChanged({ type: typeString, value: e.value }));
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
    this.calculateBMI();
  }

  calculateBMI() {
    if ((this.currentHeight) && (this.currentWeight)) {
      this.store.dispatch(new CardiacCTCalculateBMI({ height: this.currentHeight, weight: this.currentWeight }));
      this.store.dispatch(new CardiacCTCalculateBSA({
        height: this.currentHeight,
        weight: (this.currentWeight * 1000),
      }));
      this.store.dispatch(new CardiacCTFetchBMIDesc());
    }
  }

  riskFactorsDetailsChange(e: any) {
    this.store.dispatch(new CardiacCTRiskFactorsDetailsChanged(e.value));
  }

  indicationsDetailsChange(e: any) {
    this.store.dispatch(new CardiacCTIndicationsDetailsChanged(e.value));
  }

  StaffChanged(e: any, text: string) {
    if (e.event) {
      this.store.dispatch(new CardiacCTStaffChanged({ staffId: e.value, roleText: text }));
      this.staffUsed$.subscribe((response) => {
        const staff = response.find((a) => a.roleText === text);
        if (!staff) {
          // Clear drop-down here
        }
      });
    }
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

    this.calculateBMI();
  }

  listIndications() {
    // let indications: number[];
    this.list.listGroup = 'CardiacCT';
    this.list.listName = 'Indications';
    this.list.listToQuery = this.listType.List_Cardio;
    // this.indications$.pipe(takeUntil(this._destroyed$)).subscribe((i) => {
    //   indications = i;
    //   return i;
    // });
    this.listClient.getAllListItems(this.list).subscribe((response) => {
      if (response.data) {
        this.indicationsListItems = response.data.results;
        // this.listIndicationsGrid(response.data.results , indications);
      }
    });
  }

  listIndicationsGrid() {
    this.indicationsList = true;
    this.indicationsListGrid$.pipe(takeUntil(this._destroyed$)).subscribe((response) => {
      if (response) {
        this.selectedItems = response;
      }
    });
  }

  listRiskFactorsGrid() {
    this.riskFactorsList = true;
    this.riskFactorsListGrid$.pipe(takeUntil(this._destroyed$)).subscribe((response) => {
      if (response) {
        this.selectedRiskItems = response;
      }
    });
  }

  closeIndication() {
    this.indicationsList = false;
    const indications = [];
    this.selectedItems.forEach((c) => {
      indications.push(c.list_ID);
    });
    this.store.dispatch(new CardiacCTIndicationsChanged(indications));
  }

  closeRiskFactors() {
    this.riskFactorsList = false;
    const riskFactors = [];
    this.selectedRiskItems.forEach((c) => {
      riskFactors.push(c.list_ID);
    });
    this.store.dispatch(new CardiacCTRiskFactorsChanged(riskFactors));
  }

  selectionChanged(e: any, list: ListItemDefinition[], type: string) {
    if (e.addedItems.length > 0) {
      if (e.addedItems[0].itemID === 1) { // is the selected item 'none' which has a value itemID of 1
        list = [];
        list.push(e.addedItems[0]);
      } else {
        const indx = list.findIndex((a) => a.itemID === 1);
        if (indx > -1) {
          list = [];
          list.push(e.addedItems[0]);
        }
      }
      if (type === 'indications') {
        this.selectedItems = list;
      } else {
        this.selectedRiskItems = list;
      }
    }
  }

  /*
  selectionChanged(e: any) {
    if (e.addedItems.length > 0) {
      if (e.addedItems[0].itemID === 1) {
        this.selectedItems = [];
        this.selectedItems.push(e.addedItems[0]);
      } else {
        const indx = this.selectedItems.findIndex(a => a.itemID === 1);
        this.selectedItems.splice(indx, 1);
      }
    }
  }
  */

  enableFeet(height: number, inches: number) {
    if ((height || height === 0) || (inches || inches === 0)) {
      if (!this.feetEnabled) {
        this.feetEnabled = true;
        this.cdRef.detectChanges();
        this.heightUnit = 'feet ';
        this.heightBtn = 'Centimeters';
        if (this.heightTemp !== height) {
          this.getInchesFromCentimeters(height);
          this.heightTemp = height;
        } else {
          this.height = this.feetTemp;
        }
      } else {
        if (!this.height) {
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
    } else if (!this.feetEnabled) {
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

  enableStone(weight: number, pounds: number) {
    if ((weight || weight === 0) || (pounds || pounds === 0)) {
      if (!this.stoneEnabled) {
        this.stoneEnabled = true;
        this.cdRef.detectChanges();
        this.weightUnit = 'stone';
        this.weightBtn = 'Kg';
        this.formatWeight = '0#.0';
        if (this.weightTemp !== weight) {
          this.getPoundsFromGrams(weight);
          this.weightTemp = weight;
        } else {
          this.weight = this.stoneTemp;
        }
        // this.weightTemp = weight;
      } else {
        if (!this.weight) {
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
    } else if (!this.stoneEnabled) {
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

  getHeight() {
    this.height$.pipe(takeUntil(this._metricsDestroyed$)).subscribe((response) => {
      this.height = response;
    });

    this.bmiValues$.pipe(takeUntil(this._destroyed$)).subscribe((response) => {
      this.currentHeight = response.height;
      this.currentWeight = response.weight;
    });

    this.height = this.currentHeight;
    this.weight = this.currentWeight;
  }

  getWeight() {
    this.weight$.pipe(takeUntil(this._metricsDestroyed$)).subscribe((response) => {
      this.weight = response;
    });
  }
}
