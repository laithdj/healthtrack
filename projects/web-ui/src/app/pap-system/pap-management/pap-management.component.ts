import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { addDays, addMonths } from 'date-fns';
import { alert, confirm } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import * as _ from 'lodash';
import { take } from 'rxjs/operators';
import {
  DxButtonComponent,
  DxDateBoxComponent,
  DxNumberBoxComponent,
  DxCheckBoxComponent,
  DxSelectBoxComponent,
} from 'devextreme-angular';
import {
  AssetDeviceDO,
  AssetLastLoanedPatient,
  InventoryCategoryDO,
  InventoryCompanyDetailsDO,
  InventoryCompanyDO,
  PAPEquipmentStatus,
  PAPManagementSearchDO,
  PAPSearchModel,
  EquipmentPurpose,
  AssetDeviceClient,
  APIResponseOfListOfAssetDeviceDO,
  APIResponseOfAssetDeviceDO,
  APIResponseOfListOfInventoryCompanyDO,
  APIResponseOfAssetLastLoanedPatient,
  APIResponseOfListOfInventoryCategoryDO,
  APIResponseOfListOfPAPSearchModel,
  PAPModel,
  APIResponseOfListOfInventoryCompanyDetailsDO,
} from '../../../../../../Generated/CoreAPIClient';
import { EquipmentManagementScreen } from '../../../../../../Generated/HMS.Interfaces';
import { SetError } from '../../../../src/app/app-store/app-ui-state.actions';
import { selectUserPkId } from '../../app-store/app-ui.selectors';
import { AppState } from '../../app-store/reducers';
import { PAPDropDownValue } from '../../shared/models/Pap-System/PAPDropdownValue.model';
import { StompService } from '../../shared/stomp/stomp.service';
import { EquipmentStatus, EquipmentStatusDictionary } from '../EquipmentStatus';
import { PapSystemService } from '../pap-system.service';
import { EquipmentPurposeDictionary } from '../EquipmentType';

@Component({
  selector: 'app-pap-management',
  templateUrl: './pap-management.component.html',
  styleUrls: ['./pap-management.component.css'],
})
export class PapManagementComponent implements OnInit {
  @ViewChild('date_button1') dateButton1: DxButtonComponent;
  @ViewChild('date_button2') dateButton2: DxButtonComponent;
  @ViewChild('date_button3') dateButton3: DxButtonComponent;
  @ViewChild('service_date') serviceDate: DxDateBoxComponent;
  @ViewChild('calibration') calibration: DxNumberBoxComponent;
  @ViewChild('last_calibration') lastCalibration: DxDateBoxComponent;
  @ViewChild('add_last_calibration') addLastCalibration: DxDateBoxComponent;
  @ViewChild('calibration_add') calibrationAdd: DxNumberBoxComponent;
  @ViewChild('req') req: DxCheckBoxComponent;
  @ViewChild('status_con') statusCon: DxSelectBoxComponent;

  editAssetBool = false;
  nextServiceDate: Date;
  assets: AssetDeviceDO[] = [];
  assetsTemp: AssetDeviceDO[] = [];
  dependency: PAPDropDownValue[];
  papTypes: InventoryCategoryDO[];
  info = '';
  papPumpTypes: string[];
  special = false;
  movingFromDisabled = false;
  required = false;
  issuedFlag = false;
  specialSerial = false;
  issuedFilter = false;
  supplierVisible = false;
  lastCalibrationDate = new Date();
  suppliersCompanyIds: number[] = [];
  manufacturers: InventoryCompanyDO[];
  companyDetails: InventoryCompanyDetailsDO[] = [];
  styler = true;
  addAssetBool = false;
  deleteCellId: number;
  searchCriteria: PAPManagementSearchDO;
  equipmentStatuses = new EquipmentStatusDictionary();
  equipmentPurpose = new EquipmentPurposeDictionary();
  statusValues = PAPEquipmentStatus;
  purposeValues = EquipmentPurpose;
  tempAssetId: number;
  message = false;
  status = this.equipmentStatuses.statusValues;
  purpose = this.equipmentPurpose.purposeValues;
  statusIssued = [{ displayStatus: 'Issued', value: PAPEquipmentStatus.Issued }];
  deletePopup = false;
  deleteConfirmed = false;
  dateOptions: string[] = ['Before', 'After'];
  models: PAPSearchModel[] = [];
  displayModels: PAPSearchModel[] = [];
  asset: AssetDeviceDO = new AssetDeviceDO();
  addAsset: AssetDeviceDO = new AssetDeviceDO();
  definedAsset: AssetDeviceDO = new AssetDeviceDO();
  confirmAsset: AssetDeviceDO = new AssetDeviceDO();
  userPkId: string;
  assetDisplayModels: PAPSearchModel[];
  assetVal: boolean;
  lastLoanedPatient: AssetLastLoanedPatient = new AssetLastLoanedPatient();
  fetchCount: number;
  equipmentResourcesMode = false;
  masterCategory: number;
  calibrationInterval: number
  nextCalibrationDate = new Date();
  valCal = false;
  urlAssetId: number;

