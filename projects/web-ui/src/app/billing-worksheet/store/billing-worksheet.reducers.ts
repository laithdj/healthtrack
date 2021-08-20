import * as _ from 'lodash';
import { addMonths, endOfDay, startOfDay } from 'date-fns';
import {
  BillWorksheetItem,
  DoctorListItem,
  LocationInfo,
  WorksheetClaimStatus,
  FeeTableBillItems,
  CompanyDO,
} from '../../../../../../Generated/CoreAPIClient';
import { AppState } from '../../app-store/reducers';
import { BillingWorksheetActions, BillingWorksheetActionTypes } from './billing-worksheet.actions';
import { WorksheetClaimStatusDisplay } from '../../shared/models/WorksheetClaimStatusDisplay.model';

export interface BillingWorksheetAppState extends AppState {
  // eslint-disable-next-line no-use-before-define
  'billingWorksheetState': BillingWorksheetState;
}

export interface BillingWorksheetState {
  doctors: DoctorListItem[];
  worksheetItems: BillWorksheetItem[];
  locations: LocationInfo[];
  statuses: WorksheetClaimStatusDisplay[];
  selectedStatus: WorksheetClaimStatus;
  selectedLocation: number;
  selectedDoctor: number;
  fromDate: Date;
  toDate: Date;
  selectedClaimId: number;
  servicesList: FeeTableBillItems[];
  companies: CompanyDO[];
}

const initialState: BillingWorksheetState = {
  doctors: [],
  worksheetItems: [],
  locations: [],
  statuses: [
    { statusDisplayName: 'All', shortDisplayName: 'All', status: WorksheetClaimStatus.Unknown },
    { statusDisplayName: 'Booking', shortDisplayName: 'Booking', status: WorksheetClaimStatus.Booking },
    { statusDisplayName: 'Coded', shortDisplayName: 'Coded', status: WorksheetClaimStatus.Coded },
    { statusDisplayName: 'Waiting', shortDisplayName: 'Waiting', status: WorksheetClaimStatus.Waiting },
    {
      statusDisplayName: 'Pending Invoice: Patient',
      shortDisplayName: 'Pending: Patient',
      status: WorksheetClaimStatus.PendingPatientInvoice,
    },
    {
      statusDisplayName: 'Pending Invoice: Insurer',
      shortDisplayName: 'Pending: Insurer',
      status: WorksheetClaimStatus.PendingHealthInsurerInvoice,
    },
    { statusDisplayName: 'Complete', shortDisplayName: 'Complete', status: WorksheetClaimStatus.Complete }],
  selectedStatus: WorksheetClaimStatus.Unknown,
  selectedLocation: 0,
  selectedDoctor: 0,
  fromDate: startOfDay(addMonths(new Date(), -1)),
  toDate: endOfDay(addMonths(new Date(), 1)),
  selectedClaimId: 0,
  servicesList: [],
  companies: [],
};

