import * as _ from 'lodash';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import {
  addMonths,
  endOfDay,
  isBefore,
  startOfDay,
  isSameDay,
} from 'date-fns';
import { Subject } from 'rxjs';
import {
  map,
  take,
  takeUntil,
  withLatestFrom,
} from 'rxjs/operators';
import {
  BookingFilter,
  BillWorksheetItem,
  WorksheetClaimStatus,
} from '../../../../../Generated/CoreAPIClient';
import { SetError } from '../app-store/app-ui-state.actions';
import { selectLastBillingLocation } from '../app-store/app-ui.selectors';
import { DateTimeHelperService } from '../shared/helpers/date-time-helper.service';
import {
  BillingWorksheetActionTypes,
  FilteredClaimsFetch,
  DateRangeChanged,
  InitFetch,
  SelectedClaimIdChanged,
  SelectedDoctorChanged,
  SelectedLocationChanged,
  SelectedStatusChanged,
} from './store/billing-worksheet.actions';
import { BillingWorksheetAppState } from './store/billing-worksheet.reducers';
import {
  selectDoctorsByLocation,
  selectFromDate,
  selectLocations,
  selectSelectedDoctor,
  selectSelectedLocation,
  selectSelectedStatus,
  selectStatuses,
  selectToDate,
  selectWorksheetItemsByStatus,
  selectWorksheetItemsByClaimId,
} from './store/billing-worksheet.selectors';
import { GotoPatientAndArea } from '../../../../../Generated/HMS.Interfaces';
import { StompService } from '../shared/stomp/stomp.service';

@Component({
  selector: 'app-billing-worksheet',
  templateUrl: './billing-worksheet.component.html',
  styleUrls: ['./billing-worksheet.component.css'],
})
export class BillingWorksheetComponent implements OnInit, OnDestroy {
  private _destroyed$: Subject<boolean> = new Subject<boolean>();

  filter: BookingFilter = new BookingFilter();
  locations$ = this.store.pipe(select(selectLocations));
  worksheetItems$ = this.store.pipe(select(selectWorksheetItemsByStatus));
  uniqueWorksheetItems: BillWorksheetItem[] = [];
  doctors$ = this.store.pipe(select(selectDoctorsByLocation));
  lastBillingLocationId$ = this.store.pipe(select(selectLastBillingLocation));
  statuses$ = this.store.pipe(select(selectStatuses));
  selectedStatus$ = this.store.pipe(select(selectSelectedStatus));
  selectedLocation$ = this.store.pipe(select(selectSelectedLocation), map((sl: number) => {
    const filterCopy = _.cloneDeep(this.filter);
    filterCopy.locationId = sl;
    this.filter = filterCopy;
    return sl;
  }));
  selectedDoctor$ = this.store.pipe(select(selectSelectedDoctor), map((sd: number) => {
    const filterCopy = _.cloneDeep(this.filter);
    filterCopy.doctorId = sd;
    this.filter = filterCopy;
    return sd;
  }));
  fromDate$ = this.store.pipe(select(selectFromDate), map((from: Date) => {
    const newFrom = startOfDay(new Date(from));
    if (!this.filter.fromDate || !isSameDay(newFrom, this.dateHelper.getDate(this.filter.fromDate))) {
      if (this.filter) {
        const filterCopy = _.cloneDeep(this.filter);
        filterCopy.fromDate = _.cloneDeep(this.dateHelper.getStartDateTimeDO(new Date(from)));
        this.filter = filterCopy;
      }
    }
    return from;
  }));
  toDate$ = this.store.pipe(select(selectToDate), map((to: Date) => {
    const newTo = endOfDay(new Date(to));
    if (!this.filter.toDate || !isSameDay(newTo, this.dateHelper.getDate(this.filter.toDate))) {
      if (this.filter) {
        const filterCopy = _.cloneDeep(this.filter);
        filterCopy.toDate = this.dateHelper.getEndDateTimeDO(new Date(to));
        this.filter = filterCopy;
      }
    }
    return to;
  }));
  showEditPopup = false;
  showLoadBookings = false;
  showDateSelector = false;
  resetting = true;
  includeDeleted = false;
  showAuditInfo = false;
  selectedClaimId: number;
  detailView = false;

