import { Component, OnInit, ViewChild } from '@angular/core';
import notify from 'devextreme/ui/notify';
import { Router, ActivatedRoute } from '@angular/router';
import { confirm, alert } from 'devextreme/ui/dialog';
import { Title } from '@angular/platform-browser';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { DxiItemComponent } from 'devextreme-angular/ui/nested';
import * as moment from 'moment';
import {
  Patient,
  PatientClient,
  AddPatientApiRequestParams,
  EquipmentTransactionDO,
  AssetDeviceDO,
  InventoryCompanyDO,
  InventoryCategoryDO,
  PAPFundingSource,
  PAPPaymentStatus,
  AssetDeviceClient,
  APIResponseOfListOfInventoryCategoryDO,
  APIResponseOfListOfInventoryCompanyDO,
  APIResponseOfListOfPAPFundingSource,
  APIResponseOfListOfPAPPaymentStatus,
  APIResponseOfAssetDeviceDO,
  APIResponseOfEquipmentTransactionDO,
  APIResponseOfDeleteTransactionResponseDO,
} from '../../../../../../../Generated/CoreAPIClient';
import { EquipmentTrackingScreen } from '../../../../../../../Generated/HMS.Interfaces';
import { PapSystemService } from '../../pap-system.service';
import { PAPDropDownValue } from '../../../shared/models/Pap-System/PAPDropdownValue.model';
import { StompService } from '../../../shared/stomp/stomp.service';
import { AppState } from '../../../app-store/reducers';
import { selectUserPkId, selectUserDisplayName } from '../../../app-store/app-ui.selectors';
import { SetError } from '../../../app-store/app-ui-state.actions';

@Component({
  selector: 'app-transaction-viewer',
  templateUrl: './transaction-viewer.component.html',
  styleUrls: ['./transaction-viewer.component.css'],
})
export class TransactionViewerComponent implements OnInit {
  @ViewChild('issue_dates') issueDates: DxiItemComponent;
  @ViewChild('return_dates') returnDates: DxiItemComponent;

  transaction: EquipmentTransactionDO = new EquipmentTransactionDO();
  transactionID: number;
  patient: Patient;
  editAssignT: boolean;
  valTransaction = false;
  paymentStatuses: PAPPaymentStatus[] = [];
  fundingSources: PAPFundingSource[];
  dependency: PAPDropDownValue;
  dependencies: PAPDropDownValue[] = [];
  papTypes: InventoryCategoryDO[] = [];
  manufacturers: InventoryCompanyDO[];
  newTransaction = false;
  deletePopup = false;
  deleteConfirmed = false;
  userPkId: string;
  userDisplayName: string;
  equipment: AssetDeviceDO = new AssetDeviceDO();
  masterCategory: number;
  transactionHistory = false;
  equipmentId: number;

  constructor(private route: ActivatedRoute,
    private stompService: StompService,
    private router: Router,
    private patientClient: PatientClient,
    protected papService: PapSystemService,
    private titleService: Title,
    private store: Store<AppState>,
    private assetDeviceClient: AssetDeviceClient) {
    this.dependencies = this.papService.dependencyOptions;
    this.transaction.manufacturer = new InventoryCompanyDO();
    this.papTypes[0] = new InventoryCategoryDO();
    this.titleService.setTitle('Transaction Viewer');
    this.store.pipe(take(1), select(selectUserPkId)).subscribe((uPkId: string) => {
      this.userPkId = uPkId;
    });
    this.store.pipe(take(1), select(selectUserDisplayName)).subscribe((uDispName: string) => {
      this.userDisplayName = uDispName;
    });
    this.route.params.subscribe((params) => {
      // unary operator + parse string from url param to number
      const patientId = +params.patientId;
      const transactionId = +params.transactionId;
      const equipmentId = +params.equipmentId;
      this.masterCategory = +params['master-category-id'];

      if (patientId) {
        this.getPatient(patientId);
      }

      if (transactionId) {
        this.getTransaction(transactionId);
      }

      if (equipmentId && equipmentId !== -1 && this.masterCategory) {
        this.getEquipment(equipmentId);
      }

      this.equipmentId = equipmentId;
      if (!transactionId) {
        this.newTransaction = true;
        this.transaction.issuingDate = new Date();
        this.transaction.returnDate = null;
      }
    });

    if (this.papService.changeAsset === false) {
      this.papService.transactionSession = new EquipmentTransactionDO();
      // eslint-disable-next-line prefer-destructuring
      this.dependency = this.dependencies[0];
    } else {
      this.transaction = this.papService.transactionSession;
      this.dependency = this.dependencies[this.transaction.dependencyLevel];
    }
  }

