import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { subDays } from 'date-fns';
import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';
import { DxRadioGroupComponent, DxDataGridComponent } from 'devextreme-angular';
import { Store } from '@ngrx/store';
import {
  AssetDeviceDO,
  EquipmentTransactionDO,
  Patient,
  AddPatientApiRequestParams,
  PatientClient,
  PAPManagementSearchDO,
  PAPModel,
  PAPSearchModel,
  InventoryCategoryDO,
  PAPPaymentStatus,
  AssetDeviceClient,
  APIResponseOfListOfAssetDeviceDO,
  APIResponseOfListOfEquipmentTransactionDO,
  APIResponseOfListOfInventoryCategoryDO,
  APIResponseOfListOfPAPPaymentStatus,
  APIResponseOfListOfPAPSearchModel,
} from '../../../../../../Generated/CoreAPIClient';
import { PapSystemService } from '../pap-system.service';
import { PAPTypeFilterDO } from '../../shared/models/Pap-System/PAPTypeFilterDO.model';
import { PAPDropDownValue } from '../../shared/models/Pap-System/PAPDropdownValue.model';
import { AppState } from '../../app-store/reducers';
import { SetError } from '../../app-store/app-ui-state.actions';

@Component({
  selector: 'app-pap-tracking',
  templateUrl: './pap-tracking.component.html',
  styleUrls: ['./pap-tracking.component.css'],
})
export class PapTrackingComponent implements OnInit {
  @ViewChild(DxRadioGroupComponent) radioGroup: DxRadioGroupComponent;
  @ViewChild('tracking_grid') trackingGrid: DxDataGridComponent;

