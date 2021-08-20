import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NZBillingFeeTableDO } from '../../../../../../Generated/CoreAPIClient';
import { HealthfundService } from '../healthfund.service';
import { HealthfundFeesDetailsComponent } from './healthfund-fees-details/healthfund-fees-details.component';
import * as moment from 'moment';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../app/app-store/reducers';
import { take } from 'rxjs/operators';
import { selectUserPkId } from '../../app-store/app-ui.selectors';
import notify from 'devextreme/ui/notify';
import { confirm, alert } from 'devextreme/ui/dialog';
import { DxDataGridComponent, DxButtonComponent } from 'devextreme-angular';
import { disableDebugTools, Title } from '@angular/platform-browser';
import { HMSButtonDeleteComponent } from '../../shared/hms-button/hms-button-delete/hms-button-delete.component';
import { FetchServices } from './store/healthfund.actions';
import { selectServices } from './store/healthfund.selectors';

@Component({
  selector: 'app-healthfund-fees-table',
  templateUrl: './healthfund-fees-table.component.html',
  styleUrls: ['./healthfund-fees-table.component.css']
})

export class HealthfundFeesTableComponent implements OnInit , AfterViewInit {
  @ViewChild(HealthfundFeesDetailsComponent) healthfundfeesdetails: HealthfundFeesDetailsComponent;
  @ViewChild(DxDataGridComponent) datagrid: DxDataGridComponent;
  @ViewChild('edit_button') edit_button: DxButtonComponent;
  @ViewChild('delete_button') delete_button: HMSButtonDeleteComponent;
  healthinsurer_list: NZBillingFeeTableDO[] = new Array();
  healthinsurer_table: NZBillingFeeTableDO = new NZBillingFeeTableDO();
  healthfund_table: NZBillingFeeTableDO = new NZBillingFeeTableDO();
  edit_health_insurer = false;
  healthfund_id = 0;
  userPkId: string;
  add_health_insurer = false;
  btn_disabled = false;
  healthfund_name = '';
  selectedRowKeys = [];
  constructor(private healthFundService: HealthfundService, private titleService: Title, private store: Store<AppState>) {
    this.healthinsurer_list[0] = new NZBillingFeeTableDO();
    this.store.pipe(take(1), select(selectUserPkId)).subscribe((uPkId: string) => this.userPkId = uPkId);
  }

  ngOnInit() {
    this.titleService.setTitle('Healthfund Fee Tables Listing');
    this.getFeeTables();
    this.store.dispatch(new FetchServices());
  }
  ngAfterViewInit(){
    if(this.datagrid){
      this.datagrid.noDataText = 'No Fee Tables';
    }
  }
  getFeeTables() {
    this.healthFundService.getFeeTable().subscribe(
      response => {
        if (response.data) {
          this.healthinsurer_list = response.data.sort((dt1, dt2) => dt2.feeTableEffective.getTime() - dt1.feeTableEffective.getTime());
          if (this.healthinsurer_list.length < 1) {
            this.btn_disabled = true;
            this.healthfundfeesdetails.add_disabled = true;
          } else {
            this.btn_disabled = false;
            this.healthfundfeesdetails.add_disabled = false;
          }
        }
      }, error => console.log(error));
  }

