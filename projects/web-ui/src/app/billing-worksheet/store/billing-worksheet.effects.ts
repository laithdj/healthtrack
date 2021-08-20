import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { forkJoin } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  APIResponseOfBillWorksheetItem,
  APIResponseOfBoolean,
  APIResponseOfListOfBillWorksheetItem,
  BillWorksheetClient,
  DoctorClient,
  DoctorDO,
  DoctorListItem,
  GetAllLocationParams,
  LocationClient,
  LocationInfo,
  APIResponseOfInt32,
  BillWorksheetItem,
  APIResponseOfFeeTableBillItems,
  CompanyClient,
  APIResponseOfListOfCompanyDO,
} from '../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../app-store/app-ui-state.actions';
import { selectUserPkId } from '../../app-store/app-ui.selectors';
import {
  AddNewServiceSubmit,
  AddNewServiceSubmitSuccess,
  BillingWorksheetActionTypes,
  DeleteServiceSubmit,
  DeleteServiceSubmitSuccess,
  FilteredClaimsFetch,
  FilteredClaimsFetchSuccess,
  GetItemsForBookingSubmit,
  GetItemsForBookingSubmitSuccess,
  InitFetch,
  InitFetchSuccess,
  LoadBookingsSubmit,
  SaveClaimSubmit,
  SaveClaimSubmitSuccess,
  UpdateHealthFundSubmit,
  UpdateHealthFundSubmitSuccess,
  DeleteWorkSheetClaim,
  DeleteWorkSheetClaimSuccess,
  ServicesListFetch,
  ServicesListFetchSuccess,
  GetAllCompaniesFetch,
  GetAllCompaniesFetchSuccess,
} from './billing-worksheet.actions';
import { BillingWorksheetAppState } from './billing-worksheet.reducers';
import { DateTimeHelperService } from '../../shared/helpers/date-time-helper.service';

@Injectable()
export class BillingWorksheetEffects {
  constructor(private actions$: Actions, private doctorClient: DoctorClient,
    private billWorksheetClient: BillWorksheetClient,
    private locationClient: LocationClient, private store: Store<BillingWorksheetAppState>,
    private dateTimeHelper: DateTimeHelperService,
    private companyClient: CompanyClient) { }

