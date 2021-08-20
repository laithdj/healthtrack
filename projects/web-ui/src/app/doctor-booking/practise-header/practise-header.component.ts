import { Component, OnInit } from '@angular/core';
import { Service, Marker } from '../app.service';
import { ActivatedRoute } from '@angular/router';
import { AppointmentTimesComponent } from '../appointment-times/appointment-times.component';

@Component({
  selector: 'app-practise-header',
  templateUrl: './practise-header.component.html',
  styleUrls: ['./practise-header.component.css']
})
export class PractiseHeaderComponent implements OnInit {

  customMarkerUrl: string;
  mapMarkerUrl: string;
  originalMarkers: Marker[];
  markers: Marker[];
  apt: boolean;

  constructor(public service: Service , private route: ActivatedRoute) {
    this.customMarkerUrl = this.mapMarkerUrl = service.getMarkerUrl();
    this.originalMarkers = this.markers = service.getMarkers();
  }
  checkCustomMarker(data) {
    this.mapMarkerUrl = data.value ? this.customMarkerUrl : null;
    this.markers = this.originalMarkers;
  }
  showTooltips() {
    this.markers = this.markers.map(function (item) {
      const newItem = JSON.parse(JSON.stringify(item));
      newItem.tooltip.isShown = true;
      return newItem;
    });
  }
  checkUrl() {
    if (this.route.component === AppointmentTimesComponent) {
        this.service.apt = true;
      } else {
        this.service.apt = false;
      }
}

  ngOnInit() {
    this.checkUrl();

  }

}