export function billingWorksheetReducers(state = initialState, action: BillingWorksheetActions): BillingWorksheetState {
  switch (action.type) {
    case BillingWorksheetActionTypes.InitFetchSuccess: {
      return {
        ...state,
        doctors: [...action.payload.doctors],
        locations: [...action.payload.locations],
        companies: [...action.payload.companies],
      };
    }

    case BillingWorksheetActionTypes.FilteredClaimsFetchSuccess: {
      return {
        ...state,
        worksheetItems: [...action.payload],
      };
    }

    case BillingWorksheetActionTypes.SelectedStatusChanged: {
      return {
        ...state,
        selectedStatus: action.payload,
      };
    }

    case BillingWorksheetActionTypes.SelectedLocationChanged: {
      return {
        ...state,
        selectedLocation: action.payload,
      };
    }

    case BillingWorksheetActionTypes.SelectedDoctorChanged: {
      return {
        ...state,
        selectedDoctor: action.payload,
      };
    }

    case BillingWorksheetActionTypes.DateRangeChanged: {
      return {
        ...state,
        fromDate: action.payload.fromDate,
        toDate: action.payload.toDate,
      };
    }

    case BillingWorksheetActionTypes.SelectedClaimIdChanged: {
      return {
        ...state,
        selectedClaimId: action.payload,
      };
    }

    case BillingWorksheetActionTypes.LoadBookingsSubmit: {
      return {
        ...state,
        selectedLocation: action.payload.filter.locationId,
        selectedDoctor: action.payload.filter.doctorId,
        fromDate: action.payload.fromDate,
        toDate: action.payload.toDate,
      };
    }

    case BillingWorksheetActionTypes.SaveClaimSubmitSuccess:
    case BillingWorksheetActionTypes.UpdateHealthFundSubmitSuccess: {
      const worksheetClaims = [...state.worksheetItems];
      if (action.payload && action.payload.length > 0) {
        const claimId = action.payload[0]?.claimId;
        let counter = 0;

        worksheetClaims.forEach((item, index) => {
          if (item.claimId === claimId) {
            worksheetClaims[index] = _.cloneDeep(action.payload[counter]);
            counter++;
          }
        });
      }

      return {
        ...state,
        worksheetItems: [...worksheetClaims],
      };
    }

    case BillingWorksheetActionTypes.AddNewServiceSubmitSuccess: {
      const wsi = _.cloneDeep(state.worksheetItems);
      const items = _.cloneDeep(wsi.filter((item) => item.claimId === action.payload.claimId));

      // if an item exists but has no service id, replace it
      // with the returned claim item, or else just add it to the list
      if (items.some((i) => !i.serviceId)) {
        const idx = wsi.findIndex((i) => i.claimId === action.payload.claimId && !i.serviceId);
        wsi[idx] = action.payload;
      } else {
        wsi.push(action.payload);
      }

      const serviceList: string[] = [];

      wsi.forEach((item) => {
        if (item.claimId === action.payload.claimId) {
          serviceList.push(item.serviceCode);
        }
      });

      for (let index = 0; index < wsi.length; index++) {
        const element = _.cloneDeep(wsi[index]);

        if (element.claimId === action.payload.claimId) {
          let services = '';
          serviceList.forEach((service) => {
            services = (services.trim().length === 0) ? service : `${services}, ${service}`;
          });
          element.services = services;

          wsi[index] = element;
        }
      }

      return {
        ...state,
        worksheetItems: [...wsi],
      };
    }

    case BillingWorksheetActionTypes.DeleteWorkSheetClaimSuccess: {
      const items = [...state.worksheetItems];
      const toDelete = items.filter((a) => a.claimId === action.payload);

      if (toDelete.length > 1) {
        toDelete.forEach((item) => {
          const index = items.findIndex((a) => a.serviceId === item.serviceId);
          if (index > -1) {
            items.splice(index, 1);
          }
        });
      } else {
        const index = items.findIndex((a) => a.claimId === action.payload);
        if (index > -1) {
          items.splice(index, 1);
        }
      }

      return {
        ...state,
        worksheetItems: [...items],
      };
    }

    case BillingWorksheetActionTypes.DeleteServiceSubmitSuccess: {
      const items = [...state.worksheetItems];
      const numItemsForClaim = items.filter((w) => w.claimId === action.payload.claimId);
      const idx = items.findIndex((wsi) => wsi.serviceId === action.payload.serviceId);

      if (numItemsForClaim.length === 1) {
        const item = _.cloneDeep(items[idx]);
        item.coPayment = null;
        item.coPaymentOverride = null;
        item.cover = null;
        item.coverFee = null;
        item.serviceId = null;
        item.fullFee = null;
        item.insurerCode = null;
        item.serviceCode = null;
        item.description = null;
        item.services = '';
        items[idx] = item;
      } else {
        items.splice(idx, 1);
        const serviceList: string[] = [];

        items.forEach((item) => {
          if (item.claimId === action.payload.claimId) {
            serviceList.push(item.serviceCode);
          }
        });

        for (let index = 0; index < items.length; index++) {
          const element = _.cloneDeep(items[index]);

          if (element.claimId === action.payload.claimId) {
            let services = '';

            serviceList.forEach((service) => {
              services = (services.trim().length === 0) ? service : `${services}, ${service}`;
            });

            element.services = services;
            items[index] = element;
          }
        }
      }

      return {
        ...state,
        worksheetItems: [...items],
      };
    }

    case BillingWorksheetActionTypes.GetItemsForBookingSubmitSuccess: {
      return {
        ...state,
        worksheetItems: [...action.payload],
        selectedClaimId: action.payload[0].claimId,
      };
    }

    case BillingWorksheetActionTypes.ServicesListFetchSuccess: {
      const services = [...state.servicesList];
      services.push(action.payload);

      return {
        ...state,
        servicesList: [...services],
      };
    }

    case BillingWorksheetActionTypes.GetAllCompaniesFetchSuccess: {
      return {
        ...state,
        companies: [...action.payload],
      };
    }

    default:
      return state;
  }
}
