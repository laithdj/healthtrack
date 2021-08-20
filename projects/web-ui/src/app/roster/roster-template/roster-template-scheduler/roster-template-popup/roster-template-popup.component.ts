import { Component, OnDestroy } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, take, map } from 'rxjs/operators';
import * as _ from 'lodash';
import { RosterService } from '../../../roster.service';
import {
  RosterTemplateDO,
  LocationRoomDO,
  StaffDO,
  SessionDO,
  DoctorDO,
} from '../../../../../../../../Generated/CoreAPIClient';
import { RosterPopup } from '../../../../shared/models/RosterPopup';

@Component({
  selector: 'app-roster-template-popup',
  templateUrl: './roster-template-popup.component.html',
  styleUrls: ['./roster-template-popup.component.css'],
})
export class RosterTemplatePopupComponent implements OnDestroy {
  private _destroyed$ = new Subject<void>();

  editTemplate: RosterTemplateDO;
  rosterPopup$ = this.rosterService.getRosterPopup();
  staff$ = combineLatest(this.rosterPopup$, this.rosterService.getStaff()).pipe(map(([rosterPopup, staff]) => {
    if (rosterPopup.rosterTemplate && rosterPopup.rosterTemplate.roleId && rosterPopup.rosterTemplate.roleId > 0) {
      return staff.filter((sm) => sm.staffRoles && sm.staffRoles.some(
        (r) => r.roleId === rosterPopup.rosterTemplate.roleId));
    } return staff;
  }));
  availableStaff: StaffDO[];
  doctors$ = this.rosterService.getDoctors();
  locationRooms$ = this.rosterService.getLocationRooms();
  sessions$ = this.rosterService.getSessions();
  selectedSet$ = this.rosterService.getSelectedTemplateSet();
  popupTitle = 'Edit Template';
  currentDate$ = this.rosterService.getSchedulerCurrentDate();
  templates$ = this.rosterService.getTemplates();
  selectedLR: LocationRoomDO;
  selectedSession: SessionDO;
  customStart = new Date(2019, 6, 1, 9);
  customEnd = new Date(2019, 6, 1, 17);
  daysInWeek = [1, 2, 3, 4, 5, 6, 0];
  selectedDays = [];
  cycleLength: number;

