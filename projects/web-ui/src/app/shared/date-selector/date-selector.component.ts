import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { startOfDay, subDays, endOfDay, addDays, startOfWeek, subWeeks, endOfWeek, addWeeks, startOfMonth, subMonths,
  endOfMonth, addMonths, startOfYear, subYears, endOfYear, addYears, isBefore } from 'date-fns';

@Component({
  selector: 'app-date-selector',
  templateUrl: './date-selector.component.html',
  styleUrls: ['./date-selector.component.css']
})
export class DateSelectorComponent implements OnInit {
  @Output() dateRangeSelected = new EventEmitter<{ fromDate: Date, toDate: Date }>();
  @Input() fromDate: Date;
  @Input() toDate: Date;
  today = new Date();

  constructor() { }

  ngOnInit() {
    // this.onClickThisYear();
  }

  onClickPrevDay() {
    this.fromDate = startOfDay(new Date(subDays(new Date(this.fromDate), 1)));
    this.toDate = endOfDay(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickYesterday() {
    this.fromDate = startOfDay(subDays(new Date(this.today), 1));
    this.toDate = endOfDay(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickToday() {
    this.fromDate = startOfDay(new Date(this.today));
    this.toDate = endOfDay(new Date(this.today));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickNextDay() {
    this.fromDate = startOfDay(addDays(new Date(this.fromDate), 1));
    this.toDate = endOfDay(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickPrevWeek() {
    this.fromDate = startOfWeek(new Date(subWeeks(new Date(this.fromDate), 1)));
    this.toDate = endOfWeek(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickLastWeek() {
    this.fromDate = startOfWeek(new Date(subWeeks(new Date(this.today), 1)));
    this.toDate = endOfWeek(new Date(subWeeks(new Date(this.today), 1)));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickThisWeek() {
    this.fromDate = startOfWeek(new Date(this.today));
    this.toDate = endOfWeek(new Date(this.today));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickNextWeek() {
    this.fromDate = startOfWeek(new Date(addWeeks(new Date(this.fromDate), 1)));
    this.toDate = endOfWeek(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickPrevMonth() {
    this.fromDate = startOfMonth(new Date(subMonths(new Date(this.fromDate), 1)));
    this.toDate = endOfMonth(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickLastMonth() {
    this.fromDate = startOfMonth(new Date(subMonths(new Date(this.today), 1)));
    this.toDate = endOfMonth(new Date(subMonths(new Date(this.today), 1)));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickThisMonth() {
    this.fromDate = startOfMonth(new Date(this.today));
    this.toDate = endOfMonth(new Date(this.today));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickNextMonth() {
    this.fromDate = startOfMonth(new Date(addMonths(new Date(this.fromDate), 1)));
    this.toDate = endOfMonth(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickPrevYear() {
    this.fromDate = startOfYear(new Date(subYears(new Date(this.fromDate), 1)));
    this.toDate = endOfYear(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickLastYear() {
    this.fromDate = startOfYear(new Date(subYears(new Date(this.today), 1)));
    this.toDate = endOfYear(new Date(subYears(new Date(this.today), 1)));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickThisYear() {
    this.fromDate = startOfYear(new Date(this.today));
    this.toDate = endOfYear(new Date(this.today));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickNextYear() {
    this.fromDate = startOfYear(new Date(addYears(new Date(this.fromDate), 1)));
    this.toDate = endOfYear(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickPrevFinYear() {
    this.fromDate = this.startOfFinancialYear(new Date(subYears(new Date(this.fromDate), 1)));
    this.toDate = this.endOfFinancialYear(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickLastFinYear() {
    this.fromDate = subYears(this.startOfFinancialYear(new Date(this.today)), 1);
    this.toDate = subYears(this.endOfFinancialYear(new Date(this.today)), 1);
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickThisFinYear() {
    this.fromDate = this.startOfFinancialYear(new Date(this.today));
    this.toDate = this.endOfFinancialYear(new Date(this.today));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  onClickNextFinYear() {
    this.fromDate = this.startOfFinancialYear(new Date(addYears(new Date(this.fromDate), 1)));
    this.toDate = this.endOfFinancialYear(new Date(this.fromDate));
    this.dateRangeSelected.emit({ fromDate: this.fromDate,  toDate: this.toDate});
  }

  startOfFinancialYear(setDate: Date): Date {
    let result: Date;
    const endOfFinancialYear = endOfMonth(new Date(setDate.getFullYear(), 5));

    if (isBefore(setDate, endOfFinancialYear)) {
      // financial year began in last calendar year
      result = startOfMonth(subYears(new Date(setDate.getFullYear(), 6), 1));
    } else {
      // financial year began this calendar year
      result = startOfMonth(new Date(setDate.getFullYear(), 6));
    }

    return result;
  }

  endOfFinancialYear(setDate: Date): Date {
    let result: Date;

    result = new Date(endOfMonth(subMonths(addYears(new Date(this.startOfFinancialYear(setDate)), 1), 1)));
    return result;
  }
}
