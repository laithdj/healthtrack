import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { BookingTypeComponent } from './booking-type/booking-type.component';
import { AppointmentTimesComponent } from './appointment-times/appointment-times.component';
import { DoctorBookingComponent } from './doctor-booking.component';


const doctorBookingRoutes: Routes = [
  { path: '', component: DoctorBookingComponent ,
  children: [
    { path: '', redirectTo: 'patient-details' },
    { path: 'patient-details', component: PatientDetailsComponent },
    { path: 'booking-type', component: BookingTypeComponent },
    { path: 'appointment-times', component: AppointmentTimesComponent },

  ]},
  { path: 'patient-details/:token', component: PatientDetailsComponent},


];

@NgModule({
  imports: [
    RouterModule.forChild(doctorBookingRoutes)
  ],
  exports: [RouterModule]
})
export class DoctorBookingRoutingModule {
}
