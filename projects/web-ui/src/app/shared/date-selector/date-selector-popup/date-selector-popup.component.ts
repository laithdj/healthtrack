import { Component, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-date-selector-popup',
  templateUrl: './date-selector-popup.component.html',
  styleUrls: ['./date-selector-popup.component.css']
})
export class DateSelectorPopupComponent {
  private _fromDate: Date;
  private _toDate: Date;

  @Input() showPopup = false;

  @Input() set fromDate (from: Date) {
    this._fromDate = _.cloneDeep(from);
    this.editFromDate = _.cloneDeep(from);
  }
  get fromDate(): Date {
    return this._fromDate;
  }

  @Input() set toDate (to: Date) {
    this._toDate = _.cloneDeep(to);
    this.editToDate = _.cloneDeep(to);
  }
  get toDate(): Date {
    return this._toDate;
  }

  @Output() popupClosed: EventEmitter<void> = new EventEmitter();
  @Output() dateRangeSelected = new EventEmitter<{ fromDate: Date, toDate: Date }>();

  editFromDate: Date;
  editToDate: Date;

  constructor() { }

  onDateRangeSelected(e: any) {
    this.editFromDate = new Date(e.fromDate);
    this.editToDate = new Date(e.toDate);
  }

  onSelectClicked() {
    this.dateRangeSelected.emit({ fromDate: this.editFromDate,  toDate: this.editToDate });
  }

  onPopupHiding() {
    this.popupClosed.emit();
    setTimeout(() => {
      this.editFromDate = _.cloneDeep(this.fromDate);
      this.editToDate = _.cloneDeep(this.toDate);
    }, 200);

  }
}