  createFeeTable(table: NZBillingFeeTableDO) {
    let errorString = '';
    if (!table.feeTableName) {
      errorString = 'Fee table name can no be empty';
    }
    if (!table.feeTableEffective) {
      errorString = 'Fee effective date name can no be empty';
    }
    const tableExist = this.healthinsurer_list.find(a => a.feeTableName === table.feeTableName);
    if (tableExist) {
      const dateA = this.getOnlyDate(tableExist.feeTableEffective);
      const dateB = this.getOnlyDate(table.feeTableEffective);
      if (dateA.getTime() === dateB.getTime()) {
        errorString = 'Fee Table already exists';
        console.log('he');
      }
    }
    if (errorString !== '') {
      alert(errorString, 'Data Validation Error');
    } else {
      table.feeTableEffective.setHours(14, 59, 59, 999);
      this.healthFundService.createFeeTable(table, this.userPkId).subscribe(
        response => {
          if (response.errorMessage === '') {
            this.add_health_insurer = false;
            this.getFeeTables();
          }
        }, error => console.log(error));
    }
  }
  getOnlyDate(date: Date): Date {
    date.setHours(0, 0, 0, 0);
    return new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  updateFeeTable(table: NZBillingFeeTableDO) {
    console.log(table);
    let errorString = '';
    if (!table.feeTableName) {
      errorString = 'Fee table name can no be empty';
    }
    if (!table.feeTableEffective) {
      errorString = 'Fee effective date name can no be empty';
    }
    const tableExist = this.healthinsurer_list.find(a => a.feeTableName === table.feeTableName);
    if (tableExist) {
      if (tableExist.feeTable_ID !== table.feeTable_ID) {
        const dateA = this.getOnlyDate(tableExist.feeTableEffective);
        const dateB = this.getOnlyDate(table.feeTableEffective);
        if (dateA.getTime() === dateB.getTime()) {
          errorString = 'Fee Table already exists';
          console.log('he');
        }
      }
    }
    if (errorString !== '') {
      alert(errorString, 'Data Validation Error');
    } else {
      table.feeTableEffective.setHours(14, 59, 59, 999);
      this.healthFundService.updateFeeTable(table, this.userPkId).subscribe(
        response => {
          if (response.errorMessage === '') {
            this.edit_health_insurer = false;
            this.getFeeTables();
            this.healthfundfeesdetails.healthfund_name = table.feeTableName;
            this.healthfundfeesdetails.fee_effective_date = moment(table.feeTableEffective).format('DD/MM/YYYY');

          }

        }, error => console.log(error));
    }

  }


  deleteFeeTable() {
    const result = confirm('<span style=\'text-align:center\'><p>This will <b>Delete </b>the fee table for ' + this.healthfund_name +
      '. <br><br> Do you wish to continue?</p></span>', 'Confirm changes');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.healthFundService.testFeeforDeletion(this.healthfund_table).subscribe(
          response => {
            if (!response.data) {
              this.deleteTable();
            } else {
              const check = confirm('<span style=\'text-align:center\'><p>This fee table is being used by company ' + response.data[0] + ','
                + ' and others, these will also be deleted' +
                '. <br><br> Do you wish to proceed?</p></span>', 'Confirm changes');
              check.then((checkResult: boolean) => {
                if (checkResult) {
                  this.deleteTable();

                }
              });
            }
            console.log(response);
          }, error => console.log(error));
      }
    });
  }

  deleteTable() {
    this.healthFundService.deleteFeeTable(this.healthfund_id).subscribe(
      response => {
        if (response.errorMessage === '') {
          this.healthfundfeesdetails.healthfund_name = '';
          this.healthfundfeesdetails.fee_effective_date = null;
          this.getFeeTables();
          this.healthfundfeesdetails.getFees(this.healthfund_id);
          notify('Fee Table' + ' was ' + 'deleted' + ' successfully', 'success', 3000);
        }
      }, error => console.log(error));
  }

  getFeeTable(fee_table_id: number) {
    this.healthFundService.getSingleFeeTable(fee_table_id).subscribe(
      response => {
        if (response.errorMessage === '') {
          this.healthinsurer_table = response.data;
        }
      }, error => console.log(error));
  }

  addHealthInsurer() {
    this.healthinsurer_table = new NZBillingFeeTableDO();
    this.add_health_insurer = true;
  }
  editHealthInsurer() {
    this.edit_health_insurer = true;
    this.getFeeTable(this.healthfund_id);
  }
  cancelAddPopup() {
    this.add_health_insurer = false;
  }
  cancelEditPopup() {
    this.edit_health_insurer = false;

  }
  onRowPrepared(e: any) {
    if (e.data && (e.data.complete === true || e.data.deleted === true)) {
      e.rowElement.classList.add('list-item-deleted');
    }
  }
  gridContentReady() {
    if (this.healthinsurer_list[0]) {
      this.selectedRowKeys = [this.healthinsurer_list[0].feeTable_ID];
    }
  }

  onSelectionChanged(e: any) {
    console.log(e.selectedRowsData);
    // this.availablePrograms = this.getAvailablePrograms(fees_id);
    if (e.selectedRowsData[0]) {
      this.healthfund_table = e.selectedRowsData[0];
      this.healthfund_id = e.selectedRowsData[0].feeTable_ID;
      this.healthfund_name = e.selectedRowsData[0].feeTableName;
      this.healthfundfeesdetails.healthfund_name = e.selectedRowsData[0].feeTableName;
      this.healthfundfeesdetails.fee_effective_date = moment(e.selectedRowsData[0].feeTableEffective).format('DD/MM/YYYY');
      if (e.selectedRowsData[0].feeTable_ID) {
        this.healthfundfeesdetails.feesList = this.healthfundfeesdetails.getFees(e.selectedRowsData[0].feeTable_ID);
      }
    }

  }

}
