import {
  Component, Input, Output, EventEmitter,
} from '@angular/core';
import * as _ from 'lodash';
import {
  SelectedBookingTypeDO, PCProgramsClient,
  APIResponseOfIEnumerableOfSelectedBookingTypeDO,
} from '../../../../../../../../../Generated/CoreAPIClient';
import { bookingTypeSort } from '../../../../pc-management/pc-management-utils';

@Component({
  selector: 'app-select-booking-types',
  templateUrl: './select-booking-types.component.html',
  styleUrls: ['./select-booking-types.component.css'],
})
export class SelectBookingTypesComponent {
  private _currentpbts: string;
  private _newpbts: string;

  @Input() showPopup: boolean;
  @Input() set programBookingTypes(pbts: string) {
    this._currentpbts = pbts;
    this._newpbts = _.cloneDeep(pbts);
    this.setBookingTypes(this.bookingTypes, this._newpbts);
  }
  get programBookingTypes(): string {
    return this._newpbts;
  }
  @Output() bookingTypesUpdated = new EventEmitter<SelectedBookingTypeDO[]>();
  @Output() popupClosed = new EventEmitter<boolean>();

  numberOfColumns: number;
  columnsLength = 10;
  columnsWidth: number;
  sortedBookingTypesColumns = [];
  sortedBookingTypes: SelectedBookingTypeDO[] = [];
  selectedBookingTypes: string[];
  selectedBookingTypesCachedOnPopup = [];
  bookingTypes: SelectedBookingTypeDO[];

  constructor(private pcProgramsClient: PCProgramsClient) {
    this.pcProgramsClient.getBookingTypes().subscribe(
      (response: APIResponseOfIEnumerableOfSelectedBookingTypeDO) => {
        this.bookingTypes = response.data;
        this._currentpbts = this.programBookingTypes;
        this._newpbts = _.cloneDeep(this.programBookingTypes);
        this.setBookingTypes(this.bookingTypes, this._newpbts);
      });
  }

  onHidePopup() {
    this.programBookingTypes = this._currentpbts;
    this.popupClosed.emit(true);
  }

  setBookingTypes(bookingTypes: SelectedBookingTypeDO[] | null, programBookingTypes: string) {
    this.sortedBookingTypes = [];
    this.selectedBookingTypes = [];
    this.sortedBookingTypesColumns = [];
    if (bookingTypes) {
      this.sortedBookingTypes = bookingTypes.sort(bookingTypeSort);
      this.numberOfColumns = Math.ceil(this.sortedBookingTypes.length / this.columnsLength);
      this.columnsWidth = this.numberOfColumns * 240 > 1000 ? 1000 : this.numberOfColumns * 240;
      this.sortedBookingTypesColumns = this.createBookingTypeColumns(this.numberOfColumns,
        this.columnsLength, this.sortedBookingTypes);
      if (programBookingTypes) {
        const sbtcFlattened = this.sortedBookingTypesColumns.map((col) => col.columnData).flat();

        sbtcFlattened.map((bt) => {
          const matchedBt = programBookingTypes.split(',').find((pbt) => pbt === bt.bookingType);
          if (matchedBt) {
            this.selectedBookingTypes = this.selectedBookingTypes.concat(matchedBt);
            bt.selected = true;
            return bt;
          }
          bt.selected = false;
          return bt;
        });
      }
    }
  }

  createBookingTypeColumns(numberOfColumns: number, columnsLength: number,
    sortedBookingTypes: SelectedBookingTypeDO[]) {
    const sortedBookingTypesColumns = [];

    for (let i = 0; i < numberOfColumns; i++) {
      sortedBookingTypesColumns[i] = {
        columnData: sortedBookingTypes.slice(i * columnsLength, i * columnsLength + columnsLength),
      };
    }

    return sortedBookingTypesColumns;
  }

  onSelectBookingTypes() {
    this.cacheBookingTypesOnPopup();
  }

  onSelectBookingTypesOK() {
    this.bookingTypesUpdated.emit(this.sortedBookingTypes.filter(
      (bt) => this.selectedBookingTypes.some((sbt) => sbt === bt.bookingType)));
    this.popupClosed.emit(true);
  }

  onSelectBookingTypesCancel() {
    this.selectedBookingTypes = this.selectedBookingTypesCachedOnPopup.concat();
    this.popupClosed.emit(true);
  }

  cacheBookingTypesOnPopup() {
    this.selectedBookingTypesCachedOnPopup = this.selectedBookingTypes.concat();
  }

  onClearAllBookingTypes() {
    this.selectedBookingTypes = [];
  }

  onSelectAllBookingTypes() {
    this.selectedBookingTypes = this.sortedBookingTypes.map((bt) => bt.bookingType);
  }

  onBookingTypeChecked(e: any) {
    if (e.removedItems && e.removedItems.length === 1) {
      const index = this.selectedBookingTypes.findIndex((bt) => bt === e.removedItems[0].bookingType);
      if (index >= 0) {
        this.selectedBookingTypes.splice(index, 1);
      }
    }

    if (e.addedItems && e.addedItems.length === 1) {
      if (this.selectedBookingTypes.findIndex((bt) => bt === e.addedItems[0].bookingType) === -1) {
        this.selectedBookingTypes.push(e.addedItems[0].bookingType);
      }
    }
  }
}
