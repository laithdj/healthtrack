import { Component, OnDestroy } from '@angular/core';
import { EquipmentRosteringService } from '../equipment-rostering.service';
import { EquipmentRosterDO, LocationRoomDO } from '../../../../../../Generated/CoreAPIClient';
import { takeUntil } from 'rxjs/operators';
import { Subject, combineLatest } from 'rxjs';
import * as _ from 'lodash';
import { isAfter, isBefore } from 'date-fns';
import { AppState } from '../../app-store/reducers';
import { Store } from '@ngrx/store';
import { SetError } from '../../app-store/app-ui-state.actions';
import { confirm } from 'devextreme/ui/dialog';

@Component({
  selector: 'app-edit-equipment-roster-popup',
  templateUrl: './edit-equipment-roster-popup.component.html',
  styleUrls: ['./edit-equipment-roster-popup.component.css']
})
export class EditEquipmentRosterPopupComponent implements OnDestroy {
  private _destroyed$ = new Subject<void>();

  equipmentRosteringPopup$ = this.equipmentRosteringService.getEquipmentRosteringPopup();
  locationRooms$ = this.equipmentRosteringService.getLocationRooms();
  selectedLocationRoom$ = this.equipmentRosteringService.getSelectedLocationRoom();
  equipmentRoster: EquipmentRosterDO;
  selectedLocationRoom: LocationRoomDO;
  radioOptions = [ 'Keep in Room', 'Remove at' ];
  selectedRadioOption = this.radioOptions[0];
  removeAtDate: Date;
  isNew = false;
  availableResources$ = this.equipmentRosteringService.getAvailableResources();

  constructor(private equipmentRosteringService: EquipmentRosteringService,
    private store: Store<AppState>) {
    const removeDate = new Date();
    removeDate.setHours(23, 59, 59);
    this.removeAtDate = removeDate;

    combineLatest(this.equipmentRosteringPopup$, this.selectedLocationRoom$, this.locationRooms$)
      .pipe(takeUntil(this._destroyed$)).subscribe(([ erPopup, selectedLR, locationRooms ]) => {
      if (erPopup && erPopup.equipmentRoster) {
        this.equipmentRoster = _.cloneDeep(erPopup.equipmentRoster);
        this.isNew = this.equipmentRoster.equipmentRosterId === 0;

        this.equipmentRosteringService.fetchAvailableResources(this.equipmentRoster.startDate);

        if (this.equipmentRoster.endDate && this.equipmentRoster.endDate.getFullYear() < 9999) {
          this.removeAtDate = this.equipmentRoster.endDate;
          this.selectedRadioOption = this.radioOptions[1];
        } else {
          this.removeAtDate = undefined;
          this.selectedRadioOption = this.radioOptions[0];
        }

        if (this.equipmentRoster && this.equipmentRoster.locationId > 0 && this.equipmentRoster.roomId > 0) {
          const lrIndex = locationRooms.findIndex((lr: LocationRoomDO) => lr.locationId === this.equipmentRoster.locationId
            && lr.roomId === this.equipmentRoster.roomId);
          this.selectedLocationRoom = locationRooms[lrIndex];
        } else {
          const dateFrom = new Date();
          dateFrom.setHours(0, 0, 0, 0);
          this.equipmentRoster.startDate = dateFrom;
          this.equipmentRoster.endDate = undefined;
          this.selectedLocationRoom = selectedLR;
          this.equipmentRoster.locationId = this.selectedLocationRoom.locationId;
          this.equipmentRoster.roomId = this.selectedLocationRoom.roomId;
        }
      }
    });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  onLocationRoomChanged() {
    if (this.selectedLocationRoom) {
      this.equipmentRoster.locationId = this.selectedLocationRoom.locationId;
      this.equipmentRoster.roomId = this.selectedLocationRoom.roomId;
    }
  }

  onDateFromChanged() {
    if (isAfter(this.equipmentRoster.startDate, this.removeAtDate)) {
      this.removeAtDate = new Date(this.equipmentRoster.startDate);
    }
  }

  onDateToChanged() {
    this.equipmentRoster.endDate = this.removeAtDate;
  }

  onRadioOptionChanged() {
    if (this.selectedRadioOption === 'Keep in Room') {
      this.equipmentRoster.endDate = new Date(9999, 11, 31, 23, 59, 59, 59);
    } else {
      this.equipmentRoster.endDate = this.removeAtDate;
    }

    console.log(this.equipmentRoster.endDate);
  }

  saveChangesClicked() {
    let error = false;

    if (!this.equipmentRoster.startDate) {
      this.store.dispatch(new SetError({ errorMessages: [ 'Date From is required' ] }));
      error = true;
    }

    if (!isBefore(this.equipmentRoster.startDate, this.equipmentRoster.endDate)) {
      this.store.dispatch(new SetError({ errorMessages: [ 'Date From must be before Date To' ] }));
      error = true;
    }

    if (!this.equipmentRoster.resourceId || this.equipmentRoster.resourceId <= 0) {
      this.store.dispatch(new SetError({ errorMessages: [ 'Equipment is Required' ] }));
      error = true;
    }

    if (!error) {
      this.equipmentRosteringService.saveEquipmentRoster(this.equipmentRoster);
    }
  }

  onDeleteClicked() {
    const result = confirm('Deleting this roster entry will remove it permanently.<br>Deleted roster' +
    ' entries cannot be recovered.<br><br>Do you wish to continue?', 'Confirm Deletion');

    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.equipmentRosteringService.deleteEquipmentRoster(this.equipmentRoster.equipmentRosterId);
      }
    });
  }

  onPopupHiding() {
    this.equipmentRosteringService.equipmentRosteringPopupChanged(false, this.equipmentRoster);
    this.selectedRadioOption = this.radioOptions[0];
  }
}
