import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { isBefore } from 'date-fns';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { DateTimeHelperService } from '../../shared/helpers/date-time-helper.service';
import { BillWorksheetItem, BookingFilter } from '../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../app-store/app-ui-state.actions';
import { LoadBookingsSubmit } from '../store/billing-worksheet.actions';
import { BillingWorksheetAppState } from '../store/billing-worksheet.reducers';
import {
  selectDoctorsByLocation,
  selectFromDate,
  selectLocations,
  selectSelectedDoctor,
  selectSelectedLocation,
  selectToDate,
  selectWorksheetItemsByStatus,
} from '../store/billing-worksheet.selectors';

@Component({
  selector: 'app-load-bookings',
  templateUrl: './load-bookings.component.html',
  styleUrls: ['./load-bookings.component.css'],
})
export class LoadBookingsComponent implements OnInit, OnDestroy {
  @Input() showPopup = false;

  @Output() popupClosed: EventEmitter<void> = new EventEmitter();

  editBookings: BillWorksheetItem[] = [];
  showDateSelector = false;
  filter: BookingFilter = new BookingFilter();
  locations$ = this.store.pipe(select(selectLocations));
  bookings$ = this.store.pipe(select(selectWorksheetItemsByStatus));
  doctors$ = this.store.pipe(select(selectDoctorsByLocation));
  selectedLocation$ = this.store.pipe(select(selectSelectedLocation));
  selectedDoctor$ = this.store.pipe(select(selectSelectedDoctor));
  fromDate$ = this.store.pipe(select(selectFromDate));
  fromDate = new Date();
  toDate = new Date();
  toDate$ = this.store.pipe(select(selectToDate));
  destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store<BillingWorksheetAppState>, private dateHelper: DateTimeHelperService) { }

  ngOnInit() {
    this.selectedLocation$.pipe(takeUntil(this.destroyed$)).subscribe((sl: number) => { this.filter.locationId = sl; });
    this.selectedDoctor$.pipe(takeUntil(this.destroyed$)).subscribe((sd: number) => { this.filter.doctorId = sd; });
    this.fromDate$.pipe(takeUntil(this.destroyed$)).subscribe((from) => {
      if (from) {
        const filterCopy = _.cloneDeep(this.filter);
        filterCopy.fromDate = _.cloneDeep(this.dateHelper.getStartDateTimeDO(new Date(from)));
        this.filter = filterCopy;
        this.fromDate = new Date(from);
      }
    });
    this.toDate$.pipe(takeUntil(this.destroyed$)).subscribe((to) => {
      if (to) {
        const filterCopy = _.cloneDeep(this.filter);
        filterCopy.toDate = _.cloneDeep(this.dateHelper.getEndDateTimeDO(new Date(to)));
        this.filter = filterCopy;
        this.toDate = new Date(to);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.unsubscribe();
  }

  onFromDateChanged() {
    this.filter.fromDate = this.dateHelper.getStartDateTimeDO(new Date(this.fromDate));
  }

  onToDateChanged() {
    this.filter.toDate = this.dateHelper.getEndDateTimeDO(new Date(this.toDate));
  }

  onDateRangeSelected(e: any) {
    this.toDate = e.toDate;
    this.fromDate = e.fromDate;
    this.filter.fromDate = this.dateHelper.getStartDateTimeDO(new Date(e.fromDate));
    this.filter.toDate = this.dateHelper.getEndDateTimeDO(new Date(e.toDate));
    this.showDateSelector = false;
  }

  resetFilters() {
    this.selectedLocation$.pipe(take(1)).subscribe((sl: number) => { this.filter.locationId = sl; });
    this.selectedDoctor$.pipe(take(1)).subscribe((sd: number) => { this.filter.doctorId = sd; });
    this.fromDate$.pipe(take(1)).subscribe((from: Date) => {
      this.filter.fromDate = this.dateHelper.getStartDateTimeDO(new Date(from));
    });
    this.toDate$.pipe(take(1)).subscribe((to: Date) => {
      this.filter.toDate = this.dateHelper.getEndDateTimeDO(new Date(to));
    });
  }

  loadBookingsClicked() {
    if (this.filter && this.filter.fromDate && this.filter.toDate) {
      if (isBefore(this.dateHelper.getDate(this.filter.fromDate), this.dateHelper.getDate(this.filter.toDate))) {
        this.store.dispatch(new LoadBookingsSubmit({
          filter: this.filter,
          fromDate: this.dateHelper.getDate(this.filter.fromDate),
          toDate: this.dateHelper.getDate(this.filter.toDate),
        }));
        this.onPopupHiding();
      } else {
        this.store.dispatch(new SetError({ errorMessages: ['From Date must be before To Date'] }));
      }
    } else {
      this.store.dispatch(new SetError({ errorMessages: ['One or more filter values are invalid'] }));
    }
  }

  onPopupHiding() {
    this.popupClosed.emit();
    setTimeout(() => {
      this.resetFilters();
    }, 100);
  }
}