  constructor(protected papService: PapSystemService,
    private stompService: StompService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private assetDeviceClient: AssetDeviceClient,
    private store: Store<AppState>) {
    this.asset = new AssetDeviceDO();
    this.asset.manufacturer = new InventoryCompanyDO();
    this.equipmentStatuses = new EquipmentStatusDictionary();
    this.equipmentPurpose = new EquipmentPurposeDictionary();
    this.dependency = papService.dependencyOptions;
    this.papTypes = [];
    this.papPumpTypes = [];

    this.searchCriteria = new PAPManagementSearchDO({
      searchBefore: true,
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

    const url = this.router.url.substring(27, 45);
    if (url === 'equipment-resource') {
      this.titleService.setTitle('Equipment Resource Management');
    } else {
      this.titleService.setTitle('Equipment Management');
    }

    this.route.params.subscribe((params) => {
      // unary operator + parse string from url param to number
      this.masterCategory = +params['master-category-id'];
      this.urlAssetId = +params['asset-id'];
    });

    this.store.pipe(take(1), select(selectUserPkId)).subscribe((uPkId: string) => {
      this.userPkId = uPkId;
    });

    this.lastLoanedPatient = new AssetLastLoanedPatient();
    this.asset.suppliers = [
      new InventoryCompanyDO({ company_ID: 0, companyName: null }),
    ];
    this.fetchCount = 6;
    this.companyDetails[0] = new InventoryCompanyDetailsDO();
    this.companyDetails[1] = new InventoryCompanyDetailsDO();
  }

  ngOnInit() {
    this.status.push({ displayStatus: '', value: null });
    this.status = this.moveLastArrayElementToFirstIndex(this.status);
    this.getAssets();
    this.searchCriteria.status = PAPEquipmentStatus.CurrentAssets;
    this.search();
    this.populateLists();
    this.getManufacturers();
    this.getModels();
    this.getAllAssets();
  }

  moveLastArrayElementToFirstIndex(thisArray: EquipmentStatus[]) {
    const newArray = [];

    newArray[0] = thisArray[thisArray.length - 1];
    for (let i = 1; i < thisArray.length; i++) {
      newArray[i] = thisArray[i - 1];
    }

    return newArray;
  }

  getAllAssets() {
    if (this.masterCategory) {
      this.assetDeviceClient.getAllEquipment(this.masterCategory).subscribe(
        (response: APIResponseOfListOfAssetDeviceDO) => {
          if (response?.errorMessage?.trim().length > 0) {
            this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
          } else {
            this.assetsTemp = response.data;
            this.fetchCount++;

            if (this.fetchCount === 4) {
              this.displayAssetDetails();
            }
          }
        }, () => this.store.dispatch(new SetError({
          errorMessages: ['Unable to process query, please check your network connection.'],
        })));
    }
  }

  addNewAsset(asset: AssetDeviceDO) {
    if (this.status[PAPEquipmentStatus.Issued].value !== PAPEquipmentStatus.Issued) {
      this.status.splice(PAPEquipmentStatus.Issued, 0, { displayStatus: 'Issued', value: PAPEquipmentStatus.Issued });
    }

    if (this.status.length < (PAPEquipmentStatus.CurrentAssets + 1)
      || this.status[PAPEquipmentStatus.CurrentAssets].value !== PAPEquipmentStatus.CurrentAssets) {
      this.status.splice(PAPEquipmentStatus.CurrentAssets, 0,
        { displayStatus: 'Current Assets', value: PAPEquipmentStatus.CurrentAssets });
    }

    this.issuedFilter = true;
    let errorString = '';
    const splChars = '*|,\\":<>[]{}`\';()@&$#%';
    this.special = false;
    this.specialSerial = false;

    if (asset?.equipmentNumber?.trim().length >= 0) {
      if (asset.equipmentNumber.trim().length > 50) {
        errorString = 'Asset Number must be less than 50 characters. ';
      } else {
        for (let i = 0; i < asset.equipmentNumber.length; i++) {
          if (splChars.indexOf(asset.equipmentNumber.charAt(i)) !== -1) {
            this.special = true;
          }
        }

        if (this.special === true) {
          errorString = 'Asset Number must be alphanumeric. ';
        }
      }
    } else {
      errorString = 'Asset Number is required. Please input a valid alphanumeric value';
    }

    if (asset.serialNumber && asset.serialNumber.trim().length >= 0) {
      if (asset.serialNumber.trim().length > 50) {
        errorString = 'Serial Number must be less than 50 characters. ';
      } else {
        for (let i = 0; i < asset.serialNumber.length; i++) {
          if (splChars.indexOf(asset.serialNumber.charAt(i)) !== -1) {
            this.specialSerial = true;
          }
        }

        if (this.specialSerial === true) {
          errorString = 'Serial Number must be alphanumeric. ';
        }
      }
    } else {
      errorString = 'Serial Number is required. Please input a valid alphanumeric value';
    }

    if (asset.serviceInterval) {
      if (asset.serviceInterval <= 0) {
        errorString = 'Service Interval must be 1 or more months. ';
      }
    } else {
      errorString = 'Service Interval is required. Please input a valid number ';
    }

    if (this.required) {
      if (this.calibrationInterval) {
        if (this.calibrationInterval <= 0) {
          errorString = 'Calibration Interval must be 1 or more months. ';
        }
      } else {
        errorString = 'Calibration Interval is required. Please input a valid number ';
      }
    }

    if (!asset.manufacturer) {
      errorString = 'Make is required. Please select one of the options from the Make dropdown';
    }

    if (!asset.model) {
      errorString = 'Model is required. Please select one of the options from the Model dropdown ';
    }

    if (!asset.commissionDate) {
      errorString = 'Commission Date is required. ';
    }

    if (!asset.equipmentType) {
      errorString = 'Equipment Type is required. Please select a Make and a Model to aquire this';
    }

    if (asset.status == null) {
      errorString = 'Status is required. Please select one of the options from the Status dropdown ';
    }

    if (errorString.trim().length > 0) {
      alert(errorString, 'Data Validation Error');
    } else {
      this.asset.calibrationInterval = this.calibrationInterval;

      if (this.calibrationInterval === null) {
        this.asset.calibrationInterval = null;
      }

      this.asset.nextCalibrationDate = this.nextCalibrationDate;
      this.asset.lastCalibrationDate = this.lastCalibrationDate;

      if (this.asset.lastServiceDate) { this.asset.lastServiceDate.setHours(14, 59, 59, 999); }
      if (this.asset.nextServiceDate) { this.asset.nextServiceDate.setHours(14, 59, 59, 999); }
      if (this.asset.commissionDate) { this.asset.commissionDate.setHours(14, 59, 59, 999); }
      if (this.asset.nextCalibrationDate) { this.asset.nextCalibrationDate.setHours(14, 59, 59, 999); }
      if (this.asset.lastCalibrationDate) { this.asset.lastCalibrationDate.setHours(14, 59, 59, 999); }

      this.assetDeviceClient.createEquipment(asset, this.userPkId).subscribe((response: APIResponseOfAssetDeviceDO) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
          if (this.searchCriteria && this.masterCategory) {
            this.searchEquipment();
          } else {
            this.getAssets();
          }
          this.addAssetBool = false;
          notify('Asset was added successfully', 'success', 3000);
        }
      }, () => this.store.dispatch(new SetError({
        errorMessages: ['Unable to process query, please check your network connection.'],
      })));
    }
  }