  @Effect()
  initFetch$ = this.actions$.pipe(ofType<InitFetch>(BillingWorksheetActionTypes.InitFetch),
    switchMap(() => forkJoin(this.doctorClient.getAllDoctorListItems(),
      this.locationClient.getAllLocations(new GetAllLocationParams()),
      this.companyClient.getAllCompanies()).pipe(map(([drResponse, locResponse, companyResponse]) => {
      if (drResponse && drResponse.errorMessage && drResponse.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [drResponse.errorMessage] });
      }
      if (locResponse && locResponse.errorMessage && locResponse.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [locResponse.errorMessage] });
      }
      if (locResponse?.data?.errorMessage?.trim().length > 0) {
        return new SetError({ errorMessages: [locResponse.data.errorMessage] });
      }
      if (companyResponse?.errorMessage?.trim().length > 0) {
        return new SetError({ errorMessages: [companyResponse.errorMessage] });
      }
      return new InitFetchSuccess({
        doctors: this.getAllDoctorsOption(drResponse.data),
        locations: this.getAllLocationsOption(locResponse.data.results),
        companies: companyResponse.data,
      });
    })),
    ));

  @Effect()
  fetchFilteredWorksheetItems$ = this.actions$.pipe(
    ofType<FilteredClaimsFetch>(BillingWorksheetActionTypes.FilteredClaimsFetch),
    switchMap((action: FilteredClaimsFetch) => this.billWorksheetClient.getFilteredWorksheetItems(action.payload)
      .pipe(map((response: APIResponseOfListOfBillWorksheetItem) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new FilteredClaimsFetchSuccess(this.formatWorksheetItems(response.data));
      })),
    ));

  @Effect()
  loadBookings$ = this.actions$.pipe(ofType<LoadBookingsSubmit>(BillingWorksheetActionTypes.LoadBookingsSubmit),
    withLatestFrom(this.store.pipe(select(selectUserPkId))),
    switchMap(([action, userPkId]) => this.billWorksheetClient.getWorksheetClaimsFromBookings(
      action.payload.filter, userPkId).pipe(map((response: APIResponseOfListOfBillWorksheetItem) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [response.errorMessage] });
      }
      return new FilteredClaimsFetchSuccess(this.formatWorksheetItems(response.data));
    })),
    ));

  @Effect()
  getItemsForBookingId$ = this.actions$.pipe(ofType<GetItemsForBookingSubmit>(
    BillingWorksheetActionTypes.GetItemsForBookingSubmit), withLatestFrom(this.store.pipe(select(selectUserPkId))),
  switchMap(([action, userPkId]) => this.billWorksheetClient.getServicesForClaim(action.payload, userPkId)
    .pipe(map((response: APIResponseOfListOfBillWorksheetItem) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        return new SetError({ errorMessages: [response.errorMessage] });
      }
      return new GetItemsForBookingSubmitSuccess(this.formatWorksheetItems(response.data));
    })),
  ));

  @Effect()
  updateHealthFund$ = this.actions$.pipe(ofType<UpdateHealthFundSubmit>(
    BillingWorksheetActionTypes.UpdateHealthFundSubmit), withLatestFrom(this.store.pipe(select(selectUserPkId))),
  switchMap(([action, userPkId]) => this.billWorksheetClient.updateHealthFund(action.payload.claimId,
    action.payload.patientId, userPkId).pipe(switchMap((response) => {
    if (response.errorMessage && response.errorMessage.trim().length > 0) {
      return [new SetError({ errorMessages: [response.errorMessage] })];
    }
    return [new UpdateHealthFundSubmitSuccess(this.formatWorksheetItems(response.data.items))];
  })),
  ));

  @Effect()
  addNewService$ = this.actions$.pipe(ofType<AddNewServiceSubmit>(BillingWorksheetActionTypes.AddNewServiceSubmit),
    switchMap((action: AddNewServiceSubmit) => this.billWorksheetClient.createServiceForItemNum(action.payload.claimId,
      action.payload.serviceCode, action.payload.feeTableId, action.payload.coverPercentage)
      .pipe(map((response: APIResponseOfBillWorksheetItem) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new AddNewServiceSubmitSuccess(this.formatWorksheetItems([response.data])[0]);
      })),
    ));

  @Effect()
  deleteService$ = this.actions$.pipe(ofType<DeleteServiceSubmit>(BillingWorksheetActionTypes.DeleteServiceSubmit),
    switchMap((action: DeleteServiceSubmit) => this.billWorksheetClient.deleteService(action.payload.serviceId)
      .pipe(map((response: APIResponseOfBoolean) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new DeleteServiceSubmitSuccess(action.payload);
      })),
    ));

  @Effect()
  deleteWorkSheet$ = this.actions$.pipe(ofType<DeleteWorkSheetClaim>(BillingWorksheetActionTypes.DeleteWorkSheetClaim),
    withLatestFrom(this.store.pipe(select(selectUserPkId))), switchMap(([action, userPkId]) => this.billWorksheetClient
      .deleteWorksheetClaim(action.payload, userPkId).pipe(map((response: APIResponseOfInt32) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new DeleteWorkSheetClaimSuccess(action.payload);
      })),
    ));

  @Effect()
  saveClaim$ = this.actions$.pipe(ofType<SaveClaimSubmit>(BillingWorksheetActionTypes.SaveClaimSubmit),
    withLatestFrom(this.store.pipe(select(selectUserPkId))), switchMap(([action, userPkId]) => this.billWorksheetClient
      .updateServicesForWorksheetClaim(action.payload.items, userPkId,
        action.payload.setPatientNoCharge, action.payload.setInsurerNoCharge).pipe(map(
        (response: APIResponseOfListOfBillWorksheetItem) => {
          if (response.errorMessage && response.errorMessage.trim().length > 0) {
            return new SetError({ errorMessages: [response.errorMessage] });
          }
          return new SaveClaimSubmitSuccess(this.formatWorksheetItems(response.data));
        })),
    ));

  @Effect()
  getItemsForBookingSuccess$ = this.actions$.pipe(ofType<GetItemsForBookingSubmitSuccess>(
    BillingWorksheetActionTypes.GetItemsForBookingSubmitSuccess), map((action) => {
    if (action.payload.length > 0) {
      return new ServicesListFetch(action.payload[0].feeTableId);
    }
    return new ServicesListFetch(undefined);
  },
  ));

  @Effect()
  getServicesList$ = this.actions$.pipe(ofType<ServicesListFetch>(BillingWorksheetActionTypes.ServicesListFetch),
    switchMap((action) => this.billWorksheetClient.getServicesList(action.payload)
      .pipe(map((response: APIResponseOfFeeTableBillItems) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        }
        return new ServicesListFetchSuccess(response.data);
      })),
    ));

  @Effect()
  getAllCompanies$ = this.actions$.pipe(ofType<GetAllCompaniesFetch>(BillingWorksheetActionTypes.GetAllCompaniesFetch),
    switchMap(() => this.companyClient.getAllCompanies().pipe(map((response: APIResponseOfListOfCompanyDO) => {
      if (response?.errorMessage?.trim().length > 0) {
        return new SetError({ errorMessages: [response.errorMessage] });
      }
      return new GetAllCompaniesFetchSuccess(response.data);
    }))))

  getAllDoctorsOption(doctorsList: DoctorListItem[]): DoctorListItem[] {
    const allDrs = new DoctorDO();
    allDrs.doctorId = 0;
    allDrs.doctorName = 'All';
    allDrs.defaultLocation = 0;

    if (!doctorsList.some((dr) => dr.doctorId === 0)) {
      doctorsList.unshift(allDrs);
    }

    return doctorsList;
  }

  getAllLocationsOption(locations: LocationInfo[]): LocationInfo[] {
    const allLoc = new LocationInfo();
    allLoc.locationId = 0;
    allLoc.name = 'All';

    if (!locations.some((loc) => loc.locationId === 0)) {
      locations.unshift(allLoc);
    }

    return locations;
  }

  formatWorksheetItems(items: BillWorksheetItem[]): BillWorksheetItem[] {
    const serviceList: { claimId: number, services: string[] }[] = [];

    items.forEach((item) => {
      if (serviceList.some((a) => a.claimId === item.claimId)) {
        const index = serviceList.findIndex((b) => b.claimId === item.claimId);
        serviceList[index].services.push(item.serviceCode);
      } else {
        serviceList.push({ claimId: item.claimId, services: [item.serviceCode] });
      }
    });

    items.forEach((claimItem) => {
      if (claimItem.patientDateOfBirth) {
        claimItem.dateTimePatientDateOfBirth = this.dateTimeHelper.getDate(claimItem.patientDateOfBirth);
      }

      if (claimItem.bookingDate) {
        claimItem.dateTimeBookingDate = this.dateTimeHelper.getDate(claimItem.bookingDate);
      }

      const serviceIndex = serviceList.findIndex((a) => a.claimId === claimItem.claimId);
      if (serviceIndex > -1) {
        let services = '';
        serviceList[serviceIndex].services.forEach((service) => {
          services = (services.trim().length === 0) ? service : `${services}, ${service}`;
        });
        claimItem.services = services;
      }
    });

    return items;
  }
}
