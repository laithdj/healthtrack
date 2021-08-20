import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { APIResponseOfListOfBookingTypeDO, APIResponseOfListOfLocationWithDoctors, APIResponseOfListOfStaffDO, APIResponseOfListOfString,
  APIResponseOfListOfTriageOptionDO, APIResponseOfListOfTriageReferralDO, APIResponseOfTriageBookingAppointmentDO, APIResponseOfTriageBookingDO,
  TriageBookingAppointmentDO, TriageBookingDO, TriageClient } from '../../../../../Generated/CoreAPIClient';
import { SetError } from '../app-store/app-ui-state.actions';
import { AppState } from '../app-store/reducers';
import { StompService } from '../shared/stomp/stomp.service';

@Injectable({
  providedIn: 'root'
})
export class TriageSystemService {

    private _locationData = new Subject<TriageBookingDO>();
    locationData$ = this._locationData.asObservable();

  constructor(private triageClient: TriageClient,
    private store: Store<AppState>,
    private stompService: StompService) {}

    requestLocationsForUser(username: string) {
    }

    sendLocationsSubscriptionRequest(username: string) {
    }

    subscribeLocations(username: string) {
        this.stompService.subscribeLocations(username);
    }

  getPurposes(): Observable<APIResponseOfListOfBookingTypeDO> {
      return this.triageClient.getPurposes().pipe(
          map((response: APIResponseOfListOfBookingTypeDO) => {
              return response;
          }, err => this.store.dispatch(new SetError({ errorMessages: [
              'Unable to process query, please check your network connection.'
          ]}))));
  }

  getTriageBooking(index: number): Observable<APIResponseOfTriageBookingDO> {
    return this.triageClient.getTriageBooking(index).pipe(
        map((response: APIResponseOfTriageBookingDO) => {
            return response;
        }, err => this.store.dispatch(new SetError({ errorMessages: [
            'Unable to process query, please check your network connection.'
        ]}))));
    }

    getWorkflowSteps(): Observable<APIResponseOfListOfString> {
        return this.triageClient.getWorkflowSteps().pipe(
            map((response: APIResponseOfListOfString) => {
                return response;
            }, err => this.store.dispatch(new SetError({ errorMessages: [
                'Unable to process query, please check your network connection.'
            ]}))));
    }

    getTriageOptions(): Observable<APIResponseOfListOfTriageOptionDO> {
        return this.triageClient.getTriageOptions().pipe(
            map((response: APIResponseOfListOfTriageOptionDO) => {
                return response;
            }, err => this.store.dispatch(new SetError({ errorMessages: [
                'Unable to process query, please check your network connection.'
            ]}))));
    }

    getBookingReferrals(booking: TriageBookingDO): Observable<APIResponseOfListOfTriageReferralDO> {
        return this.triageClient.getReferrals(booking).pipe(
            map((response: APIResponseOfListOfTriageReferralDO) => {
                return response;
            }, err => this.store.dispatch (new SetError({ errorMessages: [
                'Unable to process query, please check your network connection.'
            ]}))));
    }

    getLocationsWithDoctors(): Observable<APIResponseOfListOfLocationWithDoctors> {
        return this.triageClient.getLocationsAndDoctors().pipe(
            map((response: APIResponseOfListOfLocationWithDoctors) => {
                return response;
            }, err => this.store.dispatch (new SetError({ errorMessages: [
                'Unable to process query, please check your network connection.'
            ]}))));
    }

    getAssociatesForLocation(locationId: number): Observable<APIResponseOfListOfStaffDO> {
        return this.triageClient.getAssociates(locationId).pipe(
            map((response: APIResponseOfListOfStaffDO) => {
                return response;
            }, err => this.store.dispatch (new SetError({ errorMessages: [
                'Unable to process query, please check your network connection.'
            ]}))));
    }


    saveTriageAppointmentBookings(booking: TriageBookingAppointmentDO , id: string): Observable<APIResponseOfTriageBookingAppointmentDO> {
        return this.triageClient.saveTriageBookingAppointment(booking, id).pipe(
            map((response: APIResponseOfTriageBookingAppointmentDO) => {
                return response;
            }, err => this.store.dispatch (new SetError({ errorMessages: [
                'Unable to process query, please check your network connection.'
            ]}))));
    }
    updateTriageAppointmentBookings(booking: TriageBookingAppointmentDO , id: string): Observable<APIResponseOfTriageBookingAppointmentDO> {
        return this.triageClient.updateTriageBookingAppointment(booking, id).pipe(
            map((response: APIResponseOfTriageBookingAppointmentDO) => {
                return response;
            }, err => this.store.dispatch (new SetError({ errorMessages: [
                'Unable to process query, please check your network connection.'
            ]}))));
    }
    deleteTriageAppointmentBookings(appoitnemntid: number , id: string): Observable<APIResponseOfTriageBookingAppointmentDO> {
        return this.triageClient.deleteTriageBookingAppointment(appoitnemntid, id).pipe(
            map((response: APIResponseOfTriageBookingAppointmentDO) => {
                return response;
            }, err => this.store.dispatch (new SetError({ errorMessages: [
                'Unable to process query, please check your network connection.'
            ]}))));
    }
    getTriageAppointment(appoitnemntid: number): Observable<APIResponseOfTriageBookingAppointmentDO> {
        return this.triageClient.getTriageAppointment(appoitnemntid).pipe(
            map((response: APIResponseOfTriageBookingAppointmentDO) => {
                return response;
            }, err => this.store.dispatch (new SetError({ errorMessages: [
                'Unable to process query, please check your network connection.'
            ]}))));
    }

}
