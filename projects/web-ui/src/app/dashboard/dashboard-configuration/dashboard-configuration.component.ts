import { Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { DashboardDO, DashboardClient, LocationClient, GetAllLocationParams, APIResponseOfListOfDashboardDO,
  LocationInfo, APIResponseOfDashboardDO, APIResponseOfBoolean, WidgetOptionDO,
  WidgetConfiguration } from '../../../../../../Generated/CoreAPIClient';
import { Observable, forkJoin } from 'rxjs';
import notify from 'devextreme/ui/notify';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../app-store/reducers';
import { take } from 'rxjs/operators';
import { confirm, alert } from 'devextreme/ui/dialog';
import { selectLastBillingLocation, selectUserPkId } from '../../app-store/app-ui.selectors';
import { SetError } from '../../app-store/app-ui-state.actions';
import { DashboardWidget } from '../../../../../../Generated/HMS.Interfaces';
import { WidgetListDisplay } from '../../shared/models/Dashboard/WidgetListDisplay';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { LocationWidgetOptions } from '../../../../src/app/shared/models/Dashboard/LocationWidgetOptions';
import { LocationDictionaryEntry } from '../../../../src/app/shared/models/Dashboard/LocationDictionaryEntry';

export enum rowColChange {
  none = 0,
  row = 1,
  column = 2,
}


@Component({
  selector: 'app-dashboard-configuration',
  templateUrl: './dashboard-configuration.component.html',
  styleUrls: ['./dashboard-configuration.component.css']
})
export class DashboardConfigurationComponent {
  @ViewChild('dashboardSelectBox') dashboardSelectBox: DxSelectBoxComponent;

  widgets: WidgetListDisplay[];
  widgetList = Object.keys(DashboardWidget).map(key => DashboardWidget[key]);
  confirmTableColumns: number;
  editMode = true;
  selectedWidget: DashboardWidget;
  selectedDashboard: DashboardDO;
  editDashboard: DashboardDO;
  editDashboardName: string;
  dashboards: DashboardDO[];
  dashboardChanged = false;
  showNewDashboardPopup = false;
  enableSaveButton = false;
  showRenamePopup = false;
  showDeletePopup = false;
  showDiscardChangesPopup = false;
  showDuplicatePopup = false;
  showRowColChangePopup = false;
  locations: LocationInfo[];
  lastBillingLocation: number;
  userPkId: string;
  widgetOption: LocationInfo;
  showRoleDefaultDashboard = false;
  rowColRemove: rowColChange = rowColChange.none;
  rowColRemoveNum = 0;
  locationIds: LocationDictionaryEntry[] = [];
  locationIdList: number[];

  constructor(private titleService: Title,
    private locationClient: LocationClient,
    private dashboardClient: DashboardClient,
    private store: Store<AppState>) {
    this.titleService.setTitle('Dashboard Management');
    this.store.pipe(take(1), select(selectLastBillingLocation)).subscribe((lbl: number) => this.lastBillingLocation = lbl);
    this.store.pipe(take(1), select(selectUserPkId)).subscribe((uPkId: string) => this.userPkId = uPkId);
    this.loadData();

  }



  loadData() {
    this.requestData().subscribe(result => {
      let error = '';
      if (result[0].errorMessage && result[0].errorMessage.trim().length > 0) { error = error + result[0].errorMessage + ' '; }
      if (result[1].errorMessage && result[1].errorMessage.trim().length > 0) { error = error + result[1].errorMessage; }
      if (error.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [error] }));
      } else {
        this.dashboards = result[0].data;
        if (this.dashboards && this.dashboards.length > 0) {
          this.selectedDashboard = this.dashboards[0];
          this.onDashboardSelected();
        }
        this.locations = result[1].data.results;
      }
    });
  }

  onSelectionChanged(e: any) {
    if (e.addedItems[0] !== undefined) {
      this.selectedWidget = e.addedItems[0].widgetName;
    }
    // this.editMode = true;
  }

  onKey(event: any) {
    // TODO: returns either "ArrowUp" or "ArrowDown" use this to update the selected widget out of the list of available ones
    const index: number = this.widgets.findIndex(w => w.widgetName === this.selectedWidget);
    if (event.key === 'ArrowDown') {
      if (index >= this.widgets.length - 1) {
        this.selectedWidget = <DashboardWidget>this.widgets[0].widgetName;
      } else {
        this.selectedWidget = <DashboardWidget>this.widgets[index + 1].widgetName;
      }
    } else if (event.key === 'ArrowUp') {
      if (index <= 0) {
        this.selectedWidget = <DashboardWidget>this.widgets[this.widgets.length - 1].widgetName;
      } else {
        this.selectedWidget = <DashboardWidget>this.widgets[index - 1].widgetName;
      }
    }

    // this.selectedWidget = <DashboardWidget> this.widgets.find(w => w === e.widget);
    // this.editMode = true;
    // this.dashboardChanged = true;
  }

  requestData(): Observable<any[]> {
    const dashboardResponse = this.dashboardClient.getAllDashboards();
    const locationResponse = this.locationClient.getAllLocations(new GetAllLocationParams());
    return forkJoin([dashboardResponse, locationResponse]);
  }

  onDashboardSelected() {
    this.editDashboard = _.cloneDeep(this.selectedDashboard);
    this.widgets = [];

    this.widgetList.forEach(widget => this.widgets.push(new WidgetListDisplay(widget)));
    this.dashboardChanged = false;

    this.editDashboard.dashboardContents.forEach((row: string[]) => {
      row.forEach(widget => {
        if (widget && widget !== DashboardWidget.LocationDiary && this.widgets.find(w => w.widgetName === widget)) {
          const widgetIndex = this.widgets.findIndex(w => w.widgetName === widget);
          this.widgets.splice(widgetIndex, 1);
        }
      });
    });
    if (this.editDashboard.dashboardContents.some(d => d.some(n => n === DashboardWidget.LocationDiary))) {
      const locationWidgetOptionsJson = this.editDashboard.widgetConfigurations.find(
        (w: WidgetOptionDO) => w.widget === DashboardWidget.LocationDiary).widgetParameters;
      const locationWidgetOptions: LocationWidgetOptions = new LocationWidgetOptions;
      locationWidgetOptions.locationIds = [];
      for (let option of locationWidgetOptionsJson) {
        locationWidgetOptions.locationIds.push(JSON.parse(option));
      }
      this.locationIdList = locationWidgetOptions.locationIds;
      this.createLocationDictionary();

      this.fixDashboardConfiguration();
      console.log(this.editDashboard.widgetConfigurations);
    }
    // console.log(this.widgets);
    this.showDiscardChangesPopup = false;
  }

  renameDashboardClicked() {
    this.editDashboardName = this.editDashboard.dashboardName;
    this.showRenamePopup = true;
    this.enableSaveButton = false;
  }

  addNewDashboard() {
    this.editDashboardName = 'New Dashboard';
    this.enableSaveButton = true;
    this.showNewDashboardPopup = true;
  }

  duplicateDashboard() {
    this.editDashboardName = this.editDashboard.dashboardName + ' - Copy';
    this.enableSaveButton = true;
    this.showDuplicatePopup = true;
  }

  reloadData(e: boolean) {
    this.showRoleDefaultDashboard = false;
    if (e === true) {
      notify('Default Dashboard Settings updated successfully', 'success', 3000);
      this.loadData();
    }
  }

  editNameValueChanged(e: any) {
    if (this.editDashboardName && this.editDashboardName.trim().length > 0) {
      if (this.editDashboardName === this.editDashboard.dashboardName) {
        this.enableSaveButton = false;
      } else {
        this.enableSaveButton = true;
      }
    } else {
      this.enableSaveButton = false;
    }
  }

  confirmRenameDashboard() {

    const dashboardIndex = this.dashboards.findIndex((d: DashboardDO) => d.id === this.selectedDashboard.id);
    const dbname = this.editDashboardName;

    this.dashboardClient.renameDashboard(this.selectedDashboard.id, this.editDashboardName, this.userPkId).subscribe(
      (result: APIResponseOfBoolean) => {
        if (result.data === true) {

          this.dashboards[dashboardIndex].dashboardName = dbname;
          this.selectedDashboard = this.dashboards[dashboardIndex];
          //  this.onDashboardSelected();
          //  this.dashboardChanged = false;
          //  this.enableSaveButton = false;
          this.showRenamePopup = false;
          notify('Dashboard successfully renamed', 'success', 3000);
          this.dashboardSelectBox.instance.repaint();
          this.editDashboard.dashboardName = this.editDashboardName;
        } else {
          this.store.dispatch(new SetError({ errorMessages: [result.errorMessage] }));
        }
      });
  }

  confirmAddNewDashboard() {
    const newDashboard = new DashboardDO();
    newDashboard.dashboardName = this.editDashboardName.trim();
    newDashboard.numRows = 4;
    newDashboard.numColumns = 2;
    newDashboard.id = 0;
    newDashboard.dashboardContents = [];
    newDashboard.widgetConfigurations = [];

    for (let i = 0; i < newDashboard.numRows; i++) {
      newDashboard.dashboardContents[i] = [];

      for (let j = 0; j < newDashboard.numColumns; j++) {
        newDashboard.dashboardContents[i][j] = '';
      }
    }

    this.dashboardClient.saveDashboard(newDashboard, this.userPkId).subscribe(
      (result: APIResponseOfDashboardDO) => {
        if (result.errorMessage !== null && result.errorMessage.length > 0) {
          alert(result.errorMessage, 'Save Error');
        } else {
          this.dashboards.push(result.data);
          const index = this.dashboards.findIndex((d: DashboardDO) => d.id === result.data.id);
          this.selectedDashboard = this.dashboards[index];
          this.onDashboardSelected();
          this.showNewDashboardPopup = false;
          notify('Dashboard created successfully', 'success', 3000);
        }
      });
  }

  confirmDuplicateDashboard() {
    const newDashboard = this.editDashboard;
    newDashboard.dashboardName = this.editDashboardName.trim();
    newDashboard.id = 0;
    newDashboard.systemDefault = false;

    this.dashboardClient.saveDashboard(newDashboard, this.userPkId).subscribe(
      (result: APIResponseOfDashboardDO) => {
        if (result.errorMessage !== null && result.errorMessage.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [result.errorMessage] }));
        } else {
          this.dashboards.push(result.data);
          const index = this.dashboards.findIndex((d: DashboardDO) => d.id === result.data.id);
          this.selectedDashboard = this.dashboards[index];
          this.onDashboardSelected();
          this.showDuplicatePopup = false;
          notify('Dashboard created successfully', 'success', 3000);
        }
      });
  }

  valueChanged(e: any) {
    if (this.editDashboardName && this.editDashboardName.trim().length > 0) {
      this.enableSaveButton = true;
    } else {
      this.enableSaveButton = false;
    }
  }

  calculateTableArray() {
    const newTableContents: string[][] = [];
    this.widgets = [];
    this.widgetList.forEach(widget => this.widgets.push(new WidgetListDisplay(widget)));
    if (this.editDashboard.numColumns !== this.selectedDashboard.numColumns
      || this.editDashboard.numRows !== this.selectedDashboard.numRows) {
      this.dashboardChanged = true;
    }

    for (let i = 0; i < this.editDashboard.numRows; i++) {
      newTableContents[i] = [];

      for (let j = 0; j < this.editDashboard.numColumns; j++) {
        if (this.editDashboard.dashboardContents[i] && this.editDashboard.dashboardContents[i][j]) {
          newTableContents[i][j] = this.editDashboard.dashboardContents[i][j];
          if (newTableContents[i][j] !== DashboardWidget.LocationDiary) {
            const widgetIndex = this.widgets.findIndex(w => w.widgetName === newTableContents[i][j]);
            this.widgets.splice(widgetIndex, 1);
          }

        } else {
          newTableContents[i][j] = '';
        }
      }
    }
    // console.log(this.widgets);
    this.editDashboard.dashboardContents = newTableContents;
    this.createLocationDictionary();
  }

  confirmRowColumnChange() {
    this.showRowColChangePopup = false;
    this.calculateTableArray();
    this.confirmTableColumns = this.editDashboard.numColumns;
  }

  applyRowColumnsClicked() {
    // Check if dashboard is being shrinked
    if (this.editDashboard.numRows < this.editDashboard.dashboardContents.length ||
      this.editDashboard.numColumns < this.editDashboard.dashboardContents[0].length) {
      // Check how much shrinkage is occuring

      const oldRowNum = this.editDashboard.dashboardContents.length;
      const oldColNum = this.editDashboard.dashboardContents[0].length;
      const newRowNum = this.editDashboard.numRows;
      const newColNum = this.editDashboard.numColumns;
      const colRemoved = oldColNum - newColNum;
      const rowRemoved = oldRowNum - newRowNum;

      // console.log('new num rows ' + newRowNum + ', new num columns ' + newColNum
      // + ', old num rows ' + oldRowNum + ', old num columns ' + oldColNum
      // + ', rows removed ' + rowRemoved + ', columns removed ' + colRemoved);

      // Check if we are correcting the number boxes after a cancel

      let widgetsRemoved = false;
      // Check bottom rows being removed
      if (rowRemoved > 0) {
        // Let the dashboard know that a row is being removed and how many
        this.rowColRemove = rowColChange.row;
        this.rowColRemoveNum = rowRemoved;
        for (let i = newRowNum; i < oldRowNum; i++) {
          for (let j = 0; j < oldColNum; j++) {
            // console.log('dashboard contents at row:' + i, ' col:' + j + ' is ' + this.editDashboard.dashboardContents[i][j]);
            // if a widget is in one of the element s being removed then bring up the popup
            if (this.editDashboard.dashboardContents[i][j] !== '') { widgetsRemoved = true; }
          }
        }
      }
      // Check right hand columns being removed
      if (colRemoved > 0) {
        // let the dashboard know that a column is being removed and how many
        this.rowColRemove = rowColChange.column;
        this.rowColRemoveNum = colRemoved;
        for (let i = newColNum; i < oldColNum; i++) {
          for (let j = 0; j < oldRowNum; j++) {
            // console.log('dashboard contents at row:' + j, ' col:' + i + ' is ' + this.editDashboard.dashboardContents[j][i]);
            // if a widget is in one of the element s being removed then bring up the popup
            if (this.editDashboard.dashboardContents[j][i] !== '') { widgetsRemoved = true; }
          }
        }
      }
      // bring up a popup if a widget will be deleted
      if (widgetsRemoved) {
         this.showRowColChangePopup = true;
         console.log(this.showRowColChangePopup);
        /*
        const res = confirm('<span style=\'text-align:center\'><p>' +
          ' This action will remove widget(s) you have placed. <br><br> Do you wish to continue?</p></span>', 'Confirm');
        res.then((dialogResult: boolean) => {
          if (dialogResult) {
            this.confirmRowColumnChange();
          } else {
            this.cancelRowColChange();
          }
        });*/
        // otherwise update the rows and columns
      } else { this.confirmRowColumnChange(); }
    } else {
      if (this.rowColRemove === rowColChange.row) {
        this.rowColRemove = rowColChange.none;
      } else if (this.rowColRemove === rowColChange.column) {
        this.rowColRemove = rowColChange.none;
      } else {
        this.confirmRowColumnChange();
      }
    }
  }

  rowNumChanged() {
    if (this.editDashboard.numRows < this.editDashboard.dashboardContents.length) {
      this.rowColRemove = rowColChange.row;
    }
    this.applyRowColumnsClicked();
  }

  colNumChanged() {
    if (this.editDashboard.numColumns < this.editDashboard.dashboardContents[0].length) {
      this.rowColRemove = rowColChange.column;
    }
    this.applyRowColumnsClicked();
  }

  cancelRowColChange() {
    this.showRowColChangePopup = false;
    if (this.rowColRemove === rowColChange.row) {
      this.editDashboard.numRows += this.rowColRemoveNum;
      this.rowColRemoveNum = 0;
    } else if (this.rowColRemove === rowColChange.column) {
      this.editDashboard.numColumns += this.rowColRemoveNum;
      this.rowColRemoveNum = 0;
    }
  }

  addWidgetClicked(widget: DashboardWidget) {
    this.selectedWidget = widget;
    this.editMode = true;
  }

  widgetAdded(e: any) {
    if (this.selectedWidget) {
      const rowNumber = e.row;
      const columnNumber = e.column;
      if (this.selectedWidget !== DashboardWidget.LocationDiary) {
        const widgetIndex = this.widgets.findIndex(w => w.widgetName === this.selectedWidget);
        this.widgets.splice(widgetIndex, 1);
      }
      this.editDashboard.dashboardContents[rowNumber][columnNumber] = this.selectedWidget;
      if (this.selectedWidget === DashboardWidget.LocationDiary) {
        const option: string = this.locations.find(x => x.locationId === this.lastBillingLocation).locationId.toString();

        const newWidgetOption: WidgetOptionDO = new WidgetOptionDO();
        newWidgetOption.widget = this.selectedWidget;
        newWidgetOption.widgetParameters = [];

        const widgetIndex = e.column + (e.row * this.editDashboard.dashboardContents[e.row].length);
        const dictionaryIndex = this.locationIds.findIndex(x => x.widgetIndex === widgetIndex);
        if (dictionaryIndex !== -1) {
          this.locationIds[widgetIndex].widgetLocationId = this.locations.find(x => x.locationId === this.lastBillingLocation).locationId;
        } else {
          this.locationIds.push(new LocationDictionaryEntry(widgetIndex,
            this.locations.find(x => x.locationId === this.lastBillingLocation).locationId));
        }
        this.locationIdList = this.locationIds.sort((l1, l2) => l1.widgetIndex - l2.widgetIndex).map(l => l.widgetLocationId);
        console.log(this.locationIds);
        newWidgetOption.widgetParameters.push(option);
        const index: number = this.editDashboard.widgetConfigurations.findIndex(x => x.widget === e.widget);
        if (index !== -1) {
          this.editDashboard.widgetConfigurations[index].widgetParameters =
            this.locationIds.sort((l1, l2) => l1.widgetIndex - l2.widgetIndex).map(l => l.widgetLocationId.toString());
        } else {
          this.editDashboard.widgetConfigurations.push(newWidgetOption);
        }
        this.fixDashboardConfiguration();
        this.createLocationDictionary();
      }

      this.dashboardChanged = true;
      if (this.selectedWidget !== DashboardWidget.LocationDiary) {
        if (this.widgets.length > 0) {
          this.selectedWidget = <DashboardWidget>this.widgets[0].widgetName;
          // console.log('number of widgets left in widgets list ' + this.widgets.length);
        } else { this.selectedWidget = undefined; }
      }
    }
  }

  widgetDeleted(e: any) {
    if (this.editDashboard.dashboardContents[e.row][e.column] === e.widget) {
      this.editDashboard.dashboardContents[e.row][e.column] = '';
      if (e.widget === DashboardWidget.LocationDiary) {
        const index: number = this.editDashboard.widgetConfigurations.findIndex(x => x.widget === e.widget);

        const widgetIndex = e.column + (e.row * this.editDashboard.dashboardContents[e.row].length);
        const dictionaryIndex = this.locationIds.findIndex(x => x.widgetIndex === widgetIndex);
        if (dictionaryIndex !== -1) {
          this.locationIds.splice(dictionaryIndex, 1);
          this.locationIdList = this.locationIds.sort((l1, l2) => l1.widgetIndex - l2.widgetIndex).map(l => l.widgetLocationId);
          this.editDashboard.widgetConfigurations[index].widgetParameters =
            this.locationIds.sort((l1, l2) => l1.widgetIndex - l2.widgetIndex).map(l => l.widgetLocationId.toString());
        } else {
          this.editDashboard.widgetConfigurations.splice(index, 1);
        }
        this.fixDashboardConfiguration();
      }
    }

    this.calculateTableArray();
    this.dashboardChanged = true;
  }

  widgetMoved(e: any) {
    this.widgetDeleted(e);
    this.selectedWidget = <DashboardWidget>this.widgets.find(w => w.widgetName === e.widget).widgetName;
    this.editMode = true;
    this.dashboardChanged = true;
  }

  undoDashboardChangedClicked() {
    this.onDashboardSelected();
  }

  editRoleDashboards() {
    this.showRoleDefaultDashboard = true;
  }

  confirmDeleteDashboard() {
    const res = confirm('<span style=\'text-align:center\'><p>' + this.editDashboard.dashboardName + ' will be deleted permanently' +
      '. <br><br> Do you wish to continue?</p></span>', 'Confirm changes');
    res.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.dashboardClient.deleteDashboard(this.selectedDashboard.id, this.userPkId).subscribe(
          (result: APIResponseOfBoolean) => {
            if (result.data) {
              this.dashboardClient.getAllDashboards().subscribe((dbresult: APIResponseOfListOfDashboardDO) => {
                this.dashboards = dbresult.data;
                if (this.dashboards && this.dashboards.length > 0) {
                  this.selectedDashboard = this.dashboards[0];
                  this.onDashboardSelected();
                  notify('Dashboard successfully deleted', 'success', 3000);
                  this.showDeletePopup = false;
                }
              });
            } else {
              this.store.dispatch(new SetError({ errorMessages: [result.errorMessage] }));
            }
          });
      }
    });
    if (this.editDashboard.numUsers && this.editDashboard.numUsers >= 1) {
      alert('<span style=\'text-align:center\'><p style=\'line-height: 110%; font-size:14px\'>' + this.editDashboard.numUsers +
        ' user is currently using this dashboard. They will revert to the default dashboard if you proceed. </p></span>', 'Warning');
    }
  }

  saveDashboardClicked() {
    console.log(this.editDashboard.widgetConfigurations);
    const dashboardIndex = this.dashboards.findIndex((d: DashboardDO) => d.id === this.selectedDashboard.id);

    this.dashboardClient.updateDashboard(this.editDashboard, this.userPkId).subscribe(
      (result: APIResponseOfDashboardDO) => {
        if (result.errorMessage !== null && result.errorMessage.length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [result.errorMessage] }));
        } else {
          this.dashboards[dashboardIndex] = result.data;
          this.selectedDashboard = this.dashboards[dashboardIndex];
          this.onDashboardSelected();
          notify('Dashboard saved successfully', 'success', 3000);
        }
      });
  }

  clickNewDashboard() {
    if (this.dashboardChanged) {
      // this.showDiscardChangesPopup = true;
      const res = confirm('<span style=\'text-align:center\'><p>' + ' You have unsaved changes' +
        '. Do you wish to discard these changes?</p></span>', 'Confirm');
      res.then((dialogResult: boolean) => {
        if (dialogResult) {
          this.onDashboardSelected();
        }
      });
    } else {
      this.onDashboardSelected();
    }
  }


  setWidgetOption(e: any) {
    this.widgetOption = e.addedItems[0].name;
  }

  createLocationIdList() {
    if (this.editDashboard.dashboardContents.some(d => d.some(n => n === DashboardWidget.LocationDiary))) {
      const locationWidgetOptionsJson = this.editDashboard.widgetConfigurations.find(
        (w: WidgetOptionDO) => w.widget === DashboardWidget.LocationDiary).widgetParameters;
      const locationWidgetOptions: LocationWidgetOptions = new LocationWidgetOptions;
      locationWidgetOptions.locationIds = [];
      for (let option of locationWidgetOptionsJson) {
        locationWidgetOptions.locationIds.push(JSON.parse(option));
      }
      this.locationIdList = locationWidgetOptions.locationIds;
    }
  }

  createLocationDictionary() {
    let index = 0;
    this.locationIds = [];
    for (let i = 0; i < this.editDashboard.dashboardContents.length; i++) {
      for (let j = 0; j < this.editDashboard.dashboardContents[i].length; j++) {
        if (this.editDashboard.dashboardContents[i][j] === DashboardWidget.LocationDiary) {
          if (this.locationIdList.length > index) {
            // Dashboards are rectangular so this is fine
            const widgetIndex = j + (i * this.editDashboard.dashboardContents[i].length);
            this.locationIds.push(new LocationDictionaryEntry(widgetIndex, this.locationIdList[index]));
            index++;
          }
        }
      }
    }
    console.log(this.locationIds);
  }

  getWidgetLocation(row: number, column): number {

    const widgetIndex = column + (row * this.editDashboard.dashboardContents[row].length);
    const dictionaryIndex = this.locationIds.findIndex(x => x.widgetIndex === widgetIndex);
    if (dictionaryIndex !== -1) {
      return this.locationIds[dictionaryIndex].widgetLocationId;
    } else {
      return 0;
    }
  }

  fixDashboardConfiguration() {

    this.editDashboard.widgetConfigurations = this.editDashboard.widgetConfigurations
      .filter(x => x.widget !== DashboardWidget.LocationDiary);
    const orderedLocationIds = this.locationIds.sort((l1, l2) => l1.widgetIndex - l2.widgetIndex).map(l => l.widgetLocationId);
    for (let location of orderedLocationIds) {
      const widget = new WidgetConfiguration();
      widget.widget = DashboardWidget.LocationDiary;
      widget.widgetParameters = [location.toString()];
      this.editDashboard.widgetConfigurations.push(widget);
    }
  }
}
