import { Component, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { take, takeUntil, map } from 'rxjs/operators';
import { addWeeks, addDays } from 'date-fns';
import { Subject, combineLatest } from 'rxjs';
import { confirm } from 'devextreme/ui/dialog';
import { Store } from '@ngrx/store';
import { SessionDO, BookingRoleDO, StaffDO } from '../../../../../../Generated/CoreAPIClient';
import { RosterService } from '../roster.service';
import { AppState } from '../../app-store/reducers';
import { SetError } from '../../app-store/app-ui-state.actions';

@Component({
  selector: 'app-roster-template',
  templateUrl: './roster-template.component.html',
  styleUrls: ['./roster-template.component.css'],
})
export class RosterTemplateComponent implements OnDestroy {
  private _destroyed$ = new Subject<void>();

  loading$ = this.rosterService.getLoading();
  templateSets$ = this.rosterService.getTemplateSets();
  bookingRoles$ = this.rosterService.getBookingRoles();
  bookingRoles: BookingRoleDO[];
  daysInWeek = [1, 2, 3, 4, 5, 6, 0];
  cycleOptions = [7, 14, 21, 28];
  selectedCycleOption = this.cycleOptions[0];
  newTemplateSetName = 'New Roster Template Set';
  currentDate$ = this.rosterService.getSchedulerCurrentDate();
  selectedDay$ = this.rosterService.getSelectedDay();
  selectedWeek$ = this.rosterService.getSelectedWeek();
  locationRooms$ = this.rosterService.getLocationRooms();
  selectedLocationRoom$ = this.rosterService.getSelectedLocationRoom();
  locationRoomsFiltered$ = this.rosterService.getLocationRooms();
  durationOptions = [15, 30, 60];
  selectedDurationOption = this.durationOptions[1];
  schedulerOptions = ['Day', 'Week', 'Cycle'];
  selectedSchedulerOption = this.schedulerOptions[0];
  viewOptions = ['Location/Room', 'Doctor/Staff'];
  selectedView = this.viewOptions[0];
  dsViewOptions = ['Doctors', 'Staff'];
  selectedDSOption = this.dsViewOptions[0];
  selectedBookingRole$ = this.rosterService.getSelectedBookingRole();
  schedulerView$ = this.rosterService.getSchedulerView();
  selectedView$ = this.rosterService.getSelectedView();
  doctors$ = combineLatest(this.rosterService.getDoctors(), this.selectedLocationRoom$).pipe(
    map(([drs, selectedLocationRoom]) => drs.filter((dr) => !dr.defaultLocation || dr.defaultLocation === 0
    || dr.defaultLocation === selectedLocationRoom.locationId)));
  staff$ = this.rosterService.getStaff();
  selectedDoctor = this.rosterService.selectedDoctor;
  selectedStaff1 = this.rosterService.selectedStaff1;
  staff1List$ = combineLatest(this.staff$, this.bookingRoles$, this.selectedLocationRoom$).pipe(
    map(([staff, bookingRoles, selectedLR]) => this.filterStaffByBookingRole(staff,
      bookingRoles, 1, selectedLR.locationId)));
  selectedStaff2 = this.rosterService.selectedStaff2;
  staff2List$ = combineLatest(this.staff$, this.bookingRoles$, this.selectedLocationRoom$).pipe(
    map(([staff, bookingRoles, selectedLR]) => this.filterStaffByBookingRole(staff,
      bookingRoles, 2, selectedLR.locationId)));
  selectedStaff3 = this.rosterService.selectedStaff3;
  staff3List$ = combineLatest(this.staff$, this.bookingRoles$, this.selectedLocationRoom$).pipe(
    map(([staff, bookingRoles, selectedLR]) => this.filterStaffByBookingRole(staff,
      bookingRoles, 3, selectedLR.locationId)));
  selectedStaff4 = this.rosterService.selectedStaff4;
  staff4List$ = combineLatest(this.staff$, this.bookingRoles$, this.selectedLocationRoom$).pipe(
    map(([staff, bookingRoles, selectedLR]) => this.filterStaffByBookingRole(staff,
      bookingRoles, 4, selectedLR.locationId)));
  selectedSession: SessionDO;
  sessions$ = this.rosterService.getSessions();
  selectedSet$ = this.rosterService.getSelectedTemplateSet();
  customStart = new Date(2019, 6, 1, 9, 0);
  customEnd = new Date(2019, 6, 1, 17, 0);

  constructor(private rosterService: RosterService,
    private title: Title,
    private store: Store<AppState>) {
    this.title.setTitle('Roster Template Management');

    this.selectedView$.pipe(takeUntil(this._destroyed$)).subscribe((sv) => { this.selectedView = sv; });
    this.schedulerView$.pipe(takeUntil(this._destroyed$)).subscribe((sch) => { this.selectedSchedulerOption = sch; });
    this.bookingRoles$.pipe(takeUntil(this._destroyed$)).subscribe((brs) => { this.bookingRoles = brs; });
    this.rosterService.getDSView().pipe(takeUntil(this._destroyed$))
      .subscribe((view) => { this.selectedDSOption = view; });
    this.rosterService.getSchedulerCellDuration().pipe(takeUntil(this._destroyed$))
      .subscribe((cd) => { this.selectedDurationOption = cd; });

    // when selected set is changed, reset selected session to the first session
    combineLatest(this.selectedSet$, this.sessions$).pipe(takeUntil(this._destroyed$))
      .subscribe(([, sessions]) => {
        const start = 0;
        if (sessions && sessions.length > start) {
          this.selectedSession = sessions[start];
          this.onSessionChanged({ value: sessions[start] });
        }
      });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  filterStaffByBookingRole(staff: StaffDO[], bookingRoles: BookingRoleDO[],
    staffNumber: number, locationId: number): StaffDO[] {
    const bookingRole: BookingRoleDO = bookingRoles.find((br) => br.staffNumber === staffNumber);
    staff = staff.filter((s) => s.staffRoles.some((r) => r.defaultLocation === 0 || r.defaultLocation === locationId));
    if (bookingRole) {
      return (bookingRole.roleId === -1) ? staff : staff.filter((sm) => sm.staffRoles
        .some((r) => r.roleId === bookingRole.roleId && (r.defaultLocation === 0 || r.defaultLocation === locationId)));
    }
    return [];
  }

  getStaffPlaceholder(staffNumber: number): string {
    const role = this.bookingRoles.find((r) => r.staffNumber === staffNumber);

    if (role && role.roleId >= 0) {
      return (role.displayName.match('^[aieouAIEOU].*')) ? `Select an ${role.displayName}...`
        : `Select a ${role.displayName}...`;
    }
    return 'Select a Staff Member...';
  }

  onSelectedDoctorChanged() { this.rosterService.selectedDoctor = this.selectedDoctor; }

  onSelectedStaffChanged(staffNumber: number) {
    switch (staffNumber) {
      case 1: {
        this.rosterService.selectedStaff1 = this.selectedStaff1;
        break;
      }
      case 2: {
        this.rosterService.selectedStaff2 = this.selectedStaff2;
        break;
      }
      case 3: {
        this.rosterService.selectedStaff3 = this.selectedStaff3;
        break;
      }
      case 4: {
        this.rosterService.selectedStaff4 = this.selectedStaff4;
        break;
      }
      default:
        break;
    }
  }

  onSelectedBookingRoleChanged(e: any) {
    if (e.value) { this.rosterService.selectedBookingRoleChanged(e.value); }
  }

  onLocationRoomChanged(e: any) {
    if (e.value) { this.rosterService.selectedLocationRoomChanged(e.value); }
  }

  onDurationChanged = (e: any) => {
    if (e.value) { this.rosterService.schedulerCellDurationChanged(e.value); }
  }

  onSchedulerViewChanged = (e: any) => {
    if (e.value) { this.rosterService.schedulerViewChanged(e.value); }
  }

  onSelectedViewChanged = (e: any) => {
    if (e.value) { this.rosterService.selectedViewChanged(e.value); }
  }

  onDSViewChanged(e: any) {
    if (e.value) { this.rosterService.selectedDSViewChanged(e.value); }
  }

  customStartChanged(e: any) {
    this.rosterService.templateStart = new Date(2019, 6, this.rosterService.templateStart.getDate(),
      e.value.getHours(), e.value.getMinutes());
    this.rosterService.customStart = new Date(2019, 6, this.rosterService.templateStart.getDate(),
      e.value.getHours(), e.value.getMinutes());
  }

  customEndChanged(e: any) {
    this.rosterService.templateEnd = new Date(2019, 6, this.rosterService.templateEnd.getDate(),
      e.value.getHours(), e.value.getMinutes());
    this.rosterService.customEnd = new Date(2019, 6, this.rosterService.templateEnd.getDate(),
      e.value.getHours(), e.value.getMinutes());
  }

  onSessionChanged(e: any) {
    let currentDate: Date;
    this.currentDate$.pipe(take(1)).subscribe((cd) => { currentDate = cd; });
    this.rosterService.templateStart = new Date(2019, 6, currentDate.getDate(),
      e.value.startHour, e.value.startMinutes);
    this.rosterService.templateEnd = new Date(2019, 6, currentDate.getDate(),
      e.value.endHour, e.value.endMinutes);
  }

  selectedDayChanged(week: number, day: number) {
    const firstDay = new Date(2019, 6, 1);
    let newDate = firstDay;

    if (week === 1 && day === 1) {
      this.rosterService.schedulerDateChanged(firstDay);
      return;
    }

    if (week > 1) {
      newDate = addWeeks(firstDay, week - 1);
      if (day === 1) {
        this.rosterService.schedulerDateChanged(newDate);
        return;
      }
    }

    if (day === 0) {
      this.rosterService.schedulerDateChanged(addDays(newDate, 6));
    } else {
      this.rosterService.schedulerDateChanged(addDays(newDate, day - 1));
    }
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

  onCycleChanged = (data: any) => {
    this.selectedCycleOption = this.cycleOptions.find((option) => option === data.value);
  }

  saveNewSetClicked() {
    if (this.newTemplateSetName.trim().length > 0) {
      this.rosterService.addNewRosterSet(this.newTemplateSetName, this.selectedCycleOption);
    }
  }

  onSave() { this.rosterService.save(); }

  onUndoChanges() {
    this.selectedSet$.pipe(take(1)).subscribe((set) => {
      if (set) {
        const result = confirm(`This action will discard any unsaved changes to the ${set.templateSetName
        } Set. <br><br> Do you wish to continue?`, 'Undo Changes');
        result.then((dialogResult: boolean) => {
          if (dialogResult) { this.rosterService.fetchTemplates(set.id); }
        });
      } else {
        this.store.dispatch(new SetError({
          errorMessages: ['No set currently selected.<br><br>Please select '
          + 'a set or create a new set to edit templates'],
          title: 'No Set Selected',
        }));
      }
    });
  }

  onDiaryActionsClicked() {
    this.rosterService.getTemplates().pipe(take(1)).subscribe((templates) => {
      if ((this.rosterService.deletedTemplates && this.rosterService.deletedTemplates.length > 0)
        || templates.some((t) => t.edited)) {
        this.store.dispatch(new SetError({
          errorMessages: ['You have unsaved changes to this Template Set<br><br>You must save or undo'
          + ' your changes before you can use any Diary Actions'],
          title: 'Unsaved Changes',
        }));
      } else {
        this.rosterService.showApplyPopupChanged(true);
      }
    });
  }
}
