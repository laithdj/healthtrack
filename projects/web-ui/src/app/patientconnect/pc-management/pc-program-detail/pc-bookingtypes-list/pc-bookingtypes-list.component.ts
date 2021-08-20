import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { DxListComponent } from 'devextreme-angular';
import {
  ProgramDO,
  SelectedBookingTypeDO,
  ProgramTypeDO,
  BookingToCompleteType,
  ProgramType,
} from '../../../../../../../../Generated/CoreAPIClient';
import { bookingTypeSort } from '../../pc-management-utils';

@Component({
  selector: 'app-pc-bookingtypes-list',
  templateUrl: './pc-bookingtypes-list.component.html',
  styleUrls: ['./pc-bookingtypes-list.component.css'],
})
export class PcBookingtypesListComponent implements OnInit, OnChanges {
  @ViewChild('bookingTypesListRef') bookingTypesList: DxListComponent;

  @Input() selectedProgramDO: ProgramDO;
  @Input() bookingTypes: SelectedBookingTypeDO[] | null;
  @Input() programTypes: ProgramTypeDO[] | null;
  @Input() editMode: boolean;

  @Output() selectedProgramDOChange = new EventEmitter<ProgramDO>();

  selectedBookingTypes: string[];
  sortedBookingTypes: SelectedBookingTypeDO[] = [];
  numberOfColumns: number;
  columnsLength = 10;
  columnsWidth: number;
  sortedBookingTypesColumns = [];
  popupSelectBookingTypes = false;
  atLeastOneBookingTypeMode = false;
  selectedBookingTypesCachedOnPopup = [];
  hint: string;
  programType = ProgramType;

  readonly selectedBookingToComplete = BookingToCompleteType.Selected;

  bookingToCompleteList = [
    { id: BookingToCompleteType.Any, option: 'Any Booking Type' },
    { id: BookingToCompleteType.Selected, option: 'Selected Booking Types' },
  ];

  bookingToCompleteListWithIgnore = [
    { id: BookingToCompleteType.Ignore, option: 'Ignore Booking Types' },
    ...this.bookingToCompleteList,
  ];

  constructor() { }

  ngOnInit() {
    this.setBookingTypes(this.bookingTypes, this.selectedProgramDO.bookingTypes);
    this.hint = this.selectedBookingTypes.join(', ');
  }

  ngOnChanges() {
    this.setBookingTypes(this.bookingTypes, this.selectedProgramDO.bookingTypes);
    this.hint = this.selectedBookingTypes.join(', ');
  }

  getTypeName(typeNumber: number) {
    const typeName = this.programTypes.filter((pt) => pt.id === typeNumber);
    return typeName.length === 1 ? typeName[0].typeName : 'unknown';
  }

  onSelectAllBookingTypes(e) {
    if (e && e.event) {
      e.event.stopPropagation();
      const sortedFlattened = this.sortedBookingTypesColumns.map((col) => col.columnData).flat();
      sortedFlattened.map((bt) => {
        bt.selected = true;
        return bt;
      });
      this.selectedBookingTypes = sortedFlattened.filter((bt) => bt.selected).map((bt) => bt.bookingType);
      this.hint = this.selectedBookingTypes.join(', ');
    }
  }

  onClearAllBookingTypes(e) {
    if (e && e.event) {
      e.event.stopPropagation();
      const sortedFlattened = this.sortedBookingTypesColumns.map((col) => col.columnData).flat();
      sortedFlattened.map((bt) => {
        bt.selected = false;
        return bt;
      });
      this.selectedBookingTypes = sortedFlattened.filter((bt) => bt.selected).map((bt) => bt.bookingType);
      this.hint = this.selectedBookingTypes.join(', ');
    }
  }

  onBookingTypeChecked(e: any) {
    if (e?.removedItems?.length === 1) {
      const idx = this.selectedBookingTypes?.findIndex((a) => a === e.removedItems[0].bookingType);
      if (idx > -1) {
        this.selectedBookingTypes.splice(idx, 1);
      }

      this.hint = this.selectedBookingTypes.join(', ');
    }

    if (e?.addedItems?.length === 1 && this.selectedBookingTypes
      !== e.addedItems.map((b) => b.bookingType)) {
      this.selectedBookingTypes.push(e.addedItems[0].bookingType);
      this.hint = this.selectedBookingTypes.join(', ');
    }
  }

  onSelectBookingTypesOK() {
    this.popupSelectBookingTypes = false;

    const flatList = this.sortedBookingTypesColumns?.map((col) => col.columnData).flat();
    flatList?.forEach((bookingType: SelectedBookingTypeDO) => {
      bookingType.selected = this.selectedBookingTypes?.some((a) => a === bookingType.bookingType);
    });

    this.selectedBookingTypes = flatList?.filter((a) => a.selected).map((b) => b.bookingType);
    this.hint = this.selectedBookingTypes?.join(', ');
    this.selectedProgramDO.bookingTypes = flatList?.filter(((a) => a.selected));

    this.selectedProgramDOChange.emit(this.selectedProgramDO);
  }

  onSelectBookingTypesCancel() {
    this.popupSelectBookingTypes = false;
    this.selectedBookingTypes = this.selectedBookingTypesCachedOnPopup.concat();
    this.hint = this.selectedBookingTypes.join(', ');
  }

  cacheBookingTypesOnPopup() {
    this.selectedBookingTypesCachedOnPopup = this.selectedBookingTypes.concat();
  }

  createBookingTypeColumns(numberOfColumns: number, columnsLength: number, sortedBookingTypes) {
    const sortedBookingTypesColumns = [];
    for (let i = 0; i < numberOfColumns; i++) {
      sortedBookingTypesColumns[i] = {
        columnData: sortedBookingTypes.slice(i * columnsLength, i * columnsLength + columnsLength),
      };
    }
    return sortedBookingTypesColumns;
  }

  // bookingTypes = allBookingTypes
  // programBookingTypes (on saved programs being loaded)
  // - saved programs may have only the selected = true programs listed
  // - newly saved may list all true/false selected programs
  setBookingTypes(bookingTypes: SelectedBookingTypeDO[] | null, programBookingTypes: SelectedBookingTypeDO[] | null) {
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
        this.selectedBookingTypes = programBookingTypes.map((a) => a.bookingType);
      } else {
        this.selectedBookingTypes = [];
      }
    }
  }

  onClickSelectBookingTypes() {
    this.cacheBookingTypesOnPopup();
    this.popupSelectBookingTypes = true;
  }
}
