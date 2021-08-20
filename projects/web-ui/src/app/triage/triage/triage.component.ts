import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AddPatientApiRequestParams, BookingTypeDO, DoctorClient, DoctorDO, GetAllLocationParams, LocationClient, LocationInfo,
  LocationWithDoctors, Patient, PatientClient, StaffDO, TriageBookingAppointmentDO, TriageBookingDO, TriageOptionDO,
  TriageReferralDO } from '../../../../../../Generated/CoreAPIClient';
import { StompService } from '../../shared/stomp/stomp.service';
import { TriageSystemService } from '../triage-system.service';

export class TriageOptions {
  id: number;
  text: string;
}

@Component({
  selector: 'app-triage',
  templateUrl: './triage.component.html',
  styleUrls: ['./triage.component.css']
})

export class TriageComponent implements OnInit {
  triageOptions: TriageOptionDO[];
  purposes: BookingTypeDO[] = new Array();
  purpose_display: BookingTypeDO = new BookingTypeDO();
  bookingStatus: string[] = ['Patient has arrived', 'Patient to be scheduled'];
  referralOptions: string[] = ['Valid Referrals', 'All Referrals'];
  workflowSteps: string[];
  locations: LocationInfo[] = new Array();
  referrals: TriageReferralDO[] = new Array();
  booking: TriageBookingDO;
  doctors: DoctorDO[];
  addBooking = false;
  triagebookings: TriageBookingAppointmentDO = new TriageBookingAppointmentDO();
  editBooking = false;
  locationsWithDoctors: LocationWithDoctors[];
  location_display: LocationInfo = new LocationInfo();
  selectAllModeValue = 'page';
  booking_id: number;
  selectionModeValue = 'all';
  selectedLocation: LocationWithDoctors;
  associates: StaffDO[];
  patient: Patient;

  constructor(
    protected triageService: TriageSystemService,
    private titleService: Title,
    private locationClient: LocationClient,
    private stompService: StompService,
    private route: ActivatedRoute,
    private router: Router,
    private doctorClient: DoctorClient,
    private patientClient: PatientClient,
  ) {
    this.booking = new TriageBookingDO();
    this.booking.patientId = 1011;
    this.route.params.subscribe(params => {
      // unary operator + parse string from url param to number
      const bookingId = +params['bookingId'];
      if (bookingId) {
        this.booking_id = bookingId;
        this.getBooking(bookingId);
      }
    });
    this.selectedLocation = new LocationWithDoctors;
    this.titleService.setTitle('Triage');
  }

  ngOnInit() {

    this.referrals[0] = new TriageReferralDO();
    this.referrals[0].type = 'General Referral';
    // this.referrals[0].location = '';
    this.referrals[0].toDate = new Date();
    this.referrals[0].referringDoctor = new DoctorDO();
    this.referrals[0].referringDoctor.doctorName = 'John Smith';
    this.getBooking(this.booking_id);
    this.getPurposes();
    this.getWorkflowSteps();
    this.getLocations();
    this.getTriageOptions();
    this.getDoctors();
    this.getLocationsWithDoctors();
  }

  getPurposes() {
    this.triageService.getPurposes().subscribe(response => {
      this.purposes = response.data;
    }, error => console.log(error));
  }

  addBookingButton() {
    this.triagebookings = new TriageBookingAppointmentDO();

    this.addBooking = true;
  }
  cancelAddBooking() {
    this.addBooking = false;
  }
  editBookingButton(appointmentId, date) {
    this.editBooking = true;
    //  this.triagebookings = this.booking.appointments.find(m => m.appointmentId === appointmentId);
    this.getTriageAppointment(appointmentId, date);
    console.log(this.triagebookings);
  }

  getTriageAppointment(appointmentId, date) {
    this.triageService.getTriageAppointment(appointmentId).subscribe(response => {
      this.triagebookings = response.data;
      this.triagebookings.startDate = date;
    }, error => console.log(error));
  }

  deleteTriageAppointment(appointmentId) {
    this.triageService.deleteTriageAppointmentBookings(appointmentId, 'lee').subscribe(response => {
      this.editBooking = false;
      this.getBooking(this.booking_id);

    }, error => console.log(error));
  }

