import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';
import { LocationInfo, LocationClient, GetAllLocationParams,
  APIResponseOfGetAllLocationResult } from '../../../../../../../Generated/CoreAPIClient';
import { LocationDiaryData } from '../../../shared/models/Dashboard/LocationDiaryData';
import { DashboardService } from '../../dashboard/dashboard.service';
import { StompService } from '../../../shared/stomp/stomp.service';

@Component({
  selector: 'app-location-diary-widget',
  templateUrl: './location-diary-widget.component.html',
  styleUrls: ['./location-diary-widget.component.css']
})
export class LocationDiaryWidgetComponent implements OnChanges {
  private _locationId: number;

  locationInfo: LocationInfo;
  allLocations: LocationInfo[];
  displayName: string;

  testBookings = new LocationDiaryData([ 50, 4, 12 ]);
  locationDiaryData: LocationDiaryData;

  @Input() inactive: boolean;
  @Input() set location(locationId: number) {
    this._locationId = locationId;
    if (this.allLocations && this.allLocations.length > 0) {
      this.locationInfo = this.allLocations.find(l => l.locationId === locationId);
    }
  }
  get location(): number {
    return this._locationId;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('location' in changes) {
      // console.log('change to locationId: ' + changes.location.currentValue);
      this.locationClient.getAllLocations(new GetAllLocationParams())
        .subscribe((result: APIResponseOfGetAllLocationResult) => {
        this.allLocations = result.data.results;
        if (this._locationId && this._locationId > 0) {
          this.locationInfo = this.allLocations.find(l => l.locationId === this._locationId);

          if (this.locationInfo.name && this.locationInfo.name.length > 17) {
            this.displayName = this.locationInfo.name.slice(0, 15) + '...';
          } else if (this.locationInfo.name) {this.displayName = this.locationInfo.name; }
        }
      });

      // this._locationId = changes.location.currentValue;
      // if (this.allLocations && this.allLocations.length > 0) {
      //   this.locationInfo = this.allLocations.find(l => l.locationId === changes.location.currentValue);
      // }
      // if (this.locationInfo.name && this.locationInfo.name.length > 17) {this.displayName = this.locationInfo.name.slice(0,15) + '...';}
      // else if (this.locationInfo.name) {this.displayName = this.locationInfo.name;}
      // console.log(this.locationInfo);
    }
    // console.log(this._locationId);
  }

  constructor(private locationClient: LocationClient,
    private dashboardService: DashboardService,
    private stompService: StompService, ) {
      this.locationDiaryData = new LocationDiaryData([0,0,0,0]);
    this.locationClient.getAllLocations(new GetAllLocationParams())
      .subscribe((result: APIResponseOfGetAllLocationResult) => {
        this.allLocations = result.data.results;
        if (this._locationId && this._locationId > 0) {
          this.locationInfo = this.allLocations.find(l => l.locationId === this._locationId);

          if (this.locationInfo.name && this.locationInfo.name.length > 17) {
            this.displayName = this.locationInfo.name.slice(0, 15) + '...';
          } else if (this.locationInfo.name) { this.displayName = this.locationInfo.name; }
        }
      });

      this.dashboardService.locationDiaryDataArray$.subscribe(
        x => {
          const index = x.findIndex(y => y.locationId === this._locationId);
          if (index !== -1) {
          this.locationDiaryData = x[index];
          }
        }
      )
      // this.locationDiaryData$.subscribe(_ => console.log('CONSOLE LOG LOCATION DIARY', _));
  }

  openWindow() {
    this.stompService.goToLocationDiary(this.locationInfo.locationId);
  }
}