  searchEquipment() {
    this.assetDeviceClient.searchEquipment(this.searchCriteria, this.masterCategory).subscribe(
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

  onAddPopupHiding() {
    this.cancel();
  }

  cancel() {
    this.required = false;

    if (this.status[PAPEquipmentStatus.Issued].value !== PAPEquipmentStatus.Issued) {
      this.status.splice(PAPEquipmentStatus.Issued, 0, { displayStatus: 'Issued', value: PAPEquipmentStatus.Issued });
    }

    if (this.status.length < (PAPEquipmentStatus.CurrentAssets + 1)
      || this.status[PAPEquipmentStatus.CurrentAssets].value !== PAPEquipmentStatus.CurrentAssets) {
      this.status.splice(PAPEquipmentStatus.CurrentAssets, 0,
        { displayStatus: 'Current Assets', value: PAPEquipmentStatus.CurrentAssets });
    }

    this.issuedFilter = false;
    this.addAssetBool = false;
    this.asset = new AssetDeviceDO();
    this.asset.commissionDate = new Date();
    this.asset.status = this.status[PAPEquipmentStatus.InStock].value;
    this.asset.serviceInterval = 12;
    this.asset.nextServiceDate = addMonths(this.asset.commissionDate, this.asset.serviceInterval);
    this.asset.status = PAPEquipmentStatus.InStock;
    this.asset.suppliers = [
      new InventoryCompanyDO({ company_ID: 0, companyName: null }),
      new InventoryCompanyDO({ company_ID: 0, companyName: null }),
    ];
    this.fetchCount = 6;

    if (this.manufacturers && this.manufacturers.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      this.asset.manufacturer = this.manufacturers[0];
    }
  }

  calculateNextServiceDate() {
    if (this.asset.lastServiceDate) {
      this.asset.nextServiceDate = addMonths(this.asset.lastServiceDate, this.asset.serviceInterval);
    } else {
      this.asset.nextServiceDate = addMonths(this.asset.commissionDate, this.asset.serviceInterval);
    }

    if (!this.lastCalibrationDate) {
      this.nextCalibrationDate = addMonths(this.asset.commissionDate, this.calibrationInterval);
    }

    if (!this.required) {
      this.nextCalibrationDate = null;
    }
  }

  getManufacturers() {
    this.assetDeviceClient.getManufacturers().subscribe((response: APIResponseOfListOfInventoryCompanyDO) => {
      if (response?.errorMessage?.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.manufacturers = response.data;
        this.manufacturers.unshift(new InventoryCompanyDO({ company_ID: null, companyName: '' }));
        this.fetchCount++;

        if (this.fetchCount === 4) {
          this.displayAssetDetails();
        }
      }
    }, () => this.store.dispatch(new SetError({
      errorMessages: ['Unable to process query, please check your network connection.'],
    })));
  }

  getLastLoanedPatient(equipmentId: number) {
    this.lastLoanedPatient = new AssetLastLoanedPatient({
      fullName: '', patient_ID: null,
    });

    this.assetDeviceClient.getEquipmentLastLoanedPatient(equipmentId).subscribe(
      (response: APIResponseOfAssetLastLoanedPatient) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
          this.lastLoanedPatient = response.data;
        }
      }, () => this.store.dispatch(new SetError({
        errorMessages: ['Unable to process query, please check your network connection.'],
      })));
  }

