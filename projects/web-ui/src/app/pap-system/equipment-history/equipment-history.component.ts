import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import { Store } from '@ngrx/store';
import { PapSystemService } from '../pap-system.service';
import {
  APIResponseOfAssetDeviceDO,
  APIResponseOfListOfEquipmentTransactionDO,
  AssetDeviceClient,
  AssetDeviceDO,
  EquipmentTransactionDO,
  InventoryCategoryDO,
  InventoryCompanyDO,
  PAPManagementSearchDO,
} from '../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../app-store/app-ui-state.actions';
import { AppState } from '../../app-store/reducers';

@Component({
  selector: 'app-equipment-history',
  templateUrl: './equipment-history.component.html',
  styleUrls: ['./equipment-history.component.css'],
})
export class EquipmentHistoryComponent implements OnInit {
  @ViewChild(DxDataGridComponent) datagrid: DxDataGridComponent;
  saleAmountHeaderFilter: any;
  applyFilterTypes: any;
  currentFilter: any;
  transactions: EquipmentTransactionDO[];
  showFilterRow: boolean;
  showHeaderFilter: boolean;
  masterCategory: number;
  searchCriteria: PAPManagementSearchDO;
  equipment: AssetDeviceDO = new AssetDeviceDO();
  assetID: number;

  constructor(private titleService: Title,
    private papService: PapSystemService,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private assetDeviceClient: AssetDeviceClient,
    private router: Router) {
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
      equipmentID: null,
    });
    this.equipment.manufacturer = new InventoryCompanyDO();
    this.showFilterRow = true;
    this.titleService.setTitle('Equipment Tracking');
    this.route.params.subscribe((params) => {
      this.masterCategory = +params['master-category-id'];
      this.assetID = +params.assetID;
      if (this.assetID) {
        this.getEquipmentTransactions(this.searchCriteria);
        this.getEquipment(this.assetID);
      }
    });
  }

  ngOnInit() { }

  getEquipment(equipmentId: number) {
    this.assetDeviceClient.getEquipment(equipmentId, this.masterCategory).subscribe(
      (response: APIResponseOfAssetDeviceDO) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
      this.equipment = response.data;
  }
      }, () => this.store.dispatch(new SetError({
        errorMessages: ['Unable to process query, please check your network connection.'],
      })));
  }

  search() {
    this.getEquipmentTransactions(this.searchCriteria);
  }

  reset() {
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
      equipmentID: null,
    });

    this.getEquipmentTransactions(this.searchCriteria);
  }

  getEquipmentTransactions(searchCriteria: PAPManagementSearchDO) {
    this.searchCriteria.equipmentID = this.assetID;
    this.assetDeviceClient.searchTransactionsByEquipment(searchCriteria).subscribe(
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

  doubleClickRow(e: any) {
    // eslint-disable-next-line prefer-destructuring
    const component = e.component;
    const prevClickTime = component.lastClickTime;
    component.lastClickTime = new Date();

    if (prevClickTime && (component.lastClickTime - prevClickTime < 300)) {
      this.view(e.data.transactionID, e.data.patientID);
    }
  }

  view(transactionId: number, patientId: number) {
    this.papService.transactionHistory = true;
    this.papService.editAssignT = null;
    this.router.navigate([`pap-system/transaction-viewer/${patientId}/${
      this.masterCategory}/${this.assetID}/${transactionId}`]);
  }

  combineEquipmentTypes(equipmentTypes: InventoryCategoryDO[]): string {
    let combinedTypes = '';

    if (equipmentTypes) {
      if (equipmentTypes.length > 0) {
        combinedTypes += equipmentTypes[0].categoryName;
      }

      for (let _i = 1; _i < equipmentTypes.length; _i++) {
        combinedTypes += `, ${equipmentTypes[_i].categoryName}`;
      }
    }

    return combinedTypes;
  }
}
