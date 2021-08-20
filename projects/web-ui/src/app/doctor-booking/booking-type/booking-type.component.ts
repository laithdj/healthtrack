import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Service } from '../app.service';
import { AppointmentTimesComponent } from '../appointment-times/appointment-times.component';

@Component({
  selector: 'app-booking-type',
  templateUrl: './booking-type.component.html',
  styleUrls: ['./booking-type.component.css']
})
export class BookingTypeComponent implements OnInit {
  password = '';
  medCheck = false;
  token: any;
  maxDate: Date = new Date();
  cityPattern = '^[^0-9]+$';
  namePattern: any = /^[^0-9]+$/;
  phonePattern: any = /^\+\s*1\s*\(\s*[02-9]\d{2}\)\s*\d{3}\s*-\s*\d{4}$/;
  countries: string[];
  phoneRules: any = {
    X: /[02-9]/
  }
  bookingTypeList = ['New Consultation', 'Follow-up Consultation', 'Echocardiogram' , 'ECG'];
  doctorList = ['Dr Mark Ballam' , 'Dr Tim Preston' , 'Dr Ian Rutherford'];
  locationsList = ['Wesley Hospital - Auchenflower' , 'Greenslopes Hospital' , 'Sunshine Coast Hospital'];

  constructor(private route: ActivatedRoute, private router: Router, private service: Service) {
    this.route.params.subscribe(params => {
      // unary operator + parse string from url param to number
      this.token = +params['token'];
      if (this.token) {
        this.medCheck = true;
      }

    });
  }
  ngOnInit(){
    this.checkUrl();
  }
  next() {
    this.router.navigate(['online-booking/appointment-times']);
    this.service.apt = true;
  }
  back() {
    this.router.navigate(['doctor-booking/patient-details']);
  }
  checkUrl() {
    if (this.route.component === AppointmentTimesComponent) {
        this.service.apt = true;
      } else {
        this.service.apt = false;
      }
}
}