  onMovedFromDisabled(e: any) {
    if (e && e.event) {
      this.movingFromDisabled = e.value;
      if (this.movingFromDisabled) {
        this.searchCriteria.inputDate = new Date();
        this.dateButton1.disabled = false;
        this.dateButton2.disabled = false;
        this.dateButton3.disabled = false;
        this.serviceDate.disabled = false;
      } else {
        this.searchCriteria.inputDate = null;
        this.dateButton1.disabled = true;
        this.dateButton2.disabled = true;
        this.dateButton3.disabled = true;
        this.serviceDate.disabled = true;
      }
    }
  }

  requiredCalibration(e: any) {
    if (e && e.event) {
      this.required = e.value;
      if (this.required) {
        this.valCal = true;
        this.calibration.disabled = false;
        this.lastCalibration.disabled = false;
        this.addLastCalibration.disabled = false;
        this.calibrationAdd.disabled = false;

        if (this.addAssetBool) {
          this.calibrationInterval = 12;
        } else if ((!this.asset.calibrationInterval) || (this.asset.calibrationInterval < 0)) {
          this.calibrationInterval = 12;
        } else {
          this.calibrationInterval = this.asset.calibrationInterval;
          this.lastCalibrationDate = this.asset.lastCalibrationDate;
        }

        if (this.lastCalibrationDate) {
          this.nextCalibrationDate = addMonths(this.lastCalibrationDate, this.calibrationInterval);
        } else {
          this.nextCalibrationDate = addMonths(this.asset.commissionDate, this.calibrationInterval);
        }
      } else {
        this.nextCalibrationDate = null;
        this.lastCalibrationDate = null;

        if (this.lastCalibrationDate === null) {
          this.nextCalibrationDate = null;
        }

        this.calibration.disabled = true;
        this.lastCalibration.disabled = true;
        this.addLastCalibration.disabled = true;
        this.calibrationAdd.disabled = true;
        this.calibrationInterval = null;
      }
    }
  }

  populateLists() {
    if (this.masterCategory) {
      this.assetDeviceClient.getEquipmentTypes(this.masterCategory).subscribe(
        (response: APIResponseOfListOfInventoryCategoryDO) => {
          if (response?.errorMessage?.trim().length > 0) {
            this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
          } else {
            this.papTypes = response.data;
            this.papTypes.unshift(new InventoryCategoryDO(
              { categoryId: null, categoryName: '', parentCategory: null }));
            this.fetchCount++;

            if (this.fetchCount === 4) {
              this.displayAssetDetails();
            }
          }
        }, () => this.store.dispatch(new SetError({
          errorMessages: ['Unable to process query, please check your network connection.'],
        })));
    }
  }

  displayAssetDetails() {
    this.suppliersCompanyIds = [];

    if (this.searchCriteria.manufacturer) {
      this.searchCriteria.manufacturer = this.manufacturers.find(
        (m) => m.company_ID === this.searchCriteria.manufacturer.company_ID);
    }
    if (this.searchCriteria.equipmentType) {
      this.searchCriteria.equipmentType = this.papTypes.find(
        (m) => m.categoryName === this.searchCriteria.equipmentType.categoryName);
    }

    this.suppliersCompanyIds.push(this.asset.suppliers[0].company_ID);
    this.suppliersCompanyIds.push(this.asset.suppliers[1].company_ID);
    this.getCompanyDetails(this.suppliersCompanyIds);
  }

  updateEquipmentType(e: any) {
    this.searchCriteria.equipmentType = e ? e.value : '';
    this.revaluateModels();
  }

  updateManufacturer(e: any) {
    this.searchCriteria.manufacturer = e ? e.value : '';
    this.revaluateModels();
  }

  getAsset(asset: number) {
    if (this.masterCategory) {
      this.assetDeviceClient.getEquipment(asset, this.masterCategory).subscribe(
        (response: APIResponseOfAssetDeviceDO) => {
          if (response?.errorMessage?.trim().length > 0) {
            this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
          } else {
            this.asset = response.data;
          }
        }, () => this.store.dispatch(new SetError({
          errorMessages: ['Unable to process query, please check your network connection.'],
        })));
    }
  }

  manageProducts() {
    this.stompService.goToProductManagementScreen(EquipmentManagementScreen.ProductManagement);
  }

  transactionHistory(assetID:number) {
    this.stompService.goToAngularScreen('TransactionHistoryUri', [assetID.toString(), this.masterCategory.toString()]);
  }

