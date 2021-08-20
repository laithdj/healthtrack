/* eslint-disable camelcase */
import {
  Component,
  OnInit,
  ViewChild,
  OnChanges,
  AfterViewInit,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import notify from 'devextreme/ui/notify';
import { confirm, alert } from 'devextreme/ui/dialog';
import {
  DxDataGridComponent,
  DxNumberBoxComponent,
  DxFormComponent,
  DxDropDownBoxComponent,
  DxSelectBoxComponent,
} from 'devextreme-angular';
import { selectUserPkId } from '../../../app-store/app-ui.selectors';
import { AppState } from '../../../app-store/reducers';
import {
  NZBillingFeeDO,
  BillWorksheetClient,
  BillItemHealthFundFee,
} from '../../../../../../../Generated/CoreAPIClient';
import { HealthfundService } from '../../healthfund.service';
import { SetError } from '../../../app-store/app-ui-state.actions';
import { selectServices } from '../store/healthfund.selectors';

@Component({
  selector: 'app-healthfund-fees-details',
  templateUrl: './healthfund-fees-details.component.html',
  styleUrls: ['./healthfund-fees-details.component.css'],
})
export class HealthfundFeesDetailsComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(DxDataGridComponent) datagrid: DxDataGridComponent;
  @ViewChild('in_value') in_value: DxNumberBoxComponent;
  @ViewChild('out_value') out_value: DxNumberBoxComponent;
  @ViewChild('in_value_edit') in_value_edit: DxNumberBoxComponent;
  @ViewChild('out_value_edit') out_value_edit: DxNumberBoxComponent;
  @ViewChild('templateForm') currentForm: DxFormComponent;
  @ViewChild('templateForm') currentForm2: DxFormComponent;
  @ViewChild('itemDropDown') itemDropDown: DxDropDownBoxComponent;
  @ViewChild('itemDropDownEdit') itemDropDownEdit: DxDropDownBoxComponent;
  @ViewChild('test') test: DxSelectBoxComponent;

  add_fee = false;
  resultsText = 'No service found that match this search';
  feeOptions = ['Fixed', 'Percent'];
  feeOption = this.feeOptions[0];
  feesList: NZBillingFeeDO[];
  fee: NZBillingFeeDO = new NZBillingFeeDO();
  existingItemNum = '';
  healthfund_name = '';
  add_disabled = false;
  fee_effective_date = '';
  services$ = this.store.pipe(select(selectServices));
  update_fee = false;
  in_patient_value: number;
  out_patient_value: number;
  inFeeOption = this.feeOptions[0];
  outFeeOption = this.feeOptions[0];
  fee_table_id = 0;
  userPkId: string;
  item_exists: boolean = null;
  value_empty = true;
  bool: boolean;
  itemNum_check: boolean;
  itemNum_error: boolean;
  itemNum_empty: boolean;
  fund_error: boolean;
  itemNum_check_edit: boolean;
  itemNum_error_edit: boolean;
  itemNum_empty_edit: boolean;
  fund_error_edit: any;
  searchFields = ['itemNumDisp'];
  itemDescGrid: BillItemHealthFundFee[] = [];
  constructor(private healthFundService: HealthfundService, private store: Store<AppState>,
    private billingClient: BillWorksheetClient) {
    this.store.pipe(take(1), select(selectUserPkId)).subscribe((uPkId: string) => {
      this.userPkId = uPkId;
      return uPkId;
    });
  }
  ngOnInit() {
  }
  ngAfterViewInit() {
    if (this.datagrid) {
      this.datagrid.noDataText = 'No Fees for this Health Insurer';
    }
  }
  ngOnChanges() {
  }
  closeDropDown() {
    if (this.itemDropDown) {
      this.itemDropDown.instance.close();
    }
    if (this.itemDropDownEdit) {
      this.itemDropDownEdit.instance.close();
    }
  }
  checkItemNumber() {
    let bool;
    if (this.fee.itemNum) {
      this.healthFundService.checkItemExists(this.fee.itemNum).subscribe(
        (response) => {
          bool = response.data;
          this.value_empty = false;
          if (this.fee.itemNum) {
            if (!bool) {
              this.item_exists = false;
            } else {
              this.item_exists = true;
            }
          } else {
            this.value_empty = true;
          }
        }, (error) => console.log(error));
    }
  }

  toggleItemNumCheck() {
    this.itemNum_check = !this.itemNum_check;
    this.itemNum_check_edit = !this.itemNum_check_edit;
  }

  toggleItemNumError() {
    this.itemNum_error = !this.itemNum_error;
    this.itemNum_error_edit = !this.itemNum_error_edit;
  }
  toggleItemNumEmpty() {
    this.itemNum_empty = !this.itemNum_empty;
    this.itemNum_empty_edit = !this.itemNum_empty_edit;
  }
  toggleFundError() {
    this.fund_error = !this.fund_error;
    this.fund_error_edit = !this.fund_error_edit;
  }
  getFees(tableId: number): NZBillingFeeDO[] {
    this.healthFundService.getFeesForTable(tableId).subscribe(
      (response) => {
        this.feesList = response.data;
        this.feesList.forEach((d) => {
          if (d.feePercentInPatient !== -1) {
            d.feePercentInPatient *= 100;
          }
          if (d.feePercentOutPatient !== -1) {
            d.feePercentOutPatient *= 100;
          }
        });
        this.fee_table_id = tableId;
      }, (error) => console.log(error));
    return this.feesList;
  }

  formatPatientFee(fee: number): string {
    if (fee === -1) {
      return null;
    }
    return `$${Number(fee).toFixed(2)}`;
  }

  getFee(tableId: number, itemNum: string) {
    let null_flag_in = 0;
    let null_flag_out = 0;
    this.healthFundService.getFee(tableId, itemNum).subscribe(
      (response) => {
        this.fee = response.data;
        console.log(this.fee);
        if ((this.fee.feeInPatient === -1) && (this.fee.feePercentInPatient === -1)) {
          this.in_patient_value = null;
          this.inFeeOption = this.feeOptions[0];
          null_flag_in = 1;
        }
        if ((this.fee.feeOutPatient === -1) && (this.fee.feePercentOutPatient === -1)) {
          this.out_patient_value = null;
          this.inFeeOption = this.feeOptions[0];
          null_flag_out = 1;
        }
        if (null_flag_in === 0) {
          if (this.fee.feeInPatient === -1) {
            this.in_patient_value = this.fee.feePercentInPatient * 100;
            this.inFeeOption = this.feeOptions[1];
          } else {
            this.in_patient_value = this.fee.feeInPatient;
            this.inFeeOption = this.feeOptions[0];
          }
        }
        if (null_flag_out === 0) {
          if (this.fee.feeOutPatient === -1) {
            this.out_patient_value = this.fee.feePercentOutPatient * 100;
            this.outFeeOption = this.feeOptions[1];
          } else {
            this.out_patient_value = this.fee.feeOutPatient;
            this.outFeeOption = this.feeOptions[0];
          }
        }
      }, (error) => console.log(error));
  }

  updateFee(fee: NZBillingFeeDO) {
    this.currentForm2.instance.repaint();
    let errorString = '';
    if (!fee.itemNum) {
      errorString = 'Item No. can not be empty';
    }

    if (errorString !== '') {
      alert(errorString, 'Data Validation Error');
    } else {
      if (this.inFeeOption === this.feeOptions[0]) {
        fee.feeInPatient = this.in_patient_value;
        fee.feePercentInPatient = -1;
      } else {
        fee.feeInPatient = -1;
        if (this.in_patient_value !== null) {
          fee.feePercentInPatient = this.in_patient_value / 100;
        } else {
          fee.feePercentInPatient = null;
        }
      }
      if (this.outFeeOption === this.feeOptions[0]) {
        fee.feeOutPatient = this.out_patient_value;
        fee.feePercentOutPatient = -1;
      } else {
        fee.feeOutPatient = -1;
        if (this.out_patient_value !== null) {
          fee.feePercentOutPatient = this.out_patient_value / 100;
        } else {
          fee.feePercentOutPatient = -1;
        }
      }
      this.healthFundService.updateFee(fee, this.existingItemNum, fee.feeTable_ID).subscribe(
        (response) => {
          if (response.errorMessage === '') {
            this.update_fee = false;
            this.getFees(this.fee_table_id);
          } else if (response.errorMessage === 'Unable to update fee.') {
            this.store.dispatch(new SetError({
              title: 'Validation Error',
              errorMessages: [
                '<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>'
                + '<b>Item No.</b> already exists.<br>Please input a different Item No.</p></span>'],
            }));
          }
        }, (error) => console.log(error));
    }
  }

  createFee(fee: NZBillingFeeDO) {
    let errorString = '';
    if (!fee.itemNum) {
      errorString = 'Item No. can not be empty';
    }
    this.feesList.forEach((d) => {
      if (d.itemNum === fee.itemNum) {
        errorString = '<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>'
          + '<b>Item No.</b> already exists.<br>Please input a different Item No.</p></span>';
      }
    });
    if (errorString !== '') {
      alert(errorString, 'Data Validation Error');
    } else {
      const duplicate = this.feesList.findIndex((x) => x.feeTable_ID === fee.feeTable_ID && x.itemNum === fee.itemNum);
      if (duplicate !== -1) {
        return;
      }
      if (this.inFeeOption === this.feeOptions[0]) {
        fee.feeInPatient = this.in_patient_value;
        fee.feePercentInPatient = -1;
      } else {
        fee.feeInPatient = -1;
        if (this.in_patient_value !== null) {
          fee.feePercentInPatient = this.in_patient_value / 100;
        } else {
          fee.feePercentInPatient = null;
        }
      }
      if (this.outFeeOption === this.feeOptions[0]) {
        fee.feeOutPatient = this.out_patient_value;
        fee.feePercentOutPatient = -1;
      } else {
        fee.feeOutPatient = -1;
        if (this.out_patient_value !== null) {
          fee.feePercentOutPatient = this.out_patient_value / 100;
        } else {
          fee.feePercentOutPatient = -1;
        }
      }
      fee.feeTable_ID = this.fee_table_id;
      this.healthFundService.createFee(fee).subscribe(
        (response) => {
          if (response.errorMessage === '') {
            this.add_fee = false;
            this.getFees(this.fee_table_id);
          } else if (response.errorMessage === 'Unable to create fee.') {
            this.store.dispatch(new SetError({
              title: 'Validation Error',
              errorMessages: [
                '<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>'
                + '<b>Item No.</b> already exists.<br>Please input a different Item No.</p></span>'],
            }));
          }
        }, (error) => console.log(error));
    }
  }

  deleteFee(fee: NZBillingFeeDO) {
    const result = confirm(`<span style='text-align:center'><p>This will <b>Delete</b>  the fee ${this.fee.itemNum
    }. <br><br> Do you wish to continue?</p></span>`, 'Confirm changes');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.healthFundService.deleteFee(fee).subscribe(
          (response) => {
            if (response.errorMessage === '') {
              this.update_fee = false;
              this.getFees(this.fee_table_id);
              notify('Fee was deleted successfully', 'success', 3000);
            }
          }, (error) => console.log(error));
      }
    });
  }

  doubleClickRow(e: any) {
    const { component } = e;
    const prevClickTime = component.lastClickTime;
    component.lastClickTime = new Date();

    if (prevClickTime && (component.lastClickTime - prevClickTime < 300)) {
      this.editFee(e.data.feeTable_ID, e.data.itemNum);
    }
  }

  addFee() {
    this.currentForm.instance.repaint();
    this.inFeeOption = this.feeOptions[0];
    this.outFeeOption = this.feeOptions[0];
    if (this.in_value) {
      this.in_value.format = '#,##0.00';
    }
    if (this.out_value) {
      this.out_value.format = '#,##0.00';
    }
    if (this.fee_table_id === 0) {
      return;
    }
    this.fee = new NZBillingFeeDO();
    this.in_patient_value = null;
    this.out_patient_value = null;
    this.add_fee = true;
  }

  InValueChange() {
    if (this.in_value) {
      if (this.inFeeOption === this.feeOptions[0]) {
        this.in_value.format = '#,##0.00';
      } else {
        this.in_value.format = '#,##0.###';
      }
    }
  }

  OutValueChange() {
    if (this.out_value) {
      if (this.outFeeOption === this.feeOptions[0]) {
        this.out_value.format = '#,##0.00';
      } else {
        this.out_value.format = '#,##0.###';
      }
    }
  }

  InValueChangeEdit() {
    if (this.in_value_edit) {
      if (this.inFeeOption === this.feeOptions[0]) {
        this.in_value_edit.format = '#,##0.00';
      } else {
        this.in_value_edit.format = '#,##0.###';
      }
    }
  }

  OutValueChangeEdit() {
    if (this.out_value_edit) {
      if (this.outFeeOption === this.feeOptions[0]) {
        this.out_value_edit.format = '#,##0.00';
      } else {
        this.out_value_edit.format = '#,##0.###';
      }
    }
  }

  cancelFee() {
    this.add_fee = false;
  }
  editFee(tableId: number, itemNum: string) {
    let bool;
    if (this.in_value) {
      if (this.inFeeOption === this.feeOptions[0]) {
        this.in_value.format = '#,##0.00';
      } else {
        this.in_value.format = '#,##0.###';
      }
    }
    if (this.out_value) {
      if (this.outFeeOption === this.feeOptions[0]) {
        this.out_value.format = '#,##0.00';
      } else {
        this.out_value.format = '#,##0.###';
      }
    }
    this.update_fee = true;
    this.existingItemNum = itemNum;
    this.getFee(tableId, itemNum);
    this.healthFundService.checkItemExists(itemNum).subscribe(
      (response) => {
        bool = response.data;
        this.value_empty = false;
        if (this.fee.itemNum) {
          if (!bool) {
            this.item_exists = false;
          } else {
            this.item_exists = true;
          }
        } else {
          this.value_empty = true;
        }
      }, (error) => console.log(error));
  }

  cancelEditfee() {
    this.update_fee = false;
  }

  getDisplayForInPercent(rowData) {
    const value: number = new Number(rowData.feePercentInPatient).valueOf();
    if (value === -1) {
      return null;
    }
    return value;
  }
  getDisplayForOutPercent(rowData) {
    const value: number = new Number(rowData.feePercentOutPatient).valueOf();
    if (value === -1) {
      return null;
    }
    return value;
  }
  getDisplayForInPatient(rowData) {
    const value: number = new Number(rowData.feeInPatient).valueOf();
    if (value === -1) {
      return null;
    }
    return value;
  }
  getDisplayForOutPatient(rowData) {
    const value: number = new Number(rowData.feeOutPatient).valueOf();
    if (value === -1) {
      return null;
    }
    return value;
  }
}
