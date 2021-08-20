import { Component, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import {  RecordClassification } from '../../../../../../Generated/CoreAPIClient';
import { RecordManagementService } from '../service/recordManagement.service';
import { RecordClassificationState } from '../store/classification.reducers';
import { Title } from '@angular/platform-browser';
import { selectClassifications, selectUserGroups, selectBillingGroups } from '../store/classification.selectors';
import notify from 'devextreme/ui/notify';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit{
  classifications$: Observable<RecordClassification[]>;
  classifications:RecordClassification[] = new Array();
  userGroups$: Observable<string[]>;
  billingGroups$: Observable<string[]>;
  private _destroyed$ = new Subject<void>();
  editMode = false;
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  constructor(private service: RecordManagementService, private store: Store<RecordClassificationState>,
    private titleService: Title) {
    this.titleService.setTitle('Clinical Record Management');
    this.classifications$ = this.store.pipe(select(selectClassifications));
    this.userGroups$ = this.store.pipe(select(selectUserGroups));
    this.billingGroups$ = this.store.pipe(select(selectBillingGroups));
  }
  ngOnInit(){
    this.classifications$.pipe(takeUntil(this._destroyed$)).subscribe((g: RecordClassification[]) => this.classifications = g ? _.cloneDeep(g) : []);
  }
  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
  onEditClicked() {
    if (this.editMode) {
      this.service.refreshClassificationsStore();
    }
    this.editMode = !this.editMode;
  }

  getGridRowsData () {
    return this.dataGrid.instance.getDataSource().items() as RecordClassification[];
  }
  calculateClinicalRecordDisplay(data) {
    return data.subCategoryAdditionalDescription ? data.subCategoryDescription +
     ' (' + data.subCategoryAdditionalDescription + ')' : data.subCategoryDescription;
  }
  onSaveClicked() {
    if (this.dataGrid) {
      setTimeout(() => {
        const records = this.getGridRowsData();
        this.service.updateClassifications(records);
      }, 300);
    }
    notify('Record' + ' was ' + 'saved' + ' successfully', 'success', 3000);
    this.editMode = false;
  }
  onEditorPreparing(e: any) {  
    if (e.parentType == 'dataRow' && e.dataField == 'billingGroup') {  
        e.editorOptions.maxLength = 10;  
    }  
  }  
}