  constructor(private rosterService: RosterService) {
    this.selectedSet$.pipe(takeUntil(this._destroyed$)).subscribe((set) => {
      this.cycleLength = set.cycleLength;
      this.clearSelectedDays();
    });

    this.rosterPopup$.pipe(takeUntil(this._destroyed$)).subscribe((rp) => {
      if (rp.rosterTemplate) {
        this.popupTitle = 'Edit Template';
        this.editTemplate = _.cloneDeep(rp.rosterTemplate);

        if (rp.rosterTemplate.sessionId === 0) {
          this.customStart = new Date(rp.rosterTemplate.trueStartDate);
          this.customEnd = new Date(rp.rosterTemplate.trueEndDate);
        } else {
          this.customStart = new Date(2019, 6, 1, 9);
          this.customEnd = new Date(2019, 6, 1, 17);
        }

        const day = rp.rosterTemplate.trueStartDate.getDay();
        const date = rp.rosterTemplate.trueStartDate.getDate();
        this.clearSelectedDays();
        if (date < 7) { this.selectedDays[0][day] = true; }
        if (date >= 7 && date < 14) { this.selectedDays[1][day] = true; }
        if (date >= 14 && date < 21) { this.selectedDays[2][day] = true; }
        if (date >= 21) { this.selectedDays[3][day] = true; }
      } else {
        this.popupTitle = 'Add Template(s)';
        const template = new RosterTemplateDO();
        template.deleted = false;
        this.editTemplate = template;
      }

      this.getSelectedLR();
      this.getAvailableStaff();
      this.getSelectedSession();
    });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  getDayOfWeek(day: number) {
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

  clearSelectedDays() {
    this.selectedDays = [[false, false, false, false, false, false, false]];
    if (this.cycleLength >= 14) { this.selectedDays.push([false, false, false, false, false, false, false]); }
    if (this.cycleLength >= 21) { this.selectedDays.push([false, false, false, false, false, false, false]); }
    if (this.cycleLength >= 28) { this.selectedDays.push([false, false, false, false, false, false, false]); }
  }

  onPopupHiding() {
    const rp = new RosterPopup(false);
    this.rosterService.rosterPopupChanged(rp);
  }

  getSelectedLR() {
    if (this.editTemplate.locationId > 0) {
      this.locationRooms$.pipe(take(1)).subscribe((lrs) => {
        this.selectedLR = lrs.find((lr) => lr.locationId === this.editTemplate.locationId
          && lr.roomId === this.editTemplate.roomId);
      });
    }
  }

  getAvailableStaff() {
    if (!this.editTemplate.isDoctor && this.editTemplate.roleId) {
      this.staff$.pipe(take(1)).subscribe((staff) => {
        this.availableStaff = (this.editTemplate.roleId > 0) ? staff.filter(
          (s) => s.staffRoles.some((r) => r.roleId === this.editTemplate.roleId)) : staff;
      });
    }
  }

  getSelectedSession() {
    this.sessions$.pipe(take(1)).subscribe((sessions) => {
      this.selectedSession = sessions.find((s) => s.sessionId === this.editTemplate.sessionId);
    });
  }

  onLocationRoomChanged() {
    this.editTemplate.locationId = this.selectedLR.locationId;
    this.editTemplate.roomId = this.selectedLR.roomId;
    this.editTemplate.edited = true;
  }

  onSessionChanged() {
    this.editTemplate.sessionId = this.selectedSession.sessionId;

    const start = new Date(this.editTemplate.trueStartDate);
    start.setHours(this.selectedSession.startHour);
    start.setMinutes(this.selectedSession.startMinutes);
    this.editTemplate.startDate = new Date(start);
    this.editTemplate.trueStartDate = new Date(start);

    const end = new Date(this.editTemplate.trueEndDate);
    end.setHours(this.selectedSession.endHour);
    end.setMinutes(this.selectedSession.endMinutes);
    this.editTemplate.endDate = new Date(end);
    this.editTemplate.trueEndDate = new Date(end);

    this.editTemplate.edited = true;
  }

  selectedDayChanged(week: number, day: number) {
    this.clearSelectedDays();
    this.selectedDays[week - 1][day] = true;

    if (day === 0) { day = 7; }
    const date = day + ((week - 1) * 7);
    this.editTemplate.startDate.setDate(date);
    this.editTemplate.endDate.setDate(date);
    this.editTemplate.trueStartDate.setDate(date);
    this.editTemplate.trueEndDate.setDate(date);
    this.editTemplate.edited = true;
  }

  customStartChanged() {
    this.editTemplate.startDate.setHours(this.customStart.getHours());
    this.editTemplate.startDate.setMinutes(this.customStart.getMinutes());
    this.editTemplate.trueStartDate.setHours(this.customStart.getHours());
    this.editTemplate.trueStartDate.setMinutes(this.customStart.getMinutes());
  }

  customEndChanged() {
    this.editTemplate.endDate.setHours(this.customEnd.getHours());
    this.editTemplate.endDate.setMinutes(this.customEnd.getMinutes());
    this.editTemplate.trueEndDate.setHours(this.customEnd.getHours());
    this.editTemplate.trueEndDate.setMinutes(this.customEnd.getMinutes());
  }

  onStaffChanged() {
    let staff: StaffDO[];
    this.staff$.pipe(take(1)).subscribe((s) => { staff = s; });

    if (this.editTemplate && !this.editTemplate.isDoctor && this.editTemplate.staffId && staff) {
      const index = staff.findIndex((s: StaffDO) => s.staffId === this.editTemplate.staffId);
      if (index >= 0) {
        this.editTemplate.staffName = staff[index].staffName;
        this.editTemplate.edited = true;
      }
    }
  }

  onDoctorChanged() {
    let doctors: DoctorDO[];
    this.doctors$.pipe(take(1)).subscribe((d) => { doctors = d; });

    if (this.editTemplate && this.editTemplate.isDoctor && this.editTemplate.doctorId && doctors) {
      const index = doctors.findIndex((d: DoctorDO) => d.doctorId === this.editTemplate.doctorId);
      if (index >= 0) {
        this.editTemplate.staffName = doctors[index].doctorName;
        this.editTemplate.edited = true;
      }
    }
  }

  onApplyChanges() {
    this.templates$.pipe(take(1)).subscribe((templates) => {
      const isValid = this.rosterService.isValidTemplateEdit(templates, this.editTemplate);
      if (isValid === true) {
        this.rosterService.templateChanged(this.editTemplate);
        const rp = new RosterPopup(false);
        this.rosterService.rosterPopupChanged(rp);
      }
    });
  }
}
