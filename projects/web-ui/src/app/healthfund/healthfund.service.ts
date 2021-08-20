import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APIResponseOfInt32, APIResponseOfListOfNZBillingFeeDO, APIResponseOfListOfNZBillingFeeTableDO, APIResponseOfNZBillingFeeDO,
  APIResponseOfNZBillingFeeTableDO, NZBillingClient, NZBillingFeeDO, NZBillingFeeTableDO, APIResponseOfListOfString,
  APIResponseOfBoolean } from '../../../../../Generated/CoreAPIClient';
import { SetError } from '../app-store/app-ui-state.actions';
import { AppState } from '../app-store/reducers';

@Injectable({
  providedIn: 'root'
})
export class HealthfundService {

  constructor(private nzBillingClient: NZBillingClient,
    private store: Store<AppState>) { }

  getFeeTable(): Observable<APIResponseOfListOfNZBillingFeeTableDO> {
    return this.nzBillingClient.getUserManagedFeeTables().pipe(
      map((response: APIResponseOfListOfNZBillingFeeTableDO) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }
  getSingleFeeTable(fee_table_id: number): Observable<APIResponseOfNZBillingFeeTableDO> {
    return this.nzBillingClient.getUserManagedFeeTable(fee_table_id).pipe(
      map((response: APIResponseOfNZBillingFeeTableDO) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }

  updateFeeTable(table: NZBillingFeeTableDO , user: string): Observable<APIResponseOfNZBillingFeeTableDO> {
    return this.nzBillingClient.updateFeeTable(table , user).pipe(
      map((response: APIResponseOfNZBillingFeeTableDO) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }

  createFeeTable(table: NZBillingFeeTableDO , user: string): Observable<APIResponseOfNZBillingFeeTableDO> {
    return this.nzBillingClient.creatFeeTable(table, user).pipe(
      map((response: APIResponseOfNZBillingFeeTableDO) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }

  deleteFeeTable(table: number): Observable<APIResponseOfInt32> {
    return this.nzBillingClient.deleteFeeTable(table).pipe(
      map((response: APIResponseOfInt32) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }

  getFeesForTable(table: number): Observable<APIResponseOfListOfNZBillingFeeDO> {
    return this.nzBillingClient.getFeesForTable(table).pipe(
      map((response: APIResponseOfListOfNZBillingFeeDO) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }

  getFee(tableId: number, itemNum: string): Observable<APIResponseOfNZBillingFeeDO> {
    return this.nzBillingClient.getFee(tableId, itemNum).pipe(
      map((response: APIResponseOfNZBillingFeeDO) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }

  updateFee(fee: NZBillingFeeDO, existingItemNum: string, existingTableId: number  ): Observable<APIResponseOfNZBillingFeeDO> {
    return this.nzBillingClient.updateFee(fee, existingItemNum, existingTableId).pipe(
      map((response: APIResponseOfNZBillingFeeDO) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }
  createFee(fee: NZBillingFeeDO): Observable<APIResponseOfNZBillingFeeDO> {
    return this.nzBillingClient.createFee(fee).pipe(
      map((response: APIResponseOfNZBillingFeeDO) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }

  deleteFee(fee: NZBillingFeeDO): Observable<APIResponseOfNZBillingFeeDO> {
    return this.nzBillingClient.deleteFee(fee).pipe(
      map((response: APIResponseOfNZBillingFeeDO) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }

  testFeeforDeletion(table: NZBillingFeeTableDO): Observable<APIResponseOfListOfString> {
    return this.nzBillingClient.testFeeForDeletion(table).pipe(
      map((response: APIResponseOfListOfString) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }
  checkItemExists(itemNum: string): Observable<APIResponseOfBoolean> {
    return this.nzBillingClient.checkItemExists(itemNum).pipe(
      map((response: APIResponseOfBoolean) => {
        return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }
}
