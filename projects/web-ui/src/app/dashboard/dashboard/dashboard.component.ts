import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Store, select } from '@ngrx/store';
import { withLatestFrom, take } from 'rxjs/operators';
import { timer } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import {
  DashboardClient,
  DashboardDO,
  APIResponseOfDashboardDO,
  WidgetOptionDO,
  WidgetConfiguration,
} from '../../../../../../Generated/CoreAPIClient';
import { AppState } from '../../app-store/reducers';
import { selectUserName, selectDoctorId } from '../../app-store/app-ui.selectors';
import { LocationWidgetOptions } from '../../shared/models/Dashboard/LocationWidgetOptions';
import { DashboardWidget } from '../../../../../../Generated/HMS.Interfaces';
import { DashboardService } from './dashboard.service';
import { SetError } from '../../app-store/app-ui-state.actions';
import { LocationDictionaryEntry } from '../../../../src/app/shared/models/Dashboard/LocationDictionaryEntry';
import { StompService } from '../../../app/shared/stomp/stomp.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  dashboard: DashboardDO;
  userName$ = this.store.pipe(select(selectUserName));
  doctorId$ = this.store.pipe(select(selectDoctorId));
  locationIds: LocationDictionaryEntry[] = [];
  locationIdList: number[];
  dashboards: DashboardDO[];
  selectedDashboardId: number;

  constructor(private titleService: Title, private store: Store<AppState>, private dashboardClient: DashboardClient,
    private dashboardService: DashboardService, private router: Router, private stompService: StompService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.dashboard = new DashboardDO();

    this.route.params.pipe(withLatestFrom(this.userName$, this.doctorId$)).subscribe((results) => {
      const doctorId = (results[2]) ? results[2] : 0; // if no doctor id, set to 0
      this.selectedDashboardId = +results[0].id;
      if (!this.selectedDashboardId || this.selectedDashboardId === 0) {
        this.selectedDashboardId = 2; // default to dashboard 2 (reception) if no dashboardId
      }

      if (!this.dashboards) {
        this.getDashboards();
      } else {
        this.loadDashboard(results[1], doctorId);
      }
    });

    // after 5 minutes (300000 milliseconds) send widget subscription request for each widget.
    // send requests every 5 minutes.
    timer(300000, 300000).subscribe(() => {
      if (this.dashboard && this.dashboard.widgetConfigurations && this.dashboard.widgetConfigurations.length > 0) {
        this.dashboard.widgetConfigurations.forEach((widgetConfig) => {
          this.dashboardService.sendWidgetSubscriptionRequest(widgetConfig);
        });
      }
    });
  }

  loadDashboard(username: string, doctorId: number) {
    this.dashboardClient.getDashboard(this.selectedDashboardId, username, doctorId)
      .subscribe((result: APIResponseOfDashboardDO) => {
        if (result.errorMessage !== null && result.errorMessage.trim().length > 0) {
          console.log('error here');
          this.store.dispatch(new SetError({ errorMessages: [result.errorMessage] }));
        } else {
          this.dashboard = result.data;
          this.titleService.setTitle(this.dashboard.dashboardName);
          // if location diary widget is used, set location id from widget options
          if (this.dashboard.dashboardContents.some((d) => d.some((n) => n === DashboardWidget.LocationDiary))) {
            const locationWidgetOptionsJson = this.dashboard.widgetConfigurations.find(
              (w: WidgetOptionDO) => w.widget === DashboardWidget.LocationDiary).widgetParameters;
            const locationWidgetOptions: LocationWidgetOptions = new LocationWidgetOptions();
            locationWidgetOptions.locationIds = [];

            for (let index = 0; index < locationWidgetOptionsJson.length; index++) {
              const option = locationWidgetOptionsJson[index];
              locationWidgetOptions.locationIds.push(JSON.parse(option));
            }

            this.locationIdList = locationWidgetOptions.locationIds;
            this.createLocationDictionary();
          }
          this.fixDashboardConfiguration();
          this.dashboardService.requestDashboardSubscriptions(this.dashboard.dashboardContents,
            this.dashboard.widgetConfigurations);
        }
      });
  }

  getDashboards() {
    this.dashboardClient.getAllDashboards().subscribe((result) => {
      if (result.errorMessage || result.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [result.errorMessage] }));
      } else {
        this.dashboards = result.data;
        if (!this.selectedDashboardId) {
          this.selectedDashboardId = result.data[0].id;
        }
        const dashboardMatch = result.data.findIndex((x) => x.id === this.selectedDashboardId);

        if (dashboardMatch === -1) {
          this.selectedDashboardId = result.data[0].id;
        }

        this.userName$.pipe(take(1), withLatestFrom(this.doctorId$)).subscribe((observables) => {
          const doctorId = (observables[1]) ? observables[1] : 0;
          this.loadDashboard(observables[0], doctorId);
        });
      }
    });
  }

  goToDashboard() {
    this.dashboardClient.getUriForDashboard(this.selectedDashboardId).subscribe((result) => {
      if (result.errorMessage && result.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [result.errorMessage] }));
      } else {
        const uri = result.data;
        this.router.navigate([uri]);
      }
    });
  }

  createLocationDictionary() {
    let index = 0;
    this.locationIds = [];

    for (let i = 0; i < this.dashboard.dashboardContents.length; i++) {
      for (let j = 0; j < this.dashboard.dashboardContents[i].length; j++) {
        if (this.dashboard.dashboardContents[i][j] === DashboardWidget.LocationDiary) {
          if (this.locationIdList.length > index) {
            // Dashboards are rectangular so this is fine
            const widgetIndex = j + (i * this.dashboard.dashboardContents[i].length);
            this.locationIds.push(new LocationDictionaryEntry(widgetIndex, this.locationIdList[index]));
            index++;
          }
        }
      }
    }
  }

  getWidgetLocation(row: number, column): number {
    const widgetIndex = column + (row * this.dashboard.dashboardContents[row].length);
    const dictionaryIndex = this.locationIds.findIndex((x) => x.widgetIndex === widgetIndex);
    if (dictionaryIndex > -1) {
      return this.locationIds[dictionaryIndex].widgetLocationId;
    }
    return 0;
  }

  getWidgetLocationIndex(locationId: number): number {
    const index = this.dashboard.widgetConfigurations.filter(
      (x) => x.widget === DashboardWidget.LocationDiary)
      .findIndex((x) => x.widgetParameters[0] === locationId.toString());
    return index;
  }

  fixDashboardConfiguration() {
    this.dashboard.widgetConfigurations = this.dashboard.widgetConfigurations
      .filter((x) => x.widget !== DashboardWidget.LocationDiary);
    const orderedLocationIds = this.locationIds.sort(
      (l1, l2) => l1.widgetIndex - l2.widgetIndex).map((l) => l.widgetLocationId);

    for (let index = 0; index < orderedLocationIds.length; index++) {
      const location = orderedLocationIds[index];
      const widget = new WidgetConfiguration();
      widget.widget = DashboardWidget.LocationDiary;
      widget.widgetParameters = [location.toString()];
      widget.rabbitTopic = `${DashboardWidget.LocationDiary}.${location.toString()}`;
      this.dashboard.widgetConfigurations.push(widget);
    }
  }

  openDashboard(dashboardId: number) {
    this.stompService.goToDashboard(dashboardId);
  }
}
