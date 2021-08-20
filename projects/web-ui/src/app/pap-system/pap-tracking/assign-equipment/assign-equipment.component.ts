import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DxDataGridComponent, DxSelectBoxComponent } from 'devextreme-angular';
import { Store } from '@ngrx/store';
import { StompService } from '../../../../app/shared/stomp/stomp.service';
import { PapSystemService } from '../../pap-system.service';
import {
  AssetDeviceDO,
  PAPManagementSearchDO,
  Patient,
  PatientClient,
  AddPatientApiRequestParams,
  PAPSearchModel,
  InventoryCompanyDO,
  InventoryCategoryDO,
  AssetDeviceClient,
  APIResponseOfListOfAssetDeviceDO,
  APIResponseOfListOfInventoryCategoryDO,
  APIResponseOfListOfInventoryCompanyDO,
  APIResponseOfListOfPAPSearchModel,
  PAPModel,
} from '../../../../../../../Generated/CoreAPIClient';
import { EquipmentStatusDictionary } from '../../EquipmentStatus';
import { PAPDropDownValue } from '../../../shared/models/Pap-System/PAPDropdownValue.model';
import { PAPTypeFilterDO } from '../../../shared/models/Pap-System/PAPTypeFilterDO.model';
import { SetError } from '../../../app-store/app-ui-state.actions';
import { AppState } from '../../../app-store/reducers';

@Component({
  selector: 'app-assign-equipment',
  templateUrl: './assign-equipment.component.html',
  styleUrls: ['./assign-equipment.component.css'],
})

export class AssignEquipmentComponent implements OnInit {
  @ViewChild('assign_grid') assignGrid: DxDataGridComponent;
  @ViewChild('make_selector') makeSelector: DxSelectBoxComponent;

