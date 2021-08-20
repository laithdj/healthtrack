import { Component, OnDestroy } from '@angular/core';
import {
  startOfWeek, addWeeks, isBefore, addDays, addMonths,
} from 'date-fns';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { confirm } from 'devextreme/ui/dialog';
import { RosterTemplateSetDO } from '../../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../../app-store/app-ui-state.actions';
import { AppState } from '../../../app-store/reducers';
import { RosterService } from '../../roster.service';

@Component({
  selector: 'app-roster-template-apply',
  templateUrl: './roster-template-apply.component.html',
  styleUrls: ['./roster-template-apply.component.css'],
})
export class RosterTemplateApplyComponent implements OnDestroy {
  private _destroyed$ = new Subject<void>();

  showApplyPopup = false;
  selectedSet$ = this.rosterService.getSelectedTemplateSet();
  applyFromDate = new Date();
  applyToDate = new Date();
  deleteFromDate = new Date();
  deleteToDate = new Date();
  cycleLength: number;
  includePublicHolidays = false;
  tabs = ['Apply Templates', 'Delete Templates', 'Delete and Apply Templates'];
  daysInWeek = [1, 2, 3, 4, 5, 6, 0];
  cycleDay = 1;
  cycleWeek = 1;
  templates$ = this.rosterService.getTemplates();

  constructor(private rosterService: RosterService, private store: Store<AppState>) {
    this.rosterService.getShowApplyPopup().pipe(takeUntil(this._destroyed$)).subscribe((show) => {
      if (show) {
        this.resetDates();
      }
      this.showApplyPopup = show;
    });
    this.selectedSet$.pipe(takeUntil(this._destroyed$)).subscribe((set: RosterTemplateSetDO) => {
      if (set) {
        this.cycleLength = set.cycleLength;
        this.resetDates();
      }
    });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  resetDates() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    this.deleteFromDate = new Date(now);
    const delTo = now.setHours(23, 59, 59);
    this.deleteToDate = addMonths(delTo, 1);
    const from = startOfWeek(new Date(), { weekStartsOn: 1 });
    from.setHours(0, 0, 0, 0);
    this.applyFromDate = addWeeks(from, 1);
    const toDate = new Date(this.applyFromDate);
    toDate.setHours(23, 59, 59);
    this.applyToDate = addDays(addWeeks(toDate, (this.cycleLength / 7)), -1);
    this.cycleDay = 1;
    this.cycleWeek = 1;
  }

  onPopupHiding() { this.rosterService.showApplyPopupChanged(false); }

  onCloseClicked() { this.rosterService.showApplyPopupChanged(false); }

  // disableDates(args: any) { return args.view === 'month' && (args.date.getDay() !== this.cycleDay); }

  cycleStartDayChanged(week: number, day: number) {
    this.cycleDay = day;
    this.cycleWeek = week;
    const currentDay = this.applyFromDate.getDay();
    if (currentDay !== this.cycleDay) {
      if (currentDay === 0) {
        this.applyFromDate = addDays(this.applyFromDate, currentDay - 7 + this.cycleDay);
      } else if (day === 0) {
        this.applyFromDate = addDays(this.applyFromDate, 7 - currentDay);
      } else {
        this.applyFromDate = addDays(this.applyFromDate, this.cycleDay - currentDay);
      }
    }
  }

  applyDateChanged() {
    if (this.cycleLength && this.cycleLength > 0) {
      if (isBefore(this.applyToDate, this.applyFromDate)) {
        const to = new Date(this.applyFromDate);
        to.setHours(23, 59, 59);
        this.applyToDate = to;
      }

      this.cycleDay = this.applyFromDate.getDay();
      this.cycleWeek = this.cycleWeek;
    }
  }

  onApplyClicked() {
    // start date must be a monday, minimum date range must be at least one cycle length
    let startDay = 0;
    if (this.cycleDay === 0) { // if sunday
      startDay = (this.cycleWeek > 1) ? 7 + (7 * (this.cycleWeek - 1)) : 7;
    } else {
      startDay = (this.cycleWeek > 1) ? this.cycleDay + (7 * (this.cycleWeek - 1)) : this.cycleDay;
    }

    if (this.applyFromDate && this.applyToDate && this.cycleLength && isBefore(this.applyFromDate, this.applyToDate)) {
      this.applyToDate.setHours(23, 59, 59);
      if (isBefore(this.applyFromDate, new Date())) {
        const result = confirm('You are about to apply templates to dates in the past.<br><br>This may result in '
          + 'entries in the diary for shifts already worked to be changed.<br><br>'
          + '<span style="color: red; font-weight: bold">Deleted roster entries CANNOT BE RECOVERED</span><br><br>'
          + 'Do you wish to continue?', 'Warning');
        result.then((dialogResult) => {
          if (dialogResult === true) {
            this.rosterService.applyTemplates(this.applyFromDate, this.applyToDate,
              this.includePublicHolidays, startDay);
          }
        });
      } else {
        this.rosterService.applyTemplates(this.applyFromDate, this.applyToDate, this.includePublicHolidays, startDay);
      }
    } else {
      this.store.dispatch(new SetError({
        errorMessages: ['From date must be before To date'],
        title: 'Invalid Date Range',
      }));
    }
  }

  deleteDateChanged() {
    if (isBefore(this.deleteToDate, this.deleteFromDate)) {
      const to = new Date(this.deleteFromDate);
      to.setHours(23, 59, 59);
      this.deleteToDate = to;
    }
  }

  onDeleteClicked(deleteAll: boolean) {
    if (this.deleteFromDate && this.deleteToDate && isBefore(this.deleteFromDate, this.deleteToDate)) {
      if (isBefore(this.deleteFromDate, new Date())) {
        const result = confirm('You are about to delete templates to dates in the past.<br><br>'
          + '<span style="color: red; font-weight: bold">Deleted roster entries CANNOT BE RECOVERED</span><br><br>'
          + 'Do you wish to continue?', 'Warning');
        result.then((dialogResult) => {
          if (dialogResult === true) {
            this.rosterService.deleteTemplates(this.deleteFromDate, this.deleteToDate, deleteAll);
          }
        });
      } else {
        this.rosterService.deleteTemplates(this.deleteFromDate, this.deleteToDate, deleteAll);
      }
    } else { this.store.dispatch(new SetError({ errorMessages: ['Invalid Date Range'] })); }
  }

  getDayOfWeek(day: number): string {
    switch (day) {
      case 0: return 'S';
      case 1: return 'M';
      case 2: return 'T';
      case 3: return 'W';
      case 4: return 'T';
      case 5: return 'F';
      case 6: return 'S';
      default: return '';
    }
  }
}