  cancelEditBooking() {
    this.editBooking = false;
  }
  getWorkflowSteps() {
    this.triageService.getWorkflowSteps().subscribe(response => {
      this.workflowSteps = response.data;
    }, error => console.log(error));
  }

  saveTriageBooking(triagebookings: TriageBookingAppointmentDO, id: string) {
    this.triagebookings.endDate = this.triagebookings.startDate;
    this.triagebookings.triageBookingId = this.booking_id;
    this.triagebookings.doctorId = 307;
    this.triageService.saveTriageAppointmentBookings(triagebookings, id).subscribe(response => {
      console.log(triagebookings);
      this.addBooking = false;
      this.getBooking(this.booking_id);

    }, error => console.log(error));
  }

  updateTriageBooking(triagebookings: TriageBookingAppointmentDO, id: string) {
    this.triagebookings.endDate = this.triagebookings.startDate;
    this.triagebookings.triageBookingId = this.booking_id;
    this.triagebookings.doctorId = 307;
    this.triageService.updateTriageAppointmentBookings(triagebookings, id).subscribe(response => {
      console.log(triagebookings);
      this.editBooking = false;
      this.getBooking(this.booking_id);

    }, error => console.log(error));
  }

  getLocations() {
    this.locationClient.getAllLocations(new GetAllLocationParams()).subscribe(response => {
      this.locations = response.data.results;
    });
  }

  getTriageOptions() {
    this.triageService.getTriageOptions().subscribe(response => {
      this.triageOptions = response.data;
    }, error => console.log(error));
  }

  getReferrals() {
    console.log(this.booking);
    this.triageService.getBookingReferrals(this.booking).subscribe(response => {
      this.referrals = response.data;
      if (!this.referrals) {
        this.referrals[0].type = 'General Referel';
        // this.referrals[0].location = '';
        this.referrals[0].toDate = new Date();
        this.referrals[0].referringDoctor.doctorName = 'John Smith';
      }
    });
  }

  getLocationsAndDoctors() {
    console.log(this.stompService.subscribeLocations('Jacob'));
  }

  getBooking(Id: number) {
    if (Id) {
      this.triageService.getTriageBooking(Id).subscribe(response => {
        if (response.data) {
          this.booking = response.data;
          /* this.booking.appointments.forEach(d => {
             if(this.purposes){
               this.purpose_display = this.purposes.find(m => m.bookingCode === d.bookingType);
               if (this.purpose_display) {
                 d.bookingType = this.purpose_display.display;
               }
             }
           });*/
          console.log(this.booking);
          this.getReferrals();
          this.getPatient(response.data.patientId);
        }
      });
    }
  }

  getLocationName(locationId: number): string {
    this.location_display = this.locations.find(m => m.locationId === locationId);
    console.log(this.location_display);
    if (this.location_display) {
      return this.location_display.name;
    } else {
      return '';
    }
  }
  getPurposesName(bookingCode: string): string {
    this.purpose_display = this.purposes.find(m => m.bookingCode === bookingCode);
    console.log(this.location_display);
    if (this.purpose_display) {
      return this.purpose_display.display;
    } else {
      return '';
    }
  }

  getDoctors() {
    this.doctorClient.getAllDoctors().subscribe(response => {
      this.doctors = response.data;
    });
  }

  getLocationsWithDoctors() {
    this.triageService.getLocationsWithDoctors().subscribe(response => {
      this.locationsWithDoctors = response.data;
      this.selectedLocation = this.locationsWithDoctors.find(x =>
        x.locationId === this.booking.locationId);
      console.log(response.data);
    });
  }

  getAssociates() {
    this.triageService.getAssociatesForLocation(this.selectedLocation.locationId).subscribe(response => {
      this.associates = response.data;
    });
  }

  getPatient(patientId: number) {
    this.patientClient.getPatient(patientId).subscribe((result: AddPatientApiRequestParams) => {
      this.patient = result as Patient;
    });
  }

  formatDate(date): string {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getDate() + '/' + date.getMonth() + 1 + '/' + date.getFullYear() + ' ' + strTime;

  }

}