  assignRadio: string[] = [''];
  unassign = false;
  editMode:boolean;
  availableEquipment: AssetDeviceDO[] = [];
  equipmentStatuses: EquipmentStatusDictionary;
  searchCriteria: PAPManagementSearchDO;
  assets: AssetDeviceDO[];
  dependency: PAPDropDownValue[];
  papType: PAPDropDownValue[];
  papPumpType: PAPDropDownValue[] = [];
  patient: Patient;
  papTypes: InventoryCategoryDO[] = [];
  papPumpTypes: string[];
  papCombinedTypes: PAPTypeFilterDO[];
  filterCombinedType: PAPTypeFilterDO = new PAPTypeFilterDO();
  manufacturers: InventoryCompanyDO[];
  models: PAPSearchModel[] = [];
  displayModels: PAPSearchModel[] = [];
  state: any;
  masterCategory: number;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private stompService: StompService,
    protected papService: PapSystemService,
    private patientClient: PatientClient,
    private assetDeviceClient: AssetDeviceClient,
    private store: Store<AppState>,
    private titleService: Title) {
    this.equipmentStatuses = new EquipmentStatusDictionary();
    this.titleService.setTitle('Assign Equipment');
    this.dependency = papService.dependencyOptions;
    this.searchCriteria = new PAPManagementSearchDO({
      searchBefore: true,
      inputDate: null,
      equipmentType: null,
      manufacturer: null,
      model: null,
      status: null,
      mustBeAvailable: true,
    });

    this.papTypes[0] = new InventoryCategoryDO();
    this.route.params.subscribe((params) => {
      // unary operator + parse string from url param to number
      this.masterCategory = +params['master-category-id'];
      const patientId = +params.patientId;

      if (patientId) {
        this.getPatient(patientId);
      }
    });

    this.models = [];
  }

  ngOnInit() {
    if (this.papService.assignActionStart) { // Check to see that if a state should be assigned
      this.state = JSON.parse(localStorage.getItem('assign_storage')); // gets the state search criteria
      this.papService.assignSearch = JSON.parse(localStorage.getItem('assign_search'));

      if (this.papService.assignSearch) {
        this.searchCriteria = this.papService.assignSearch;
      }

      this.search();
      this.getAssets();
      this.populateLists();
      this.getModels();
      this.papService.assignActionStart = false;
    } else {
      localStorage.clear();
      this.search();
      this.getAssets();
      this.populateLists();
      this.getModels();
      this.papService.assignActionStart = false;
    }
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

  getPatient(patientId: number) {
    this.patientClient.getPatient(patientId).subscribe((result: AddPatientApiRequestParams) => {
      this.patient = result as Patient;
    }, () => this.store.dispatch(new SetError({
      errorMessages: ['Unable to process query, please check your network connection.'],
    })));
  }

  assign(equipmentId: number) {
    this.state = this.assignGrid.instance.state();
    localStorage.setItem('assign_storage', JSON.stringify(this.state));
    this.papService.assignActionStart = true;
    this.papService.editAssignT = false;
    this.router.navigate([`pap-system/transaction-viewer/${this.patient.patient_ID
    }/${this.masterCategory}/${equipmentId}`]);
  }

  back() {
    this.papService.changeAsset = false;
    this.router.navigate([`pap-system/pap-tracking/${this.patient.patient_ID}/${this.masterCategory}`]);
  }

  reset() {
    if (this.searchCriteria.equipmentType) {
      if (this.papTypes[this.papTypes.length - 1].categoryId === this.searchCriteria.equipmentType.categoryId) {
        this.papTypes.pop();
      }
    }

    if (this.searchCriteria.manufacturer) {
      const check = this.manufacturers[this.manufacturers.length - 1];
      if (check?.company_ID === this.searchCriteria.manufacturer.company_ID) {
        this.manufacturers.pop();
      }
    }

    this.searchCriteria = new PAPManagementSearchDO({
      searchBefore: true,
      inputDate: null,
      equipmentType: null,
      manufacturer: null,
      model: null,
      status: null,
      mustBeAvailable: true,
    });

    this.filterCombinedType = new PAPTypeFilterDO({ equipmentType: null, pumpType: null });
    this.displayModels = this.models;
    this.search();
  }

  search() {
    if (this.searchCriteria) {
      localStorage.setItem('assign_search', JSON.stringify(this.searchCriteria));
    }

    this.assetDeviceClient.searchEquipment(this.searchCriteria, this.masterCategory).subscribe(
      (response: APIResponseOfListOfAssetDeviceDO) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
          this.availableEquipment = response.data;
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

    this.assetDeviceClient.getManufacturers().subscribe((response: APIResponseOfListOfInventoryCompanyDO) => {
      if (response?.errorMessage?.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.manufacturers = response.data;
        this.manufacturers.unshift(null);
        if (this.searchCriteria.manufacturer) {
          this.manufacturers.push(this.searchCriteria.manufacturer);
        }
      }
    }, () => this.store.dispatch(new SetError({
      errorMessages: ['Unable to process query, please check your network connection.'],
    })));
  }

  updateSearchCriteriaType() {
    this.revaluateModels();
  }

  getModels() {
    if (this.masterCategory) {
      this.assetDeviceClient.getModels(this.masterCategory).subscribe((response: APIResponseOfListOfPAPSearchModel) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
          this.models = response.data;
          this.models.unshift(new PAPModel({
            productId: null,
            model: null,
            manufacturer: null,
            equipmentType: null,
          }));
          this.displayModels = response.data;
          this.revaluateModels();
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
        (y) => y.categoryId === this.searchCriteria.equipmentType.categoryId) !== undefined) || f.model === null)
      ));
    }

    if (this.searchCriteria.manufacturer != null) {
      this.displayModels = this.displayModels.filter((f) => ((f?.models?.find(
        (x) => x?.manufacturer?.company_ID === this.searchCriteria.manufacturer.company_ID || f.model === null)
      )));
    }
  }

  combineEquipmentTypes(equipmentTypes: InventoryCategoryDO[]): string {
    let combinedTypes = '';

    if (equipmentTypes.length > 0) {
      combinedTypes += equipmentTypes[0].categoryName;
    }

    for (let _i = 1; _i < equipmentTypes.length; _i++) {
      combinedTypes += `, ${equipmentTypes[_i].categoryName}`;
    }

    return combinedTypes;
  }
}