  cancelEdit() {
    if (this.status[PAPEquipmentStatus.Issued].value !== PAPEquipmentStatus.Issued) {
      this.status.splice(PAPEquipmentStatus.Issued, 0, { displayStatus: 'Issued', value: PAPEquipmentStatus.Issued });
    }

    if (this.status.length < (PAPEquipmentStatus.CurrentAssets + 1)
    || this.status[5].value !== PAPEquipmentStatus.CurrentAssets) {
      this.status.splice(PAPEquipmentStatus.CurrentAssets, 0,
        { displayStatus: 'Current Assets', value: PAPEquipmentStatus.CurrentAssets });
    }

    this.issuedFilter = false;
    this.suppliersCompanyIds = [];
    this.asset = new AssetDeviceDO();
    this.editAssetBool = false;
    this.asset.commissionDate = new Date();
    this.asset.status = this.status[PAPEquipmentStatus.InStock].value;
    this.asset.serviceInterval = 12;
    this.asset.nextServiceDate = addMonths(this.asset.commissionDate, this.asset.serviceInterval);
    this.asset.status = PAPEquipmentStatus.InStock;
    this.asset.suppliers = [
      new InventoryCompanyDO({ company_ID: 0, companyName: null }),
      new InventoryCompanyDO({ company_ID: 0, companyName: null }),
    ];
    this.fetchCount = 6;

    if (this.manufacturers && this.manufacturers.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      this.asset.manufacturer = this.manufacturers[0];
    }
  }

  addAssetClicked() {
    this.required = false;
    this.addLastCalibration.disabled = true;

    if (this.status[PAPEquipmentStatus.Issued].value === PAPEquipmentStatus.Issued) {
      this.status.splice(PAPEquipmentStatus.Issued, 1);
    }

    const currentAIndex = this.status.findIndex((x) => x.value === PAPEquipmentStatus.CurrentAssets);

    if (currentAIndex !== -1) {
      this.status.splice(currentAIndex, 1);
    }

    if (this.searchCriteria.status) {
      if (this.searchCriteria.status === PAPEquipmentStatus.Issued) {
        this.issuedFilter = true;
      }
    }

    this.calibrationAdd.disabled = true;
    this.nextCalibrationDate = null;
    this.lastCalibrationDate = null;
    this.calibrationInterval = null;
    this.asset.commissionDate = new Date();
    this.asset.status = this.status[PAPEquipmentStatus.InStock].value;
    this.asset.serviceInterval = 12;
    this.asset.nextServiceDate = addMonths(this.asset.commissionDate, this.asset.serviceInterval);
    this.asset.status = PAPEquipmentStatus.InStock;
    this.asset.suppliers = [
      new InventoryCompanyDO({ company_ID: 0, companyName: null }),
      new InventoryCompanyDO({ company_ID: 0, companyName: null }),
    ];
    this.fetchCount = 6;

    if (this.manufacturers && this.manufacturers.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      this.asset.manufacturer = this.manufacturers[0];
    }

    this.addAssetBool = true;
  }

