import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DxFileUploaderComponent } from 'devextreme-angular';
import { Service } from '../app.service';
import { AppointmentTimesComponent } from '../appointment-times/appointment-times.component';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.css']
})
export class PatientDetailsComponent implements OnInit {
  @ViewChild('referralBtn') referralBtn: DxFileUploaderComponent;

  password = '';
  medCheck = false;
  referral = false;
  token: any;
  medDisabled = false;
  maxDate: Date = new Date();
  cityPattern = '^[^0-9]+$';
  namePattern: any = /^[^0-9]+$/;
  phonePattern: any = /^\+\s*1\s*\(\s*[02-9]\d{2}\)\s*\d{3}\s*-\s*\d{4}$/;
  countries: string[];
  phoneRules: any = {
    X: /[02-9]/
  };

  constructor(private route: ActivatedRoute, private router: Router, public service: Service) {
    this.route.params.subscribe(params => {
      console.log(this.route);
      this.token = +params['token'];

      if (this.token) {
        this.medDisabled = true;
        console.log(this.medDisabled);
      }
      // unary operator + parse string from url param to number
    });
  }

  ngOnInit() {
    this.checkUrl();
  }

  checkUrl() {
    if (this.route.component === AppointmentTimesComponent) {
      this.service.apt = true;
    } else {
      this.service.apt = false;
    }
  }
  
  medFieldChange() {
    if (this.medCheck) {
      this.medDisabled = true;
    } else {
      this.medDisabled = false;

    }
  }

  next() {
    this.router.navigate(['online-booking/booking-type']);
  }

  referralChange(e: any) {
    if (this.referral) {
      this.referralBtn.disabled = true;
    } else {
      this.referralBtn.disabled = false;
    }
  }
}
