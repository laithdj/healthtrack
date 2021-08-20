import { Component, OnInit, ViewChild } from '@angular/core';
import { DxTreeListComponent } from 'devextreme-angular';
import { Service, Appointments } from '../app.service';
import DataSource from 'devextreme/data/data_source';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';


@Component({
  selector: 'app-appointment-times',
  templateUrl: './appointment-times.component.html',
  styleUrls: ['./appointment-times.component.css']
})
export class AppointmentTimesComponent implements OnInit {
  @ViewChild(DxTreeListComponent) tree: DxTreeListComponent;

  dataSource: DataSource;
  currentDate: Date = new Date();
  formattedDate = '';
  appointments: Appointments;
  calander = false;
  confirmBooking = false;
  times = ['Anytime', 'Early Morning' , 'Late Morning' , 'Early Afternoon' ,'Late Afternoon' ]

  listSelectionChanged = (e) => {
      this.appointments = e.addedItems[0];
  }
  constructor(private service: Service, private route: ActivatedRoute) {
      this.dataSource = service.getDataSource();
      this.appointments = service.getFirstDoctor();
  }
  ngOnInit(){
      this.checkUrl();
  }
  getItemKeys (item) {
    return Object.keys(item);
}

  open(){
    this.confirmBooking = true;
  }
  selectDate(){
    this.formattedDate =  moment(this.currentDate).format('DD/MM/YYYY');
    this.calander = false;
  }
  cancelDate(){
    this.calander = false;
  }
  openCal(){
    this.calander = true;
  }
  checkUrl() {
    if (this.route.component === AppointmentTimesComponent) {
        this.service.apt = true;
      } else {
        this.service.apt = false;
      }
}


}