  updateAsset(asset: AssetDeviceDO) {
    if (this.status[PAPEquipmentStatus.Issued].value !== PAPEquipmentStatus.Issued) {
      this.status.splice(PAPEquipmentStatus.Issued, 0, { displayStatus: 'Issued', value: PAPEquipmentStatus.Issued });
    }

    if (this.status.length < (PAPEquipmentStatus.CurrentAssets + 1)
    || this.status[PAPEquipmentStatus.CurrentAssets].value !== PAPEquipmentStatus.CurrentAssets) {
      this.status.splice(PAPEquipmentStatus.CurrentAssets, 0,
        { displayStatus: 'Current Assets', value: PAPEquipmentStatus.CurrentAssets });
    }

    this.issuedFilter = false;
    let errorString = '';
    const splChars = '*|,\\":<>[]{}`\';()@&$#%';
    this.specialSerial = false;
    this.special = false;

    if (asset?.equipmentNumber?.trim().length >= 0) {
      if (asset.equipmentNumber.trim().length > 50) {
        errorString += 'Asset Number must be less than 50 characters. ';
      } else {
        for (let i = 0; i < asset.equipmentNumber.length; i++) {
          if (splChars.indexOf(asset.equipmentNumber.charAt(i)) !== -1) {
            this.special = true;
          }
        }
        if (this.special === true) {
          errorString = 'Asset Number must be alphanumeric. ';
        }
      }
    } else {
      errorString = 'Asset Number is required. Please input a valid alphanumeric value';
    }

    if (asset.serialNumber && asset.serialNumber.trim().length >= 0) {
      if (asset.serialNumber.trim().length > 50) {
        errorString = 'Serial Number must be less than 50 characters. ';
      } else {
        for (let i = 0; i < asset.serialNumber.length; i++) {
          if (splChars.indexOf(asset.serialNumber.charAt(i)) !== -1) {
            this.specialSerial = true;
          }
        }
        if (this.specialSerial === true) {
          errorString = 'Serial Number must be alphanumeric. ';
        }
      }
    } else {
      errorString = 'Serial Number is required. Please input a valid alphanumeric value';
    }

    if (asset.serviceInterval) {
      if (asset.serviceInterval <= 0) {
        errorString = 'Service Interval must be 1 or more months. ';
      }
    } else {
      errorString = 'Service Interval is required. Please input a valid number ';
    }

    if (this.required) {
      if (this.calibrationInterval) {
        if (this.calibrationInterval <= 0) {
          errorString = 'Calibration Interval must be 1 or more months. ';
        }
      } else {
        errorString = 'Calibration Interval is required. Please input a valid number ';
      }
    }

    if ((this.asset.manufacturer) && (this.asset.model)) {
      this.assetVal = true;
    }

    if (!asset.manufacturer) {
      errorString = 'Make is required. Please select one of the options from the Make dropdown';
    }

    if (!asset.model) {
      errorString = 'Model is required. Please select one of the options from the Model dropdown ';
    }

    if (!asset.commissionDate) {
      errorString = 'Commission Date is required. ';
    }

    if (asset.status == null) {
      errorString = 'Status is required. Please select one of the options from the Status dropdown ';
    }

    if (!asset.equipmentType) {
      errorString = 'Equipment Type is required. Please select a Make and a Model to aquire this';
    }

    if (errorString.trim().length > 0) {
      // this.store.dispatch(new SetError(errorString));
      alert(errorString, 'Data Validation Error');
    } else {
      this.asset.calibrationInterval = this.calibrationInterval;
      this.asset.nextCalibrationDate = this.nextCalibrationDate;
      this.asset.lastCalibrationDate = this.lastCalibrationDate;
      if (asset.nextServiceDate) { asset.nextServiceDate.setHours(14, 59, 59, 999); }
      if (asset.lastServiceDate) { asset.lastServiceDate.setHours(14, 59, 59, 999); }
      if (asset.commissionDate) { asset.commissionDate.setHours(14, 59, 59, 999); }
      if (this.asset.nextCalibrationDate) { this.asset.nextCalibrationDate.setHours(14, 59, 59, 999); }
      if (this.asset.lastCalibrationDate) { this.asset.lastCalibrationDate.setHours(14, 59, 59, 999); }

      this.assetDeviceClient.saveEquipment(asset, this.userPkId).subscribe((response: APIResponseOfAssetDeviceDO) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
          this.asset.calibrationInterval = this.calibrationInterval;
          this.asset.nextCalibrationDate = this.nextCalibrationDate;
          this.asset.lastCalibrationDate = this.lastCalibrationDate;
          this.asset = new AssetDeviceDO();
          this.asset.commissionDate = new Date();
          this.asset.status = this.status[PAPEquipmentStatus.InStock].value;
          this.asset.serviceInterval = 12;
          this.asset.nextServiceDate = addMonths(this.asset.commissionDate, this.asset.serviceInterval);
          this.asset.status = PAPEquipmentStatus.InStock;
          this.asset.suppliers = [
            new InventoryCompanyDO({ company_ID: 0, companyName: null }),
            new InventoryCompanyDO({ company_ID: 0, companyName: null }),
          ];
          this.fetchCount = 6;

          if (this.manufacturers && this.manufacturers.length > 0) {
            // eslint-disable-next-line prefer-destructuring
            this.asset.manufacturer = this.manufacturers[0];
          }

          this.editAssetBool = false;

          if (response.errorMessage === '') {
            if (this.searchCriteria && this.masterCategory) {
              this.searchEquipment();
            } else {
              this.getAssets();
            }

            notify('Asset was updated successfully', 'success', 3000);
          } else {
            alert(response.errorMessage, 'Response Error');
          }
        }
      }, () => this.store.dispatch(new SetError({
        errorMessages: ['Unable to process query, please check your network connection.'],
      })));
    }
  }

  updateNextServiceDate() {
    this.asset.nextServiceDate = addMonths(this.asset.commissionDate, this.asset.serviceInterval);
    this.nextServiceDate = addMonths(this.asset.commissionDate, this.asset.serviceInterval);

    if (this.asset.lastServiceDate) {
      this.asset.nextServiceDate = addMonths(this.asset.lastServiceDate, this.asset.serviceInterval);
      this.nextServiceDate = addMonths(this.asset.lastServiceDate, this.asset.serviceInterval);
    }
  }

  resetAsset() {
    this.asset = _.cloneDeep(this.assets.find((a) => a.equipment_ID === this.asset.equipment_ID));
    this.nextServiceDate = this.asset.nextServiceDate;
  }

  edit(assetID: any) {
    this.required = false;

    if (this.status[PAPEquipmentStatus.Issued].value === PAPEquipmentStatus.Issued) {
      this.status.splice(PAPEquipmentStatus.Issued, 1);
    }

    const currentAIndex = this.status.findIndex((x) => x.value === PAPEquipmentStatus.CurrentAssets);

    if (currentAIndex !== -1) {
      this.status.splice(currentAIndex, 1);
    }

    if (this.searchCriteria.status) {
      if (this.searchCriteria.status === PAPEquipmentStatus.Issued) {
        this.issuedFilter = true;
      }
    }

    this.getAssetId(assetID);
    this.suppliersCompanyIds = [];
    this.fetchCount = 0;
    this.editAssetBool = true;
    this.asset = _.cloneDeep(this.assets.find((a) => a.equipment_ID === assetID));
    this.calibrationInterval = this.asset.calibrationInterval;
    if (this.asset.lastCalibrationDate) {
      this.lastCalibrationDate = this.asset.lastCalibrationDate;
    } else {
      this.lastCalibrationDate = null;
    }

    if (this.asset.status === PAPEquipmentStatus.Issued) {
      this.statusCon.disabled = true;
      this.status.splice(PAPEquipmentStatus.Issued, 0, { displayStatus: 'Issued', value: PAPEquipmentStatus.Issued });
    } else {
      this.statusCon.disabled = false;
    }

    if ((!this.calibrationInterval) || (this.calibrationInterval < 0)) {
      this.calibration.disabled = true;
      this.lastCalibration.disabled = true;

      this.calibrationInterval = null;
      this.nextCalibrationDate = null;
    } else {
      this.calibrationInterval = this.asset.calibrationInterval;
      this.nextCalibrationDate = this.asset.nextCalibrationDate;
      this.calibration.disabled = false;
      this.lastCalibration.disabled = false;

      this.required = true;
    }

    this.issuedFlag = this.asset.status === PAPEquipmentStatus.Issued;
    this.getAllAssets();
    this.getManufacturers();
    this.getModels();
    this.populateLists();
    this.getLastLoanedPatient(assetID);
    this.displayModels = this.models;
  }

  onDateTo(days: number) {
    this.searchCriteria.inputDate = addDays(new Date(), days);
  }

  getAssets() {
    this.assetDeviceClient.getAllEquipment(this.masterCategory).subscribe(
      (response: APIResponseOfListOfAssetDeviceDO) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
          this.assets = response.data;
          if (this.urlAssetId && this.assets) {
            const exist = this.assets.find((a) => a.equipment_ID === this.urlAssetId);
            if (exist) {
              this.edit(this.urlAssetId);
            } else {
              alert('Asset does not exist', 'Validation');
            }
          }
        }
      }, () => this.store.dispatch(new SetError({
        errorMessages: ['Unable to process query, please check your network connection.'],
      })));
  }

  calculateNextCalibrationDate() {
    if (this.required === true) {
      if (this.lastCalibrationDate) {
        this.nextCalibrationDate = addMonths(this.lastCalibrationDate, this.calibrationInterval);
      } else {
        this.nextCalibrationDate = addMonths(this.asset.commissionDate, this.calibrationInterval);
      }
    }
  }

  deleteAsset(id: number, asset: any) {
    this.required = false;

    if (this.lastLoanedPatient.patient_ID > 0) {
      this.store.dispatch(new SetError({
        title: 'Deletion Error',
        errorMessages: [
          '<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>'
          + 'This equipment is currently on loan.<br> Please return it before deleting it </p></span>'],
      }));
    } else {
      const result = confirm(`<span style='text-align:center'><p>This will <b>Delete Asset</b> ${asset
      }. <br><br> Do you wish to continue?</p></span>`, 'Confirm changes');

      result.then((dialogResult: boolean) => {
        if (dialogResult) {
          this.assetDeviceClient.deleteEquipment(id, this.userPkId).subscribe(
            (response: APIResponseOfAssetDeviceDO) => {
              if (response?.errorMessage?.trim().length > 0) {
                this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
              } else {
                // eslint-disable-next-line no-lonely-if
                if (this.searchCriteria && this.masterCategory) {
                  this.searchEquipment();
                } else {
                  this.getAssets();
                }

                this.cancelEdit();
                notify('Asset was deleted successfully', 'success', 3000);
              }
            }, () => this.store.dispatch(new SetError({
              errorMessages: ['Unable to process query, please check your network connection.'],
            })));
        }
      });
    }
  }

  reset() {
    this.searchCriteria.inputDate = null;
    this.dateButton1.disabled = true;
    this.dateButton2.disabled = true;
    this.dateButton3.disabled = true;
    this.serviceDate.disabled = true;
    this.movingFromDisabled = false;
    this.searchCriteria = new PAPManagementSearchDO({
      searchBefore: true,
      inputDate: null,
      equipmentType: null,
      manufacturer: null,
      model: null,
      status: null,
      mustBeAvailable: false,
    });
    this.searchCriteria.status = PAPEquipmentStatus.CurrentAssets;
    this.fetchCount = 6;
    this.search();
    this.getManufacturers();
    this.getModels();
    this.populateLists();
    this.displayModels = this.models;
  }

  doubleClickRow(e: any) {
    const { component } = e;
    const prevClickTime = component.lastClickTime;
    component.lastClickTime = new Date();

    if (prevClickTime && (component.lastClickTime - prevClickTime < 300)) {
      this.edit(e.data.equipment_ID);
    }
  }

  quickDate(day: number) {
    if (day === 1) {
      this.searchCriteria.inputDate = new Date();
    } else
    if (day === 7) {
      this.searchCriteria.inputDate = addDays(new Date(), day);
    } else
    if (day === 35) {
      this.searchCriteria.inputDate = addDays(new Date(), day);
    }
  }

  search() {
    const retired = [];

    if (this.searchCriteria.inputDate && this.masterCategory) {
      this.assetDeviceClient.searchEquipment(this.searchCriteria, this.masterCategory).subscribe(
        (response: APIResponseOfListOfAssetDeviceDO) => {
          if (response?.errorMessage?.trim().length > 0) {
            this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
          } else {
            this.assets = response.data;
            this.assets.forEach((d) => {
              if (d.status === PAPEquipmentStatus.Issued) {
                retired.push(d);
              }
            });
            retired.forEach((x) => {
              this.assets.splice(this.assets.indexOf(x), 1);
            });
          }
        }, () => this.store.dispatch(new SetError({
          errorMessages: ['Unable to process query, please check your network connection.'],
        })));
    } else {
      this.searchEquipment();
    }
  }

  // beforeAfterSwap() {
  //   this.searchCriteria.searchBefore = !this.searchCriteria.searchBefore;
  // }

  toggleTip() {
    this.message = !this.message;
  }

  rowColourControl(e: any) {
    if (e.rowIndex) {
      if (e.rowIndex % 2 === 1) {
        e.rowElement.style.backgroundColor = '#f5f5f5';
      }
    }

    // If the asset needs a service and is not retired or already in maintenance
    if (e.data) {
      if (this.status) {
        if (e.data.nextServiceDate < new Date() && (

          e.data.status === this.status.find((s) => s.displayStatus === 'In Stock')?.value
          || e.data.status === this.status.find((s) => s.displayStatus === 'Issued')?.value)) {
          if (e.cells[8].cellElement) {
            e.cells[8].cellElement.bgColor = '#c92626';
            e.cells[8].cellElement.style.color = '#ffffff';
          }
        }
      }
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
            productId: null,
            model: null,
            manufacturer: null,
            equipmentType: null,
          }));
          this.displayModels = this.models;
          this.fetchCount++;

          if (this.fetchCount === 4) {
            this.displayAssetDetails();
          }
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
        (y) => y.categoryId === this.searchCriteria.equipmentType.categoryId) !== undefined)
          || f.model === null)
      ));
    }

    if (this.searchCriteria.manufacturer != null) {
      this.displayModels = this.displayModels.filter((f) => ((f?.models?.find(
        (x) => x?.manufacturer?.company_ID === this.searchCriteria.manufacturer?.company_ID || f.model === null)
      )));
    }
  }

  formatLocation(e:any, assetID: number) {
    if (this.assets) {
      const asset = this.assets.find((a) => a.equipment_ID === assetID);
      if (e && e.selectedItem && asset) {
        if (e.selectedItem.value === asset.purpose) {
          this.asset.location = asset.location;
        }
      }
    }
  }

  selectModel(e: any) {
    if (e.selectedItem?.models.length > 0) {
      this.asset.equipmentType = e.selectedItem.models[0].equipmentType;
      this.asset.product_ID = e.selectedItem.models[0].productId;
      this.asset.suppliers = this.assets.find((a) => a.product_ID === e.selectedItem.models[0].productId)?.suppliers;

      if (!this.asset.suppliers) {
        this.asset.suppliers = [
          new InventoryCompanyDO({ company_ID: 0, companyName: null }),
          new InventoryCompanyDO({ company_ID: 0, companyName: null }),
        ];
      }
    } else {
      this.asset.model = null;
      this.asset.equipmentType = null;
    }
  }

  assetRevaluateModels() {
    this.assetDisplayModels = this.models;
    if (this.asset.manufacturer != null) {
      this.assetDisplayModels = this.assetDisplayModels.filter((f) => ((f?.models?.find(
        (x) => x?.manufacturer?.company_ID === this.asset.manufacturer?.company_ID || f.model === null)
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

  showSuppliers() {
    if (this.companyDetails[0].companyEmail == null) {
      this.companyDetails[0].companyEmail = '';
    }

    if (this.companyDetails[0].companyPhone == null) {
      this.companyDetails[0].companyPhone = '';
    }

    alert(`<span *ngIf='companyDetails[0]'> <h6>Primary Supplier</h6> <p style='line-height:90%'> Supplier Name: ${
      this.companyDetails[0].companyName
    }</span><span></span><span></span></p><p style='line-height:90%'>Phone Number: ${this.companyDetails[0].companyPhone
    }<span></span></p><p style='line-height:90%'>Email: ${this.companyDetails[0].companyEmail
    }<span></span></p><p style='line-height:90%'>Address: ${this.companyDetails[0].companyAddress
    }<span></span></p></span>`, 'Supplier');
  }

  getAssetId(id: number) {
    this.tempAssetId = id;
  }

  getCompanyDetails(ids: number[]) {
    this.assetDeviceClient.getDetailsForCompanies(ids).subscribe(
      (response: APIResponseOfListOfInventoryCompanyDetailsDO) => {
        if (response?.errorMessage?.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
        } else {
          this.companyDetails = response.data;
        }
      }, () => this.store.dispatch(new SetError({
        errorMessages: ['Unable to process query, please check your network connection.'],
      })));
  }
}
