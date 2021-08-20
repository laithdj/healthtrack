import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { EquipmentRosterDO, EquipmentRosteringClient, LocationClient, LocationRoomDO,
  ResourceDO } from '../../../../../Generated/CoreAPIClient';
import { Store, select } from '@ngrx/store';
import { AppState } from '../app-store/reducers';
import { selectUserPkId, selectLastBillingLocation } from '../app-store/app-ui.selectors';
import { take } from 'rxjs/operators';
import { SetError } from '../app-store/app-ui-state.actions';
import { EquipmentRosteringPopup } from '../shared/models/EquipmentRosteringPopup.model';
import notify from 'devextreme/ui/notify';

@Injectable()
export class EquipmentRosteringService {
  userPkId: string;
  lastBillingLocation: number;
  locationRooms: LocationRoomDO[];
  selectedLocationRoom: LocationRoomDO;
  equipmentResources: ResourceDO[];

  private _loading = new BehaviorSubject<boolean>(true);
  private _locationRooms = new BehaviorSubject<LocationRoomDO[]>([]);
  private _selectedLocationRoom = new BehaviorSubject<LocationRoomDO>(undefined);
  private _equipmentResources = new BehaviorSubject<ResourceDO[]>([]);
  private _equipmentRosters = new BehaviorSubject<EquipmentRosterDO[]>([]);
  private _equipmentRosteringPopup = new BehaviorSubject<EquipmentRosteringPopup>(undefined);
  private _availableResources = new BehaviorSubject<ResourceDO[]>([]);

  constructor(private store: Store<AppState>,
    private equipmentRosteringClient: EquipmentRosteringClient,
    private locationClient: LocationClient) {
    this._loading.next(true);
    this.store.pipe(take(1), select(selectUserPkId)).subscribe(upkid => this.userPkId = upkid);
    this.store.pipe(take(1), select(selectLastBillingLocation)).subscribe(lbl => this.lastBillingLocation = lbl);
    this.fetchLocationRooms();
  }

  getLoading(): Observable<boolean> { return this._loading.asObservable(); }
  getLocationRooms(): Observable<LocationRoomDO[]> { return this._locationRooms.asObservable(); }
  getEquipmentResources(): Observable<ResourceDO[]> { return this._equipmentResources.asObservable(); }
  getSelectedLocationRoom(): Observable<LocationRoomDO> { return this._selectedLocationRoom.asObservable(); }
  getEquipmentRosters(): Observable<EquipmentRosterDO[]> { return this._equipmentRosters.asObservable(); }
  getEquipmentRosteringPopup(): Observable<EquipmentRosteringPopup> { return this._equipmentRosteringPopup.asObservable(); }
  getAvailableResources(): Observable<ResourceDO[]> { return this._availableResources.asObservable(); }