  ngOnInit() {
    this.editAssignT = this.papService.editAssignT;
    this.transactionHistory = this.papService.transactionHistory;
    this.populateLists();

    if (this.transactionHistory === true) {
      this.issueDates.disabled = true;
      this.returnDates.disabled = true;
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
      }
    }, () => this.store.dispatch(new SetError({
      errorMessages: ['Unable to process query, please check your network connection.'],
    })));

    this.assetDeviceClient.getFundingSources().subscribe((response: APIResponseOfListOfPAPFundingSource) => {
      if (response?.errorMessage?.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.fundingSources = response.data;

        if ((this.editAssignT === false) && (this.papService?.changeAsset === false)) {
          this.transaction.fundingSource = this.fundingSources[0].sourceId;
        }
      }
    }, () => this.store.dispatch(new SetError({
      errorMessages: ['Unable to process query, please check your network connection.'],
    })));

    this.assetDeviceClient.getPaymentStatuses().subscribe((response: APIResponseOfListOfPAPPaymentStatus) => {
      if (response?.errorMessage?.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.paymentStatuses = response.data;
        if ((this.editAssignT === false) && (this.papService.changeAsset === false)) {
          this.transaction.paymentStatus = this.paymentStatuses[0].statusId;
        }
      }
    }, () => this.store.dispatch(new SetError({
      errorMessages: ['Unable to process query, please check your network connection.'],
    })));
  }

  getPatient(patientId: number) {
    this.patientClient.getPatient(patientId).subscribe((result: AddPatientApiRequestParams) => {
      this.patient = result as Patient;
      if (this.newTransaction) {
        this.transaction.patientID = result.patient_ID;
      }
    });
  }

  assign() {
    this.stompService.goToEquipmentTrackingScreen(EquipmentTrackingScreen.AssignEquipment,
      0, 0, this.patient.patient_ID);
  }

  delete() {
    this.stompService.goToEquipmentTrackingScreen(EquipmentTrackingScreen.AssignEquipment,
      0, 0, this.patient.patient_ID);
  }

  getTransaction(id: number) {
    this.assetDeviceClient.getTransaction(id).subscribe((response: APIResponseOfEquipmentTransactionDO) => {
      if (response?.errorMessage?.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
      } else {
        this.transaction = response.data;
        this.dependency = this.papService.dependencyOptions.find((d) => d.value === this.transaction.dependencyLevel);

        if (this.dependency === undefined) {
          // eslint-disable-next-line prefer-destructuring
          this.dependency = this.papService.dependencyOptions[0];
        }
      }
    }, () => this.store.dispatch(new SetError({
      errorMessages: ['Unable to process query, please check your network connection.'],
    })));
  }

  getEquipment(equipmentId: number) {
    if (this.masterCategory) {
      this.assetDeviceClient.getEquipment(equipmentId, this.masterCategory).subscribe(
        (response: APIResponseOfAssetDeviceDO) => {
          if (response?.errorMessage?.trim().length > 0) {
            this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
          } else {
            this.createNewTransaction(response.data);
            this.equipment = response.data;
          }
        }, () => this.store.dispatch(new SetError({
          errorMessages: ['Unable to process query, please check your network connection.'],
        })));
    }
  }

  cancel() {
    if (!this.editAssignT) {
      this.papService.changeAsset = false;
      this.router.navigate([`pap-system/assign-equipment/${this.patient.patient_ID}/${this.masterCategory}`]);
    } else {
      this.router.navigate([`pap-system/pap-tracking/${this.patient.patient_ID}/${this.masterCategory}`]);
    }

    if (this.editAssignT == null) {
      this.router.navigate([`pap-system/equipment-history/${this.equipmentId}/${this.masterCategory}`]);
    }
  }

  changeAssetSelection() {
    this.papService.changeAsset = true;
    this.transaction.dependencyLevel = this.dependency.value;
    this.papService.transactionSession = this.transaction;
    this.router.navigate([`pap-system/assign-equipment/${this.patient.patient_ID}/${this.masterCategory}`]);
  }

  createNewTransaction(asset: AssetDeviceDO) {
    this.transaction.equipmentID = asset.equipment_ID;
    this.transaction.serialNumber = asset.serialNumber;
    this.transaction.manufacturer = asset.manufacturer;
    this.transaction.equipmentType = asset.equipmentType;
    this.transaction.equipmentNumber = asset.equipmentNumber;
    this.transaction.model = asset.model;

    if (this.patient) {
      this.transaction.patientID = this.patient.patient_ID;
    }
  }

  updateTransaction(transaction: EquipmentTransactionDO) {
    this.valTransaction = false;

    if ((this.transaction.fundingSource) && (this.transaction.paymentStatus) && (this.transaction.issuingDate)) {
      this.valTransaction = true;
    }

    if (this.editAssignT === false) {
      this.papService.changeAsset = false;
      transaction.dependencyLevel = this.dependency.value;
      const today = new Date();
      today.setHours(14, 59, 59, 999);

      if (transaction.issuingDate) {
        transaction.issuingDate.setHours(14, 59, 59, 999);

        if (transaction.issuingDate > today) {
          alert('Date issued cannot be greater than the current date ', 'Data Validation Error');
          this.valTransaction = false;
        }
      }

      if (transaction.returnDate) {
        transaction.returnDate.setHours(14, 59, 59, 999);

        if (transaction.returnDate > today && this.valTransaction === true) {
          alert('Date returned cannot be greater than the current date ', 'Data Validation Error');
          this.valTransaction = false;
        } else if (transaction.returnDate < transaction.issuingDate && this.valTransaction === true) {
          alert('Date returned must be greater than Date issued ', 'Data Validation Error');
          this.valTransaction = false;
        }
      }

      if (this.valTransaction === true) {
        this.assetDeviceClient.createTransaction(transaction, this.userPkId).subscribe(
          (response: APIResponseOfEquipmentTransactionDO) => {
            if (response?.errorMessage?.trim().length > 0) {
              if (response.errorMessage === 'overlapping null return date') {
                this.store.dispatch(new SetError({
                  title: 'Validation Error',
                  errorMessages: [
                    '<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>'
                    + 'This transaction cannot have an empty return date.'
                    + ' <br> The asset involved has been loaned out in another <br> transaction after the '
                    + 'issuing date of this transaction. <br> If this transaction is ongoing please ensure the '
                    + '<br> issuing date is correct and any other transactions'
                    + '<br> involving this asset are up to date</p></span>'],
                }));
              } else if (response.errorMessage === 'Deleted equipment') {
                this.store.dispatch(new SetError({
                  title: 'Validation Error',
                  errorMessages: [
                    '<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>'
                    + 'This transaction cannot be edited.<br> The equipment has been deleted.</p></span>'],
                }));
              } else {
                this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
              }
            } else {
              this.router.navigate([`pap-system/pap-tracking/${this.patient.patient_ID}/${this.masterCategory}`]);
              notify('Transaction was created successfully', 'success', 3000);
            }
          }, () => this.store.dispatch(new SetError({
            errorMessages: ['Unable to process query, please check your network connection.'],
          })));
      }
    } else if (this.editAssignT === true) {
      const today = new Date();
      today.setHours(14, 59, 59, 999);

      if (transaction.issuingDate) {
        transaction.issuingDate.setHours(14, 59, 59, 999);

        if (transaction.issuingDate > today) {
          alert('Date issued cannot be greater than the current date ', 'Data Validation Error');
          this.valTransaction = false;
        }
      }

      if (transaction.returnDate) {
        transaction.returnDate.setHours(14, 59, 59, 999);

        if (transaction.returnDate > today && this.valTransaction === true) {
          alert('Date returned cannot be greater than the current date ', 'Data Validation Error');
          this.valTransaction = false;
        } else if (transaction.returnDate < transaction.issuingDate && this.valTransaction === true) {
          alert('Date returned must be greater than Date issued ', 'Data Validation Error');
          this.valTransaction = false;
        }
      }

      if (this.valTransaction === true) {
        this.assetDeviceClient.updateTransaction(transaction, this.userPkId).subscribe(
          (response: APIResponseOfEquipmentTransactionDO) => {
            if (response?.errorMessage?.trim().length > 0) {
              if (response.errorMessage === 'invalid null return date') {
                this.store.dispatch(new SetError({
                  title: 'Validation Error',
                  errorMessages: [
                    '<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>'
                    + 'You cannot remove the return date from this transaction <br> because the asset has '
                    + 'already been loaned out to another patient.</p></span>'],
                }));
              } else if (response.errorMessage === 'Deleted equipment') {
                this.store.dispatch(new SetError({
                  title: 'Validation Error',
                  errorMessages: [
                    '<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>'
                    + 'This transaction cannot be edited.<br> The equipment has been deleted.</p></span>'],
                }));
              } else {
                this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
              }
            } else {
              this.router.navigate([`pap-system/pap-tracking/${this.patient.patient_ID}/${this.masterCategory}`]);
              notify('Transaction was updated successfully', 'success', 3000);
            }
          }, () => this.store.dispatch(new SetError({
            errorMessages: ['Unable to process query, please check your network connection.'],
          })));
      }
    } else if (this.editAssignT === null) {
      const today = new Date();
      today.setHours(14, 59, 59, 999);

      if (transaction.issuingDate) {
        transaction.issuingDate.setHours(14, 59, 59, 999);

        if (transaction.issuingDate > today) {
          alert('Date issued cannot be greater than the current date ', 'Data Validation Error');
          this.valTransaction = false;
        }
      }

      if (transaction.returnDate) {
        transaction.returnDate.setHours(14, 59, 59, 999);

        if (transaction.returnDate > today && this.valTransaction === true) {
          alert('Date returned cannot be greater than the current date ', 'Data Validation Error');
          this.valTransaction = false;
        } else if (transaction.returnDate < transaction.issuingDate && this.valTransaction === true) {
          alert('Date returned must be greater than Date issued ', 'Data Validation Error');
          this.valTransaction = false;
        }
      }

      if (this.valTransaction === true) {
        this.assetDeviceClient.updateTransaction(transaction, this.userPkId).subscribe(
          (response: APIResponseOfEquipmentTransactionDO) => {
            if (response?.errorMessage?.trim().length > 0) {
              if (response.errorMessage === 'invalid null return date') {
                this.store.dispatch(new SetError({
                  title: 'Validation Error',
                  errorMessages: [
                    '<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>'
                    + 'You cannot remove the return date from this transaction <br> because the asset has '
                    + 'already been loaned out to another patient.</p></span>'],
                }));
              } else if (response.errorMessage === 'Deleted equipment') {
                this.store.dispatch(new SetError({
                  title: 'Validation Error',
                  errorMessages: [
                    '<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>'
                    + 'This transaction cannot be edited.<br> The equipment has been deleted.</p></span>'],
                }));
              } else {
                this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
              }
            } else {
              this.router.navigate([`pap-system/equipment-history/${this.equipmentId}/${this.masterCategory}`]);
              notify('Transaction was updated successfully', 'success', 3000);
            }
          }, () => this.store.dispatch(new SetError({
            errorMessages: ['Unable to process query, please check your network connection.'],
          })));
      }
    }
  }

  save() {
    this.stompService.goToEquipmentTrackingScreen(EquipmentTrackingScreen.EquipmentSummary,
      0, 0, this.patient.patient_ID);
  }

  deleteAsset() {
    const result = confirm('<span style=\'text-align:center\'><p style=\'line-height: 80%;\'>This will '
      + '<b>Delete The Transaction</b> you are currently viewing.'
      + ' <br><br> Do you wish to continue?</p></span>', 'Confirm Deletion');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.assetDeviceClient.deleteTransaction(this.transaction?.transactionID, this.userPkId).subscribe(
          (response: APIResponseOfDeleteTransactionResponseDO) => {
            if (response?.errorMessage?.trim().length > 0) {
              this.store.dispatch(new SetError({ errorMessages: [response.errorMessage] }));
            } else {
              if (this.editAssignT == null) {
                this.router.navigate([`pap-system/equipment-history/${this.equipmentId}/${this.masterCategory}`]);
              } else {
                this.router.navigate([`pap-system/pap-tracking/${this.patient.patient_ID}/${this.masterCategory}`]);
              }
              if (response.data.equipmentReturned) {
                alert('<span style=\'text-align:center;\'><p style=\' line-height: 80%;\'>This asset has an '
                + '<b>Issued</b> status. <br><br>Deleting this transaction has changed the asset status back'
                + ' to <b>In Stock.</b></p></span>', 'Asset Status Has Changed');
              }
            }
          }, () => this.store.dispatch(new SetError({
            errorMessages: ['Unable to process query, please check your network connection.'],
          })));
      }
    });
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

  addLog() {
    const currentTime = new Date();

    if (this.transaction.notes !== undefined && this.transaction.notes !== null && this.transaction.notes !== '') {
      this.transaction.notes += '\n\n';
      this.transaction.notes += `${moment(currentTime.toLocaleString()).format('DD/MM/YYYY')
      } by ${this.userDisplayName}:\n`;
    } else {
      this.transaction.notes = `${moment(currentTime.toLocaleString()).format('DD/MM/YYYY')
      } by ${this.userDisplayName}:\n`;
    }
  }

  updateReturnDate(e: any) {
    if (e.value === null) { return; }
    if (!this.transaction.returnDate && this.editAssignT === true) {
      alert('<span style=\'text-align:center;\'><p style=\' line-height: 80%;\'>Please ensure you '
      + 'have updated your patient\'s therapy status where required.</p></span>', '');
    }

    this.transaction.returnDate = e.value;
  }
}
