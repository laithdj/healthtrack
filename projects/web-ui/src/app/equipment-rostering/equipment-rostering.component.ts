import { Component, OnDestroy, ViewChild } from '@angular/core';
import { EquipmentRosteringService } from './equipment-rostering.service';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EquipmentRosterDO } from '../../../../../Generated/CoreAPIClient';
import { addYears } from 'date-fns/esm';
import { DxSchedulerComponent } from 'devextreme-angular';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-equipment-rostering',
  templateUrl: './equipment-rostering.component.html',
  styleUrls: ['./equipment-rostering.component.css']
})
export class EquipmentRosteringComponent implements OnDestroy {
  @ViewChild('locationRoomScheduler') locationRoomScheduler: DxSchedulerComponent;

  private _destroyed$ = new Subject<void>();

  loading$ = this.equipmentRosteringService.getLoading();
  locationRooms$ = this.equipmentRosteringService.getLocationRooms();
  selectedLocationRoom$ = this.equipmentRosteringService.getSelectedLocationRoom();
  equipmentResources$ = this.equipmentRosteringService.getEquipmentResources();
  minDate = addYears(new Date(), -1);
  maxDate = addYears(new Date(), 1);
  currentDate = new Date();
  equipmentRosters: EquipmentRosterDO[];
  timeout = null;

  constructor(private equipmentRosteringService: EquipmentRosteringService,
    private titleService: Title) {
    combineLatest(this.equipmentRosteringService.getEquipmentRosters(), this.selectedLocationRoom$).pipe(takeUntil(this._destroyed$))
      .subscribe(([ equipmentRosters, selectedLocationRoom ]) => {
      this.equipmentRosters = equipmentRosters.filter((er: EquipmentRosterDO) => er.locationId &&
        er.locationId === selectedLocationRoom.locationId && er.roomId && er.roomId === selectedLocationRoom.roomId);
    });

    this.titleService.setTitle('Equipment Rostering');
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  onLocationRoomChanged(e: any) {
    this.equipmentRosteringService.selectedLocationRoomChanged(e.value, false);
  }

  stopPropagation(e: any) { e.stopPropagation(); }

  onSchedulerContentReady(e: any) {
    const currentHour = new Date().getHours() - 1;
    e.component.scrollToTime(currentHour, 30, new Date());
  }

  onTooltipEditClicked(e: any, equipmentRoster: EquipmentRosterDO) {
    if (equipmentRoster) {
      this.locationRoomScheduler.instance.hideAppointmentTooltip();
      this.equipmentRosteringService.equipmentRosteringPopupChanged(true, equipmentRoster);
      this.locationRoomScheduler.instance.hideAppointmentTooltip();
    }
    e.event.stopPropagation();
  }

  // hides tooltip if doubleclick, otherwise shows tooltip
  onEquipmentRosterClick(e: any) {
    e.cancel = true;
    if (e.component.__tooltipTimeout) { clearTimeout(e.component.__tooltipTimeout); }
    e.component.__tooltipTimeout = setTimeout(() => {
      e.component.showAppointmentTooltip(e.appointmentData, e.appointmentElement);
    }, 500);
  }

  onEquipmentRosterDblClick(e: any) {
    e.cancel = true;
    if (e.component.__tooltipTimeout) {
      clearTimeout(e.component.__tooltipTimeout);
    }
    if (e.appointmentData) {
      this.equipmentRosteringService.equipmentRosteringPopupChanged(true, e.appointmentData);
      this.locationRoomScheduler.instance.hideAppointmentTooltip();
    }
  }

  onCellClick(e: any) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;

      if (e.cellData && e.cellData.startDate) {
        this.equipmentRosteringService.equipmentRosteringPopupChanged(true,
          this.equipmentRosteringService.getNewEquipmentRoster(e.cellData.startDate));
      }
    } else {
      this.timeout = setTimeout(() => { this.timeout = null; }, 400);
    }
  }
}