  fetchLocationRooms() {
    this.locationClient.getLocationRooms().subscribe(response => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [ response.errorMessage ], title: 'Load Failed' }));
      } else {
        this.locationRooms = response.data;
        this._locationRooms.next(response.data);
        this.selectedLocationRoomChanged(this.getDefaultLocationRoom(), true);
      }

      this._loading.next(false);
    });
  }

  private getDefaultLocationRoom(): LocationRoomDO {
    let locationRoom: LocationRoomDO;

    if (this.locationRooms && this.locationRooms.length > 0) {
      if (this.lastBillingLocation && this.lastBillingLocation > 0) {
        const lrIndex = this.locationRooms.findIndex(locRoom => locRoom.locationId === this.lastBillingLocation);
        if (lrIndex >= 0) {
          locationRoom = this.locationRooms[lrIndex];
        } else {
          locationRoom = this.locationRooms[0];
        }
      } else {
        locationRoom = this.locationRooms[0];
      }
    }

    return locationRoom;
  }

  selectedLocationRoomChanged(locationRoom: LocationRoomDO, forceReload: boolean) {
    this._loading.next(true);

    if (this.selectedLocationRoom && !locationRoom) {
      this._selectedLocationRoom.next(undefined);
      this.selectedLocationRoom = undefined;
      this._equipmentRosters.next([]);
    } else if (forceReload || (!this.selectedLocationRoom && locationRoom) || (locationRoom && this.selectedLocationRoom &&
      locationRoom.locationId !== this.selectedLocationRoom.locationId || locationRoom.roomId !== this.selectedLocationRoom.roomId)) {
        this._selectedLocationRoom.next(locationRoom);
        this.selectedLocationRoom = locationRoom;

        this.equipmentRosteringClient.getEquipmentRosters(locationRoom.locationId, locationRoom.roomId).subscribe(response => {
          if (response.errorMessage && response.errorMessage.trim().length > 0) {
            this.store.dispatch(new SetError({ errorMessages: [ response.errorMessage ], title: 'Load Failed' }));
            this._equipmentRosters.next([]);
          } else {
            this.equipmentResources = response.data.equipmentResources;
            this._equipmentResources.next(response.data.equipmentResources);

            response.data.equipmentRosters.forEach(equipmentRoster => {
              const erIndex = this.equipmentResources.findIndex(er => er.resourceId === equipmentRoster.resourceId);
              equipmentRoster.resourceName = (erIndex >= 0) ? this.equipmentResources[erIndex].resourceName : 'Not Found';
            });

            this._equipmentRosters.next(response.data.equipmentRosters);
          }
        });
    }

    this._loading.next(false);
  }

  equipmentRosteringPopupChanged(showPopup: boolean, equipmentRoster: EquipmentRosterDO) {
    this._equipmentRosteringPopup.pipe(take(1)).subscribe(erPopup => {
      if (!erPopup || erPopup.showPopup !== showPopup) {
        this._equipmentRosteringPopup.next(new EquipmentRosteringPopup(showPopup, equipmentRoster));
      }
    });
  }

  fetchAvailableResources(atDate: Date) {
    this.equipmentRosteringClient.getAvailableEquipmentResources(atDate).subscribe(response => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [ response.errorMessage ], title: 'Load Failed' }));
      } else {
        this._availableResources.next(response.data);
      }
    });
  }

  getNewEquipmentRoster(startDate: Date): EquipmentRosterDO {
    const er = new EquipmentRosterDO();
    er.equipmentRosterId = 0;
    er.allDay = true;
    er.startDate = startDate;
    er.locationId = this.selectedLocationRoom.locationId;
    er.roomId = this.selectedLocationRoom.roomId;
    er.endDate = new Date(9999, 11, 31, 23, 59, 59);

    return er;
  }

  saveEquipmentRoster(equipmentRoster: EquipmentRosterDO) {
    this._loading.next(true);

    equipmentRoster.endDate.setHours(23, 59, 59, 59);
    let equipmentRosters: EquipmentRosterDO[];
    this._equipmentRosters.pipe(take(1)).subscribe(ers => equipmentRosters = ers);

    const index = equipmentRosters.findIndex(r => r.equipmentRosterId === equipmentRoster.equipmentRosterId);

    this.equipmentRosteringClient.saveEquipmentRoster(equipmentRoster, this.userPkId).subscribe(response => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [ response.errorMessage ], title: 'Save Failed' }));
      } else {
        if (index === -1) {
          equipmentRosters.push(response.data.equipmentRoster);
          this._equipmentRosters.next(equipmentRosters);
        } else {
          equipmentRosters.splice(index, 1);
          equipmentRosters.push(response.data.equipmentRoster);
          this._equipmentRosters.next(equipmentRosters);
        }

        const idx = this.equipmentResources.findIndex(r => r.resourceId === response.data.equipmentResource.resourceId);
        if (idx === -1) {
          this.equipmentResources.push(response.data.equipmentResource);
          this._equipmentResources.next(this.equipmentResources);
        }

        this.equipmentRosteringPopupChanged(false, response.data.equipmentRoster);
        notify('Saved Successfully', 'success', 3000);
      }

      this._loading.next(false);
    });
  }

  deleteEquipmentRoster(id: number) {
    if (id && id > 0) {
      this._loading.next(true);
      let equipmentRosters: EquipmentRosterDO[];
      this._equipmentRosters.pipe(take(1)).subscribe(ers => equipmentRosters = ers);

      this.equipmentRosteringClient.deleteEquipmentRoster(id, this.userPkId).subscribe(response => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [ response.errorMessage ], title: 'Save Failed' }));
        } else {
          if (response.data && response.data > 0) {
            const idx = equipmentRosters.findIndex(er => er.equipmentRosterId === response.data);
            equipmentRosters.splice(idx, 1);
            this._equipmentRosters.next(equipmentRosters);
            this.equipmentRosteringPopupChanged(false, undefined);
            notify('Deleted Successfully', 'success', 3000);
          }
        }
        this._loading.next(false);
      });
    }
  }
}