  constructor(private titleService: Title, private stompService: StompService,
    private store: Store<BillingWorksheetAppState>,
    private actions$: Actions, private dateHelper: DateTimeHelperService) { }

  ngOnInit() {
    this.titleService.setTitle('Patient Billing Worksheet');
    this.store.dispatch(new InitFetch());
    this.worksheetItems$.pipe(takeUntil(this._destroyed$)).subscribe((claims) => {
      const result: BillWorksheetItem[] = [];
      const mapClaim: number[] = [];

      for (let i = 0; i < claims.length; i++) {
        if (!mapClaim.some((a) => a === claims[i]?.claimId)) {
          mapClaim.push(claims[i].claimId);
          result.push(claims[i]);
        }
      }

      this.uniqueWorksheetItems = [...result];
    });

    this.actions$.pipe(ofType(BillingWorksheetActionTypes.InitFetchSuccess), takeUntil(this._destroyed$))
      .subscribe(() => this.resetFilter());
  }

  ngOnDestroy() {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  fetchFilteredBookings() {
    if (!this.resetting) {
      if (this.filter && this.filter.fromDate && this.filter.toDate) {
        this.store.dispatch(new FilteredClaimsFetch(this.filter));
        if (!isBefore(this.dateHelper.getDate(this.filter.fromDate), this.dateHelper.getDate(this.filter.toDate))) {
          this.store.dispatch(new SetError({ errorMessages: ['From Date must be before To Date.'] }));
        }
      } else {
        this.store.dispatch(new SetError({ errorMessages: ['One or more filter values are invalid'] }));
      }
    }
  }

  resetFilter() {
    this.resetting = true;
    let changed = false;

    this.selectedLocation$.pipe(take(1), withLatestFrom(this.lastBillingLocationId$)).subscribe(([sl, ll]) => {
      this.filter.locationId = (ll && ll > 0) ? ll : 0;
      if (ll !== sl) {
        this.store.dispatch(new SelectedLocationChanged(this.filter.locationId));
        changed = true;
      }
    });

    this.selectedDoctor$.pipe(take(1)).subscribe((dr) => {
      this.filter.doctorId = 0;
      if (dr !== 0) {
        this.store.dispatch(new SelectedDoctorChanged(0));
        changed = true;
      }
    });

    this.selectedStatus$.pipe(take(1)).subscribe((status) => {
      if (status !== WorksheetClaimStatus.Unknown) {
        this.store.dispatch(new SelectedStatusChanged(WorksheetClaimStatus.Unknown));
        changed = true;
      }
    });

    this.fromDate$.pipe(take(1), withLatestFrom(this.toDate$)).subscribe(([from, to]) => {
      this.filter.fromDate = this.dateHelper.getStartDateTimeDO(addMonths(new Date(), -1));
      this.filter.toDate = this.dateHelper.getEndDateTimeDO(addMonths(new Date(), 1));

      if (!isSameDay(this.dateHelper.getDate(this.filter.fromDate), from)
        || !isSameDay(this.dateHelper.getDate(this.filter.toDate), to)) {
        this.store.dispatch(new DateRangeChanged({
          fromDate: this.dateHelper.getDate(this.filter.fromDate),
          toDate: this.dateHelper.getDate(this.filter.toDate),
        }));

        changed = true;
      }
    });

    setTimeout(() => {
      this.resetting = false;
      if (changed === true) {
        this.fetchFilteredBookings();
      }
    }, 100);
  }

  onFromDateChanged(e: any) {
    const newFrom = startOfDay(new Date(e.value));

    this.fromDate$.pipe(take(1), withLatestFrom(this.toDate$)).subscribe(([from, to]) => {
      if (from && to && !isSameDay(from, newFrom)) {
        const filterCopy = _.cloneDeep(this.filter);
        filterCopy.fromDate = this.dateHelper.getStartDateTimeDO(newFrom);
        this.filter = filterCopy;
        this.store.dispatch(new DateRangeChanged({ fromDate: new Date(newFrom), toDate: new Date(to) }));
        this.fetchFilteredBookings();

        if (!isBefore(newFrom, to)) {
          this.store.dispatch(new SetError({ errorMessages: ['From Date must be before To Date.'] }));
        }
      }
    });
  }

  onToDateChanged(e: any) {
    const newTo = endOfDay(new Date(e.value));
    this.toDate$.pipe(take(1), withLatestFrom(this.fromDate$)).subscribe(([to, from]) => {
      if (!isSameDay(to, newTo)) {
        const filterCopy = _.cloneDeep(this.filter);
        filterCopy.toDate = this.dateHelper.getEndDateTimeDO(newTo);
        this.filter = filterCopy;
        this.store.dispatch(new DateRangeChanged({ fromDate: new Date(from), toDate: new Date(newTo) }));
        this.fetchFilteredBookings();

        if (!isBefore(from, newTo)) {
          this.store.dispatch(new SetError({ errorMessages: ['From Date must be before To Date.'] }));
        }
      }
    });
  }

  dateRangeChanged(fromDate: Date, toDate: Date) {
    this.fromDate$.pipe(take(1), withLatestFrom(this.toDate$)).subscribe(([from, to]) => {
      if (!isSameDay(to, toDate) || !isSameDay(from, fromDate)) {
        this.store.dispatch(new DateRangeChanged({ fromDate: new Date(fromDate), toDate: new Date(toDate) }));
        this.fetchFilteredBookings();
        if (!isBefore(fromDate, toDate)) {
          this.store.dispatch(new SetError({ errorMessages: ['From Date must be before To Date.'] }));
        }
      }
    });
  }

  onLocationChanged(e: any) {
    this.selectedLocation$.pipe(take(1)).subscribe((sl) => {
      if (sl !== e.value) {
        const filterCopy = _.cloneDeep(this.filter);
        filterCopy.locationId = e.value;
        this.filter = filterCopy;
        this.store.dispatch(new SelectedLocationChanged(this.filter.locationId));
        this.fetchFilteredBookings();
      }
    });
  }

  onIncludeDeletedChanged() {
    if (this.filter.includeDeleted !== this.includeDeleted) {
      const filterCopy = _.cloneDeep(this.filter);
      filterCopy.includeDeleted = this.includeDeleted;
      this.filter = filterCopy;
      this.fetchFilteredBookings();
    }
  }

  onLoadBookingsClicked() {
    this.showLoadBookings = true;
  }

  onShowDateSelector() {
    this.showDateSelector = true;
  }

  onDateRangeSelected(e: any) {
    // this.onFromDateChanged({ value: e.fromDate });
    // this.onToDateChanged({ value: e.toDate });
    this.dateRangeChanged(e.fromDate, e.toDate);
    this.showDateSelector = false;
  }

  onStatusClicked(status: WorksheetClaimStatus) {
    this.selectedStatus$.pipe(take(1)).subscribe((st) => {
      if (status !== st) {
        this.store.dispatch(new SelectedStatusChanged(status));
      }
    });
  }

  onStatusChanged(e: any) {
    this.onStatusClicked(e.value);
  }

  onDoctorChanged(e: any) {
    this.selectedDoctor$.pipe(take(1)).subscribe((sd) => {
      if (sd !== e.value && this.filter) {
        const filterCopy = _.cloneDeep(this.filter);
        filterCopy.doctorId = e.value;
        this.filter = filterCopy;
        this.store.dispatch(new SelectedDoctorChanged(this.filter.doctorId));
        this.fetchFilteredBookings();
      }
    });
  }

  onEditBooking(e: any) {
    this.selectedClaimId = e.value;
    this.selectedClaimIDChanged(this.selectedClaimId);
    this.store.pipe(take(1), select(selectWorksheetItemsByClaimId)).subscribe((items) => {
      if (!items.some((i) => i.deleted === true)) {
        this.showEditPopup = true;
      }
    });
  }

  selectedClaimIDChanged(claimId: number) {
    this.store.dispatch(new SelectedClaimIdChanged(claimId));
  }

  onRowDblClick(e: any) {
    this.onEditBooking({ value: e.data.claimId });
  }

  cellColour(e: any) {
    if (e && e.data) {
      // styling for deleted claims
      if (e.data.deleted === true) {
        e.cells.forEach((cell: any) => {
          cell.row.cells.forEach((c: any) => {
            if (c.cellElement) {
              // c.cellElement.bgColor = '#f7f7f7';
              c.cellElement.style.color = '#d9534f';
              // c.cellElement.style.textDecoration = 'line-through';
            }
          });
        });
      }

      // highlight green if co payment override is set
      if ((e.data.coPaymentOverride) || (e.data.coPaymentOverride === 0)) {
        if (e.cells && e.cells.length > 0 && e.cells[1] && e.cells[1].row && e.cells[1].row.cells
          && e.cells[1].row.cells.length > 0 && e.cells[1].row.cells[13] && e.cells[1].row.cells[13].cellElement) {
          e.cells[1].row.cells[13].cellElement.bgColor = '#5cb85c';
          e.cells[1].row.cells[13].cellElement.style.color = '#ffffff';
        }
      }

      // highlight no health insurer in red
      if (e.data.insurer === 'None') {
        if (e.cells && e.cells.length > 0 && e.cells[1] && e.cells[1].row && e.cells[1].row.cells
          && e.cells[1].row.cells.length > 0 && e.cells[1].row.cells[4] && e.cells[1].row.cells[4].cellElement) {
          e.cells[1].row.cells[4].cellElement.bgColor = '#d9534f';
          e.cells[1].row.cells[4].cellElement.style.color = '#ffffff';
        }
      }
    }
  }

  simpleCellColour(e: any) {
    if (e && e.data) {
      // styling for deleted claims
      if (e.data.deleted === true) {
        e.cells.forEach((cell) => {
          cell.row.cells.forEach((c) => {
            if (c.cellElement) {
              // c.cellElement.bgColor = '#f7f7f7';
              c.cellElement.style.color = '#d9534f';
              // c.cellElement.style.textDecoration = 'line-through';
            }
          });
        });
      }

      // highlight no health insurer in red
      if (e.data.insurer === 'None') {
        if (e.cells && e.cells.length > 0 && e.cells[1] && e.cells[1].row && e.cells[1].row.cells
          && e.cells[1].row.cells.length > 0 && e.cells[1].row.cells[5] && e.cells[1].row.cells[5].cellElement) {
          e.cells[1].row.cells[5].cellElement.bgColor = '#d9534f';
          e.cells[1].row.cells[5].cellElement.style.color = '#ffffff';
        }
      }
    }
  }

  onContextMenuPreparing(e: any) {
    if (e.row.rowType === 'data') {
      const component = this;

      e.items = [
        {
          text: 'Go To Patient',
          onItemClick() {
            const item = e.row.data as BillWorksheetItem;
            component.onGoToPatient(item.patientId);
          },
        },
        {
          text: 'Show Audit Info',
          onItemClick() {
            component.selectedClaimId = e.row.data.claimId;
            component.selectedClaimIDChanged(component.selectedClaimId);
            setTimeout(() => {
              component.showAuditInfo = true;
            }, 100);
          },
        }];
    }
  }

  onGoToPatient(patientId: number) {
    this.stompService.goToPatient(patientId, GotoPatientAndArea.Demographics);
  }
}