  searchCriteria: PAPManagementSearchDO;
  transactions: EquipmentTransactionDO[];
  issuingDateFrom = subDays(new Date(), 30);
  issuingDateTo = new Date();
  paymentStatuses: PAPPaymentStatus[];
  currentPastOptions: string[] = ['All', 'Current Only', 'Past Only'];
  assets: AssetDeviceDO[];
  patient: Patient;
  dependency: PAPDropDownValue[];
  papTypes: InventoryCategoryDO[] = [];
  papPumpTypes: string[] = [];
  filterCombinedType: PAPTypeFilterDO = new PAPTypeFilterDO();
  papCombinedTypes: PAPTypeFilterDO[] = [];
  models: PAPSearchModel[] = [];
  displayModels: PAPSearchModel[] = [];
  state: any;
  currentPast:string;
  masterCategory: number;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private papService: PapSystemService,
    private patientClient: PatientClient,
    private titleService: Title,
    private assetDeviceClient: AssetDeviceClient,
    private store: Store<AppState>) {
    this.dependency = _.cloneDeep(papService.dependencyOptions);
    this.dependency.unshift({ displayValue: null, value: null });
    this.titleService.setTitle('Equipment Tracking');
    this.route.params.subscribe((params) => {
      // unary operator + parse string from url param to number
      this.masterCategory = +params['master-category-id'];
      const patientId = +params.patientId;

      if (patientId) {
        this.getPatient(patientId);
      }
    });

    this.searchCriteria = new PAPManagementSearchDO({
      searchBefore: false,
      inputDate: null,
      inputDate2: null,
      equipmentType: null,
      manufacturer: null,
      model: null,
      status: null,
      mustBeAvailable: false,
      paymentStatus: null,
      dependencyLevel: null,
      patientID: null,
    });
  }

  getPatient(patientId: number) {
    this.papService.trackingSearch = JSON.parse(localStorage.getItem('tracking_search'));

    this.patientClient.getPatient(patientId).subscribe((result: AddPatientApiRequestParams) => {
      this.patient = result as Patient;
      this.searchCriteria.patientID = result.patient_ID;
      this.getPatientEquipment(this.patient.patient_ID);
    }, () => this.store.dispatch(new SetError({
      errorMessages: ['Unable to process query, please check your network connection.'],
    })));
  }

  ngOnInit() {
    if (this.papService.actionStart) {
      this.state = JSON.parse(localStorage.getItem('tracking_storage'));
      this.papService.trackingSearch = JSON.parse(localStorage.getItem('tracking_search'));
      this.searchCriteria = this.papService.trackingSearch;
      this.currentPast = this.papService.currentPast ? this.papService.currentPast : 'All';

      if (this.state != null) {
        this.search();
        this.populateLists();
        this.getModels();
        this.papService.actionStart = false;
      }
    } else {
      this.currentPast = 'All';
      localStorage.clear();

      if (this.searchCriteria) {
        this.search();
      } else {
        this.getAssets();
      }

      this.populateLists();
      this.getModels();
    }
  }

  edit(transactionId: number) {
    this.state = this.trackingGrid.instance.state();
    localStorage.setItem('tracking_storage', JSON.stringify(this.state));
    this.papService.actionStart = true;
    this.papService.editAssignT = true;
    this.router.navigate([`pap-system/transaction-viewer/${this.patient.patient_ID}/
    ${this.masterCategory}/-1/${transactionId}`]);
  }

  assign(patientID: number) {
    this.router.navigate([`pap-system/assign-equipment/${patientID}/${this.masterCategory}`]);
  }

  getAssets() {
    if (this.masterCategory) {
      this.assetDeviceClient.getAllEquipment(this.masterCategory).subscribe(
        (response: APIResponseOfListOfAssetDeviceDO) => {
          if (response?.errorMessage?.trim().length > 0) {
            this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
          } else {
            this.assets = response.data;
          }
        }, () => this.store.dispatch(new SetError({
          errorMessages: ['Unable to process query, please check your network connection.'],
        })));
    }
  }

  getPatientEquipment(id: number) {
    this.papService.trackingSearch = JSON.parse(localStorage.getItem('tracking_search'));

    this.assetDeviceClient.getPatientTransactions(id).subscribe(
      (response: APIResponseOfListOfEquipmentTransactionDO) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
          this.search();
        }
      }, () => this.store.dispatch(new SetError({
        errorMessages: ['Unable to process query, please check your network connection.'],
      })));
  }

  doubleClickRow(e: any) {
    const { component } = e;
    const prevClickTime = component.lastClickTime;
    component.lastClickTime = new Date();

    if (prevClickTime && (component.lastClickTime - prevClickTime < 300)) {
      this.edit(e.data.transactionID);
    }
  }

  getDependencyDisplay(value: number): string {
    const result: PAPDropDownValue = this.papService.dependencyOptions.find((d) => d.value === value);

    if (result !== undefined) {
      return result.displayValue;
    }

    return 'error: invalid Dependency Level';
  }

  reset() {
    this.papTypes[0] = new InventoryCategoryDO();
    this.radioGroup.instance.option('value', this.currentPastOptions[0]);

    if (this.searchCriteria?.equipmentType
      && this.papTypes[this.papTypes.length - 1].categoryId === this.searchCriteria?.equipmentType?.categoryId) {
      this.papTypes.pop();
    }

    this.assets = [];
    this.clearFilter();
    this.getPatientEquipment(this.patient.patient_ID);
    this.displayModels = this.models;
    this.search();
  }

  search() {
    localStorage.setItem('tracking_search', JSON.stringify(this.searchCriteria));

    this.assetDeviceClient.searchTransactions(this.searchCriteria).subscribe(
      (response: APIResponseOfListOfEquipmentTransactionDO) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
          this.transactions = response.data;
        }
      }, () => this.store.dispatch(new SetError({
        errorMessages: ['Unable to process query, please check your network connection.'],
      })));
  }

  populateLists() {
    if (this.masterCategory) {
      this.assetDeviceClient.getEquipmentTypes(this.masterCategory).subscribe(
        (response: APIResponseOfListOfInventoryCategoryDO) => {
          if (response?.errorMessage?.trim().length > 0) {
            this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
          } else {
            this.papTypes = response.data;
            this.papTypes.unshift(null);

            if (this.searchCriteria.equipmentType) {
              this.papTypes.push(this.searchCriteria.equipmentType);
            }
          }
        }, () => this.store.dispatch(new SetError({
          errorMessages: ['Unable to process query, please check your network connection.'],
        })));
    }

    this.assetDeviceClient.getPaymentStatuses().subscribe((response: APIResponseOfListOfPAPPaymentStatus) => {
      if (response?.errorMessage?.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.paymentStatuses = response.data;
        this.paymentStatuses.unshift(null);
      }
    }, () => this.store.dispatch(new SetError({
      errorMessages: ['Unable to process query, please check your network connection.'],
    })));
  }

  updateSearchCriteriaType() {
    this.revaluateModels();
  }

  clearFilter() {
    this.searchCriteria = new PAPManagementSearchDO({
      searchBefore: false,
      inputDate: null,
      inputDate2: null,
      equipmentType: null,
      manufacturer: null,
      model: null,
      status: null,
      mustBeAvailable: false,
      paymentStatus: null,
      dependencyLevel: null,
    });

    this.searchCriteria.patientID = this.patient.patient_ID;
  }

  handleRadioGroup(e: any) {
    if (e.value === 'All') {
      this.papService.currentPast = 'All';
      this.searchCriteria.searchBefore = false;
      this.searchCriteria.mustBeAvailable = false;
    } else if (e.value === 'Current Only') {
      this.papService.currentPast = 'Current Only';
      this.searchCriteria.searchBefore = false;
      this.searchCriteria.mustBeAvailable = true;
    } else if (e.value === 'Past Only') {
      this.papService.currentPast = 'Past Only';
      this.searchCriteria.searchBefore = true;
      this.searchCriteria.mustBeAvailable = false;
    }
  }

  getModels() {
    if (this.masterCategory) {
      this.assetDeviceClient.getModels(this.masterCategory).subscribe((response: APIResponseOfListOfPAPSearchModel) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
          this.models = response.data;
          this.models.unshift(new PAPModel({
            productId: null, model: null, manufacturer: null, equipmentType: null,
          }));
          this.displayModels = response.data;
        }
      }, () => this.store.dispatch(new SetError({
        errorMessages: ['Unable to process query, please check your network connection.'],
      })));
    }
  }

  revaluateModels() {
    this.displayModels = this.models;

    if (this.searchCriteria.equipmentType != null) {
      this.displayModels = this.displayModels.filter((f) => ((f?.models?.find((x) => x?.equipmentType?.find(
        (y) => y?.categoryId === this.searchCriteria?.equipmentType?.categoryId) !== undefined) || f.model === null)
      ));
    }

    if (this.searchCriteria.manufacturer != null) {
      this.displayModels = this.displayModels.filter((f) => ((f?.models?.find(
        (x) => x?.manufacturer?.company_ID === this.searchCriteria?.manufacturer?.company_ID || f.model === null)
      )));
    }
  }

  combineEquipmentTypes(equipmentTypes: InventoryCategoryDO[]): string {
    let combinedTypes = '';

    if (equipmentTypes.length > 0) {
      combinedTypes += equipmentTypes[0].categoryName;
    }

    for (let index = 0; index < equipmentTypes.length; index++) {
      combinedTypes += `, ${equipmentTypes[index].categoryName}`;
    }

    return combinedTypes;
  }

  convertPaymentStatus(statusIndex: number): string {
    if (this.paymentStatuses.find((x) => x != null && x.statusId === statusIndex)) {
      const status = this.paymentStatuses.find((x) => x != null && x.statusId === statusIndex).statusName;

      if (status) { return status; } return '';
    }

    return '';
  }
}
