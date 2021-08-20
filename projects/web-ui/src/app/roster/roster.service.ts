import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { addMinutes, areIntervalsOverlapping, differenceInMinutes } from 'date-fns';
import notify from 'devextreme/ui/notify';
import * as _ from 'lodash';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  APIResponseOfBoolean,
  APIResponseOfRosterBookingDO,
  APIResponseOfRosterTemplateInit,
  BookingRoleDO,
  DoctorDO,
  LocationRoomDO,
  RosterTemplateClient,
  RosterTemplateDO,
  RosterTemplateSetDO,
  RosterTemplatesSaveRequest,
  SessionDO,
  StaffDO,
} from '../../../../../Generated/CoreAPIClient';
import { SetError } from '../app-store/app-ui-state.actions';
import {
  selectLastBillingLocation,
  selectLicenseUserId,
  selectUserName,
  selectUserPkId,
} from '../app-store/app-ui.selectors';
import { AppState } from '../app-store/reducers';
import { RosterPopup } from '../shared/models/RosterPopup';
import { RosterHelpers } from './roster-helpers';

@Injectable()
export class RosterService {
  userPkId: string;
  userName: string;
  licenseUserId: number;
  schedulerStartDate = new Date(2019, 6, 1); // monday july 1st 2019
  currentBillingLocation: number;

  private _loading = new BehaviorSubject<boolean>(true);
  private _rosterPopup = new BehaviorSubject<RosterPopup>(new RosterPopup(false));
  private _templateSets = new BehaviorSubject<RosterTemplateSetDO[]>([]);
  private _selectedTemplateSet = new BehaviorSubject<RosterTemplateSetDO>(null);
  private _templates = new BehaviorSubject<RosterTemplateDO[]>([]);
  private _sessions = new BehaviorSubject<SessionDO[]>([]);
  private _locationRooms = new BehaviorSubject<LocationRoomDO[]>([]);
  private _selectedLocationRoom = new BehaviorSubject<LocationRoomDO>(null);
  private _doctors = new BehaviorSubject<DoctorDO[]>([]);
  private _staff = new BehaviorSubject<StaffDO[]>([]);
  private _bookingRoles = new BehaviorSubject<BookingRoleDO[]>([]);
  private _selectedBookingRole = new BehaviorSubject<BookingRoleDO>(null);
  private _schedulerCellDuration = new BehaviorSubject<number>(30);
  private _schedulerView = new BehaviorSubject<string>('Day');
  private _schedulerCurrentDate = new BehaviorSubject<Date>(new Date(2019, 6, 1));
  private _selectedDay = new BehaviorSubject<number>(1);
  private _selectedWeek = new BehaviorSubject<number>(1);
  private _selectedView = new BehaviorSubject<string>('Location/Room');
  private _dsView = new BehaviorSubject<string>('Doctors');
  private _staffViewDuration = new BehaviorSubject<number>(1440);
  private _showApplyPopup = new BehaviorSubject<boolean>(false);

  selectedDoctor: DoctorDO;
  selectedStaff1: StaffDO;
  selectedStaff2: StaffDO;
  selectedStaff3: StaffDO;
  selectedStaff4: StaffDO;
  templateStart = new Date(2019, 6, 1, 9);
  templateEnd = new Date(2019, 6, 1, 17);
  customStart = new Date(2019, 6, 1, 9);
  customEnd = new Date(2019, 6, 1, 17);
  numSessions = 1;
  readonly editedResource = [{ id: true, color: '#5cb85c' }, { id: false, color: '#337ab7' }];
  newId = 0;
  deletedTemplates: RosterTemplateDO[] = [];
  contextMenuAppointmentData: any;
  contextMenuTargetedAppointmentData: any;

  constructor(private store: Store<AppState>,
    private rosterTemplateClient: RosterTemplateClient,
    private rosterHelper: RosterHelpers) {
    this.store.pipe(take(1), select(selectLastBillingLocation)).subscribe(
      (location) => { this.currentBillingLocation = location; });
    this.store.pipe(take(1), select(selectUserPkId)).subscribe((pkid: string) => { this.userPkId = pkid; });
    this.store.pipe(take(1), select(selectUserName)).subscribe((uName: string) => { this.userName = uName; });
    this.store.pipe(take(1), select(selectLicenseUserId)).subscribe(
      (licUserId: number) => { this.licenseUserId = licUserId; });
    this.initLoad();
  }

  initLoad() {
    this._loading.next(true);
    this.rosterTemplateClient.init().subscribe((response: APIResponseOfRosterTemplateInit) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage], title: 'Load Failed' }));
      } else {
        this.deletedTemplates = [];
        const allSessions = response.data.sessions.concat([this.rosterHelper.getCustomSession()]);
        this.numSessions = allSessions.length;
        this._sessions.next(allSessions);
        this._staffViewDuration.next(1440 / allSessions.length);

        if (response.data.locationRooms && response.data.locationRooms.length > 0) {
          if (this.currentBillingLocation && this.currentBillingLocation > 0) {
            const lrIndex = response.data.locationRooms.findIndex(
              (lr) => lr.locationId === this.currentBillingLocation);
            if (lrIndex === 0 || lrIndex > 0) {
              this._selectedLocationRoom.next(response.data.locationRooms.find(
                (lr) => lr.locationId === this.currentBillingLocation));
            } else {
              this._selectedLocationRoom.next(response.data.locationRooms[0]);
            }
          } else {
            this._selectedLocationRoom.next(response.data.locationRooms[0]);
          }
        }

        this._locationRooms.next(response.data.locationRooms);
        this._doctors.next(response.data.doctors);
        this._staff.next(response.data.staff);
        this._templateSets.next(response.data.templateSets);
        this._bookingRoles.next(response.data.bookingRoles);

        if (response.data.bookingRoles && response.data.bookingRoles.length > 0) {
          this.selectedBookingRoleChanged(response.data.bookingRoles[0]);
        }

        if (response.data.templateSets && response.data.templateSets.length > 0) {
          this.selectedTemplateSetChanged(response.data.templateSets[0], true);
        }

        this._loading.next(false);
      }
    });
  }

  getTemplateSets(): Observable<RosterTemplateSetDO[]> { return this._templateSets.asObservable(); }
  getSelectedTemplateSet(): Observable<RosterTemplateSetDO> { return this._selectedTemplateSet.asObservable(); }
  getLocationRooms(): Observable<LocationRoomDO[]> { return this._locationRooms.asObservable(); }
  getSelectedLocationRoom(): Observable<LocationRoomDO> { return this._selectedLocationRoom.asObservable(); }
  getDoctors(): Observable<DoctorDO[]> { return this._doctors.asObservable(); }
  getBookingRoles(): Observable<BookingRoleDO[]> { return this._bookingRoles.asObservable(); }
  getSelectedBookingRole(): Observable<BookingRoleDO> { return this._selectedBookingRole.asObservable(); }
  getStaff(): Observable<StaffDO[]> { return this._staff.asObservable(); }
  getLoading(): Observable<boolean> { return this._loading.asObservable(); }
  getRosterPopup(): Observable<RosterPopup> { return this._rosterPopup.asObservable(); }
  getTemplates(): Observable<RosterTemplateDO[]> { return this._templates.asObservable(); }
  getSchedulerCellDuration(): Observable<number> { return this._schedulerCellDuration.asObservable(); }
  getSchedulerCurrentDate(): Observable<Date> { return this._schedulerCurrentDate.asObservable(); }
  getSelectedDay(): Observable<number> { return this._selectedDay.asObservable(); }
  getSelectedWeek(): Observable<number> { return this._selectedWeek.asObservable(); }
  getSchedulerView(): Observable<string> { return this._schedulerView.asObservable(); }
  getSelectedView(): Observable<string> { return this._selectedView.asObservable(); }
  getDSView(): Observable<string> { return this._dsView.asObservable(); }
  getStaffViewDuration(): Observable<number> { return this._staffViewDuration.asObservable(); }
  getSessions(): Observable<SessionDO[]> { return this._sessions.asObservable(); }
  getShowApplyPopup(): Observable<boolean> { return this._showApplyPopup.asObservable(); }

  selectedBookingRoleChanged(bookingRole: BookingRoleDO) {
    if (bookingRole) {
      this._selectedBookingRole.pipe(take(1)).subscribe((br) => {
        if (br && br.staffNumber !== bookingRole.staffNumber) {
          this._selectedBookingRole.next(bookingRole);
        } else if (!br) { this._selectedBookingRole.next(bookingRole); }
      });
    }
  }

  showApplyPopupChanged(showPopup: boolean) {
    this._showApplyPopup.pipe(take(1)).subscribe((sp) => {
      if (sp !== showPopup) { this._showApplyPopup.next(showPopup); }
    });
  }

  selectedLocationRoomChanged(locationRoom: LocationRoomDO) {
    if (locationRoom) {
      this._selectedLocationRoom.pipe(take(1)).subscribe((lr) => {
        if (lr.locationId !== locationRoom.locationId || lr.roomId !== locationRoom.roomId) {
          // if the currently selected doctor/staff is not available at the locaiton, de-select them
          if (this.selectedDoctor && this.selectedDoctor.defaultLocation > 0
            && this.selectedDoctor.defaultLocation !== locationRoom.locationId) {
            this.selectedDoctor = undefined;
          }

          if (this.selectedStaff1 && this.selectedStaff1.staffRoles && this.selectedStaff1.staffRoles
            .some((r) => r.defaultLocation > 0 && r.defaultLocation !== locationRoom.locationId)) {
            this.selectedStaff1 = undefined;
          }

          if (this.selectedStaff2 && this.selectedStaff2.staffRoles && this.selectedStaff2.staffRoles
            .some((r) => r.defaultLocation > 0 && r.defaultLocation !== locationRoom.locationId)) {
            this.selectedStaff2 = undefined;
          }

          if (this.selectedStaff3 && this.selectedStaff3.staffRoles && this.selectedStaff3.staffRoles
            .some((r) => r.defaultLocation > 0 && r.defaultLocation !== locationRoom.locationId)) {
            this.selectedStaff3 = undefined;
          }

          if (this.selectedStaff4 && this.selectedStaff4.staffRoles && this.selectedStaff4.staffRoles
            .some((r) => r.defaultLocation > 0 && r.defaultLocation !== locationRoom.locationId)) {
            this.selectedStaff4 = undefined;
          }

          this._selectedLocationRoom.next(locationRoom);
        }
      });
    } else {
      this._locationRooms.pipe(take(1)).subscribe((locations) => {
        if (locations && locations.length > 0) { this._selectedLocationRoom.next(locations[0]); }
      });
    }
  }

  schedulerViewChanged(view: string) {
    this._schedulerView.pipe(take(1)).subscribe((currentView) => {
      if (currentView !== view) {
        this._schedulerView.next(view);
        if (view === 'Cycle') { this.schedulerDateChanged(new Date(2019, 6, 1)); }
      }
    });
  }

  selectedViewChanged(view: string) {
    this._selectedView.pipe(take(1)).subscribe((sv) => {
      if (sv !== view) {
        this._selectedView.next(view);
        if (view === 'Doctor/Staff') { this.selectedDSViewChanged('Doctors'); }
      }
    });
  }

  selectedDSViewChanged(dsView: string) {
    let bookingRoles: BookingRoleDO[];
    this._bookingRoles.pipe(take(1)).subscribe((brs) => { bookingRoles = brs; });

    this._dsView.pipe(take(1)).subscribe((dsv) => {
      if (dsv !== dsView) {
        this._dsView.next(dsView);
        if (dsView === 'Staff' && bookingRoles && bookingRoles.length > 0) {
          this.selectedBookingRoleChanged(bookingRoles[0]);
        }
      }
    });
  }

  schedulerCellDurationChanged(duration: number) {
    this._schedulerCellDuration.pipe(take(1)).subscribe((currentDuration) => {
      if (currentDuration !== duration) { this._schedulerCellDuration.next(duration); }
    });
  }

  schedulerDateChanged(date: Date) {
    this._schedulerCurrentDate.pipe(take(1)).subscribe((currentDate) => {
      if (currentDate.valueOf() !== date.valueOf()) {
        this._selectedWeek.next(this.rosterHelper.getWeekNumber(date));
        this._selectedDay.next(date.getDay());
        this._schedulerCurrentDate.next(date);
        const templateDate = new Date(date);
        this.templateStart = new Date(2019, 6, templateDate.getDate(),
          this.templateStart.getHours(), this.templateStart.getMinutes());
        this.templateEnd = new Date(2019, 6, templateDate.getDate(),
          this.templateEnd.getHours(), this.templateEnd.getMinutes());
      }
    });
  }

  getDisplayDates(templates: RosterTemplateDO[]): RosterTemplateDO[] {
    // let sessions: SessionDO[];
    // this._sessions.pipe(take(1)).subscribe((s) => { sessions = s; });
    const displayTemplates = _.cloneDeep(templates);

    displayTemplates.forEach((template) => {
      // calculate display date for staff scheduler based on session
      const mins = 1440 / this.numSessions;

      if (template.sessionId === 0) {
        template.endDate = new Date(template.trueEndDate);
        template.endDate.setHours(23);
        template.endDate.setMinutes(59);
        template.startDate = addMinutes(new Date(template.endDate), -mins);
      } else {
        const multi = (template.sessionId === 1) ? 0 : mins * (template.sessionId - 1);
        const sdStart = new Date(template.trueStartDate);
        sdStart.setMinutes(0);
        sdStart.setHours(0);
        template.startDate = (template.sessionId === 1)
          ? new Date(sdStart) : addMinutes(new Date(sdStart), multi);
        template.endDate = addMinutes(new Date(template.startDate), mins);
      }
    });

    return displayTemplates;
  }

  rosterPopupChanged(rosterPopup: RosterPopup) {
    let rp: RosterPopup;
    this._rosterPopup.pipe(take(1)).subscribe((popup) => { rp = popup; });

    if (rosterPopup && (rp.showPopup !== rosterPopup.showPopup)) { this._rosterPopup.next(rosterPopup); }
  }

  addNewTemplates(roomId: number, date: Date) {
    let doctors: DoctorDO[];
    this._doctors.pipe(take(1)).subscribe((drs) => { doctors = drs; });

    let staffMembers: StaffDO[];
    this._staff.pipe(take(1)).subscribe((staff) => { staffMembers = staff; });

    if (!this.selectedDoctor && !this.selectedStaff1 && !this.selectedStaff2
      && !this.selectedStaff3 && !this.selectedStaff4) {
      this.store.dispatch(new SetError({
        errorMessages: ['Please select at least one Doctor or Staff Member.'],
        title: 'Template Creation Failed',
      }));
    } else {
      combineLatest(this._templates, this._bookingRoles, this._selectedLocationRoom,
        this._locationRooms, this._sessions).pipe(take(1))
        .subscribe(([templates, bookingRoles, locationRoom, locationRooms, sessions]: any[]) => {
          const template = new RosterTemplateDO();
          template.templateId = 0;
          template.locationId = locationRoom.locationId;
          template.roomId = roomId;
          const lrIndex = locationRooms.findIndex(
            (lr: LocationRoomDO) => lr.locationId === locationRoom.locationId && lr.roomId === roomId);
          template.locationRoomName = (lrIndex === 0 || lrIndex > 0) ? locationRooms[lrIndex].displayName : 'Not Found';
          template.edited = true;
          const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
            this.templateStart.getHours(), this.templateStart.getMinutes());
          template.startDate = new Date(start);
          template.trueStartDate = new Date(start);
          const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
            this.templateEnd.getHours(), this.templateEnd.getMinutes());
          template.endDate = new Date(end);
          template.trueEndDate = new Date(end);
          template.deleted = false;

          const session = sessions.find((s: SessionDO) => s.startHour === template.startDate.getHours()
          && s.startMinutes === template.startDate.getMinutes() && s.endHour === template.endDate.getHours()
          && s.endMinutes === template.endDate.getMinutes());
          template.sessionId = (session) ? session.sessionId : 0;

          if (this.selectedDoctor) {
            const doctorTemplate = _.cloneDeep(template);
            doctorTemplate.doctorId = this.selectedDoctor.doctorId;
            doctorTemplate.isDoctor = true;
            doctorTemplate.staffName = this.selectedDoctor.doctorName;
            doctorTemplate.roleName = 'Doctor';

            const tIndex = templates.findIndex(
              (t: RosterTemplateDO) => t.doctorId && t.doctorId === doctorTemplate.doctorId
            && areIntervalsOverlapping({ start: doctorTemplate.startDate, end: doctorTemplate.endDate },
              { start: t.startDate, end: t.endDate }));

            if (tIndex === 0 || tIndex > 0) {
              this.conflictingTemplateError(this.selectedDoctor.doctorName, templates[tIndex]);
            } else {
              doctorTemplate.newId = this.newId;
              this.newId += 1;
              templates.push(doctorTemplate);
              this.updateDoctorHours(this.selectedDoctor, doctors, doctorTemplate);
              this._templates.next(templates);
            }
          }

          if (this.selectedStaff1) {
            const staff1Template = _.cloneDeep(template);
            staff1Template.staffId = this.selectedStaff1.staffId;
            const brole = bookingRoles.find((br: BookingRoleDO) => br.staffNumber === 1);
            if (brole.roleId > 0) {
              staff1Template.roleId = brole.roleId;
              staff1Template.roleName = brole.displayName;
            } else {
              staff1Template.roleName = 'Staff Member';
            }
            staff1Template.isDoctor = false;
            staff1Template.staffName = this.selectedStaff1.staffName;

            const s1Index = templates.findIndex(
              (t: RosterTemplateDO) => t.staffId && t.staffId === staff1Template.staffId
            && areIntervalsOverlapping({ start: staff1Template.startDate, end: staff1Template.endDate },
              { start: t.startDate, end: t.endDate }));

            if (s1Index === 0 || s1Index > 0) {
              this.conflictingTemplateError(this.selectedStaff1.staffName, templates[s1Index]);
            } else {
              staff1Template.newId = this.newId;
              this.newId += 1;
              templates.push(staff1Template);
              this.updateStaffHours(this.selectedStaff1, staffMembers, staff1Template);
              this._templates.next(templates);
            }
          }

          if (this.selectedStaff2) {
            const staff2Template = _.cloneDeep(template);
            staff2Template.staffId = this.selectedStaff2.staffId;
            const brole = bookingRoles.find((dr: BookingRoleDO) => dr.staffNumber === 2);
            if (brole.roleId > 0) {
              staff2Template.roleId = brole.roleId;
              staff2Template.roleName = brole.displayName;
            } else {
              staff2Template.roleName = 'Staff Member';
            }
            staff2Template.isDoctor = false;
            staff2Template.staffName = this.selectedStaff2.staffName;

            const s2Index = templates.findIndex(
              (t: RosterTemplateDO) => t.staffId && t.staffId === staff2Template.staffId
            && areIntervalsOverlapping({ start: staff2Template.startDate, end: staff2Template.endDate },
              { start: t.startDate, end: t.endDate }));

            if (s2Index === 0 || s2Index > 0) {
              this.conflictingTemplateError(this.selectedStaff2.staffName, templates[s2Index]);
            } else {
              staff2Template.newId = this.newId;
              this.newId += 1;
              templates.push(staff2Template);
              this.updateStaffHours(this.selectedStaff2, staffMembers, staff2Template);
              this._templates.next(templates);
            }
          }

          if (this.selectedStaff3) {
            const staff3Template = _.cloneDeep(template);
            staff3Template.staffId = this.selectedStaff3.staffId;
            const brole = bookingRoles.find((dr: BookingRoleDO) => dr.staffNumber === 3);
            if (brole.roleId > 0) {
              staff3Template.roleId = brole.roleId;
              staff3Template.roleName = brole.displayName;
            } else {
              staff3Template.roleName = 'Staff Member';
            }
            staff3Template.isDoctor = false;
            staff3Template.staffName = this.selectedStaff3.staffName;

            const s3Index = templates.findIndex(
              (t: RosterTemplateDO) => t.staffId && t.staffId === staff3Template.staffId
            && areIntervalsOverlapping({ start: staff3Template.startDate, end: staff3Template.endDate },
              { start: t.startDate, end: t.endDate }));

            if (s3Index === 0 || s3Index > 0) {
              this.conflictingTemplateError(this.selectedStaff3.staffName, templates[s3Index]);
            } else {
              staff3Template.newId = this.newId;
              this.newId += 1;
              templates.push(staff3Template);
              this.updateStaffHours(this.selectedStaff3, staffMembers, staff3Template);
              this._templates.next(templates);
            }
          }

          if (this.selectedStaff4) {
            const staff4Template = _.cloneDeep(template);
            staff4Template.staffId = this.selectedStaff4.staffId;
            const brole = bookingRoles.find((dr: BookingRoleDO) => dr.staffNumber === 4);
            if (brole.roleId > 0) {
              staff4Template.roleId = brole.roleId;
              staff4Template.roleName = brole.displayName;
            } else {
              staff4Template.roleName = 'Staff Member';
            }
            staff4Template.isDoctor = false;
            staff4Template.staffName = this.selectedStaff4.staffName;

            const s4Index = templates.findIndex(
              (t: RosterTemplateDO) => t.staffId && t.staffId === staff4Template.staffId
            && areIntervalsOverlapping({ start: staff4Template.startDate, end: staff4Template.endDate },
              { start: t.startDate, end: t.endDate }));

            if (s4Index === 0 || s4Index > 0) {
              this.conflictingTemplateError(this.selectedStaff4.staffName, templates[s4Index]);
            } else {
              staff4Template.newId = this.newId;
              this.newId += 1;
              templates.push(staff4Template);
              this.updateStaffHours(this.selectedStaff4, staffMembers, staff4Template);
              this._templates.next(templates);
            }
          }
        });
    }
  }

  addNewDoctorTemplate(templates: RosterTemplateDO[], doctorId: number, startDate: Date, endDate: Date) {
    let locationRoom: LocationRoomDO;
    this._selectedLocationRoom.pipe(take(1)).subscribe((lr) => { locationRoom = lr; });

    let sessions: SessionDO[];
    this._sessions.pipe(take(1)).subscribe((s) => { sessions = s; });

    let doctor: DoctorDO;
    let doctors: DoctorDO[];
    this._doctors.pipe(take(1)).subscribe((drs) => {
      doctors = drs;
      doctor = drs.find((d) => d.doctorId === doctorId);
    });

    if (!doctor || !locationRoom) {
      this.store.dispatch(new SetError({
        errorMessages: ['Please select a Location/Room.'],
        title: 'Template Creation Failed',
      }));
    } else {
      const template = new RosterTemplateDO();
      template.templateId = 0;
      template.newId = this.newId;
      this.newId += 1;
      template.locationId = locationRoom.locationId;
      template.roomId = locationRoom.roomId;
      template.edited = true;
      template.startDate = new Date(startDate);
      template.trueStartDate = new Date(startDate);
      template.endDate = new Date(endDate);
      template.trueEndDate = new Date(endDate);
      template.deleted = false;
      template.doctorId = doctorId;
      template.isDoctor = true;
      template.staffName = doctor.doctorName;
      template.locationRoomName = locationRoom.displayName;
      template.roleName = 'Doctor';

      const session = sessions.find((s: SessionDO) => s.startHour === template.startDate.getHours()
        && s.startMinutes === template.startDate.getMinutes() && s.endHour === template.endDate.getHours()
        && s.endMinutes === template.endDate.getMinutes());
      template.sessionId = (session) ? session.sessionId : 0;

      if (this.isValidTemplateEdit(templates, template)) {
        this.updateDoctorHours(doctor, doctors, template);
        templates.push(template);
        this._templates.next(templates);
      }
    }
  }

  addNewStaffTemplate(templates: RosterTemplateDO[], staffId: number, startDate: Date, endDate: Date) {
    let locationRoom: LocationRoomDO;
    this._selectedLocationRoom.pipe(take(1)).subscribe((slr) => { locationRoom = slr; });

    let selectedBookingRole: BookingRoleDO;
    this._selectedBookingRole.pipe(take(1)).subscribe((sbr) => { selectedBookingRole = sbr; });

    let sessions: SessionDO[];
    this._sessions.pipe(take(1)).subscribe((s) => { sessions = s; });

    let staffMember: StaffDO;
    let staff: StaffDO[];
    this._staff.pipe(take(1)).subscribe((s) => {
      staff = s;
      staffMember = s.find((sm) => sm.staffId === staffId);
    });

    if (!staffMember || !locationRoom) {
      this.store.dispatch(new SetError({
        errorMessages: ['Please select a Location/Room.'],
        title: 'Template Creation Failed',
      }));
    } else if (!selectedBookingRole) {
      this.store.dispatch(new SetError({
        errorMessages: ['Please select a Staff Role.'],
        title: 'Template Creation Failed',
      }));
    } else {
      const template = new RosterTemplateDO();
      template.templateId = 0;
      template.newId = this.newId;
      this.newId += 1;
      template.locationId = locationRoom.locationId;
      template.roomId = locationRoom.roomId;
      template.edited = true;
      template.startDate = new Date(startDate);
      template.trueStartDate = new Date(startDate);
      template.endDate = new Date(endDate);
      template.trueEndDate = new Date(endDate);
      template.deleted = false;
      template.staffId = staffId;
      template.isDoctor = false;
      template.staffName = staffMember.staffName;
      template.locationRoomName = locationRoom.displayName;

      if (selectedBookingRole.roleId === 0 || selectedBookingRole.roleId > 0) {
        template.roleId = selectedBookingRole.roleId;
        template.roleName = selectedBookingRole.displayName;
      } else {
        template.roleName = 'Staff Member';
      }

      const session = sessions.find((s: SessionDO) => s.startHour === template.startDate.getHours()
        && s.startMinutes === template.startDate.getMinutes() && s.endHour === template.endDate.getHours()
        && s.endMinutes === template.endDate.getMinutes());
      template.sessionId = (session) ? session.sessionId : 0;

      if (this.isValidTemplateEdit(templates, template)) {
        this.updateStaffHours(staffMember, staff, template);
        templates.push(template);
        this._templates.next(templates);
      }
    }
  }

  private updateDoctorHours(doctor: DoctorDO, doctors: DoctorDO[], template: RosterTemplateDO) {
    doctor.rosterHours += (differenceInMinutes(template.trueEndDate, template.trueStartDate) / 60);
    doctor.numSessions += 1;
    const drIndex = doctors.findIndex((d) => d.doctorId === doctor.doctorId);
    if (drIndex === 0 || drIndex > 0) { doctors[drIndex] = doctor; }
    this._doctors.next(doctors);
  }

  private updateStaffHours(staffMember: StaffDO, staff: StaffDO[], template: RosterTemplateDO) {
    staffMember.rosterHours += (differenceInMinutes(template.trueEndDate, template.trueStartDate) / 60);
    staffMember.numSessions += 1;
    const index = staff.findIndex((s) => s.staffId === staffMember.staffId);
    if (index === 0 || index > 0) { staff[index] = staffMember; }
    this._staff.next(staff);
  }

  addNewRosterSet(setName: string, cycleLength: number) {
    this._loading.next(true);
    let sets: RosterTemplateSetDO[];
    this._templateSets.pipe(take(1)).subscribe((ts) => { sets = ts; });
    this.rosterTemplateClient.addNewRosterTemplateSet(setName, cycleLength, this.userPkId).subscribe((result) => {
      if (result.errorMessage && result.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [result.errorMessage], title: 'Save Failed' }));
      } else {
        sets.push(result.data);
        this._templateSets.next(sets);
        this._templates.next([]);
        this._selectedTemplateSet.next(result.data);
        notify({
          message: `${setName} has been created successfully`, type: 'success', displayTime: 3000, width: 600,
        });
      }

      this._loading.next(false);
    });
  }

  duplicateRosterSet(duplicateSetId: number, setName: string, cycleLength: number) {
    this._loading.next(true);

    let sets: RosterTemplateSetDO[];
    this._templateSets.pipe(take(1)).subscribe((ts) => { sets = ts; });

    this.rosterTemplateClient.duplicateRosterTemplateSet(duplicateSetId, setName,
      cycleLength, this.userPkId).subscribe((result) => {
      if (result.errorMessage && result.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [result.errorMessage], title: 'Save Failed' }));
      }
      sets.push(result.data);
      this._templateSets.next(sets);

      const setIndex = sets.findIndex((s) => s.id === result.data.id);
      this.selectedTemplateSetChanged(sets[setIndex], true);
      notify({
        message: `${setName} has been created successfully.`, type: 'success', displayTime: 3000, width: 600,
      });
      this._loading.next(false);
    });
  }

  updateRosterSet(rosterSet: RosterTemplateSetDO) {
    this._loading.next(true);

    let sets: RosterTemplateSetDO[];
    this._templateSets.pipe(take(1)).subscribe((templateSets: RosterTemplateSetDO[]) => { sets = templateSets; });

    this.rosterTemplateClient.updateRosterTemplateSet(rosterSet, this.userPkId).subscribe((result) => {
      if (result.errorMessage && result.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [result.errorMessage], title: 'Update Failed' }));
      } else {
        this._selectedTemplateSet.next(result.data);
        const index = sets.findIndex((s) => s.id === result.data.id);

        if (index === 0 || index > 0) {
          sets[index] = result.data;
          this._selectedTemplateSet.next(result.data);
          this._templateSets.next(sets);
          notify({
            message: `${rosterSet.templateSetName} has been updated successfully`,
            type: 'success',
            displayTime: 3000,
            width: 600,
          });
        }
      }

      this._loading.next(false);
    });
  }

  deleteRosterSet(rosterSet: RosterTemplateSetDO) {
    this._loading.next(true);

    let sets: RosterTemplateSetDO[];
    this._templateSets.pipe(take(1)).subscribe((templateSets: RosterTemplateSetDO[]) => { sets = templateSets; });

    this.rosterTemplateClient.deleteRosterTemplateSet(rosterSet.id, this.userPkId).subscribe((result) => {
      if (result.errorMessage && result.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [result.errorMessage] }));
      } else if (result.data) {
        const index = sets.findIndex((s) => s.id === rosterSet.id);
        if (index === 0 || index > 0) { sets.splice(index, 1); }

        this._templateSets.next(sets);

        if (sets && sets.length > 0) {
          this._selectedTemplateSet.next(sets[0]);
          this.selectedTemplateSetChanged(sets[0], true);
        } else {
          this._selectedTemplateSet.next(null);
        }

        notify({
          message: `${rosterSet.templateSetName} has been deleted successfully`,
          type: 'success',
          displayTime: 3000,
          width: 600,
        });
      }

      this._loading.next(false);
    });
  }

  selectedTemplateSetChanged(set: RosterTemplateSetDO, reload: boolean) {
    let selectedSet: RosterTemplateSetDO;
    this._selectedTemplateSet.pipe(take(1)).subscribe((s) => { selectedSet = s; });

    if ((set && reload) || (!selectedSet || (selectedSet && selectedSet.id !== set.id))) {
      this._selectedTemplateSet.next(set);
      this.fetchTemplates(set.id);
    }
  }

  templatesUpdated(templates: RosterTemplateDO[]) { this._templates.next(templates); }

  templateChanged(updatedTemplate: RosterTemplateDO) {
    let temps: RosterTemplateDO[];
    this._templates.pipe(take(1)).subscribe((t) => { temps = t; });

    const idx = temps.findIndex((t) => ((updatedTemplate.templateId > 0)
      ? t.templateId === updatedTemplate.templateId : t.templateId === 0 && t.newId === updatedTemplate.newId));
    const oldTemplate = _.cloneDeep(temps[idx]);
    if (idx === 0 || idx > 0) { temps[idx] = updatedTemplate; }
    this._templates.next(temps);

    if (updatedTemplate.isDoctor) {
      this._doctors.pipe(take(1)).subscribe(() => {
        if (updatedTemplate.doctorId !== oldTemplate.doctorId) {
          // if doctor was changed
          this.recalculateHoursForDoctor(oldTemplate.doctorId, temps);
          this.recalculateHoursForDoctor(updatedTemplate.doctorId, temps);
        } else {
          this.recalculateHoursForDoctor(updatedTemplate.doctorId, temps);
        }
      });
    } else {
      this._staff.pipe(take(1)).subscribe(() => {
        if (updatedTemplate.staffId !== oldTemplate.staffId) {
          // if staff member was changed
          this.recalculateHoursForStaffMember(oldTemplate.staffId, temps);
          this.recalculateHoursForStaffMember(updatedTemplate.staffId, temps);
        } else {
          this.recalculateHoursForStaffMember(updatedTemplate.staffId, temps);
        }
      });
    }
  }

  isValidTemplateEdit(templates: RosterTemplateDO[], editTemplate: RosterTemplateDO): boolean {
    let isValid = true;
    if (editTemplate.isDoctor && editTemplate.doctorId) {
      const drTemplates = templates.filter((tm) => tm.isDoctor && tm.doctorId === editTemplate.doctorId);
      // if there are templates for that doctor, find if any are overlapping
      if (drTemplates && drTemplates.length > 0) {
        drTemplates.forEach((template: RosterTemplateDO) => {
          if (areIntervalsOverlapping({ start: editTemplate.trueStartDate, end: editTemplate.trueEndDate },
            { start: template.trueStartDate, end: template.trueEndDate })) {
            // if a template is overlapping, check if it is the same template currently being edited
            if (template.templateId !== editTemplate.templateId) {
              // template id is different so it is a different template, therefore it is invalid
              isValid = false;
              this.conflictingTemplateError(editTemplate.staffName, template);
              return isValid;
            }
            // template id is the same, check if it is the same new id before returning false
            if (editTemplate.templateId === 0 && editTemplate.newId !== template.newId) {
              isValid = false;
              this.conflictingTemplateError(editTemplate.staffName, template);
              return isValid;
            }
          }
          return isValid;
        });
      }
    } else { // is for staff
      const staffTemplates = templates.filter((tm) => !tm.isDoctor && tm.staffId === editTemplate.staffId);
      // if there are templates for that doctor, find if any are overlapping
      if (staffTemplates && staffTemplates.length > 0) {
        staffTemplates.forEach((template: RosterTemplateDO) => {
          if (areIntervalsOverlapping({ start: editTemplate.trueStartDate, end: editTemplate.trueEndDate },
            { start: template.trueStartDate, end: template.trueEndDate })) {
            // if a template is overlapping, check if it is the same template currently being edited
            if (template.templateId !== editTemplate.templateId) {
              // template id is different so it is a different template, therefore it is invalid
              isValid = false;
              this.conflictingTemplateError(editTemplate.staffName, template);
              return isValid;
            }
            // template id is the same, check if it is the same new id before returning false
            if (editTemplate.templateId === 0 && editTemplate.newId !== template.newId) {
              isValid = false;
              this.conflictingTemplateError(editTemplate.staffName, template);
              return isValid;
            }
          }
          return isValid;
        });
      }
    }
    return isValid;
  }

  save() {
    this._loading.next(true);

    let templates: RosterTemplateDO[];
    this._templates.pipe(take(1)).subscribe((t) => { templates = t; });

    let setId: number;
    this._selectedTemplateSet.pipe(take(1)).subscribe((set) => { setId = set.id; });

    let sets: RosterTemplateSetDO[];
    this._templateSets.pipe(take(1)).subscribe((ts) => { sets = ts; });

    const request = new RosterTemplatesSaveRequest();
    request.templates = templates;
    request.deletedTemplates = this.deletedTemplates;
    request.userPkId = this.userPkId;
    request.templateSetId = setId;

    this.rosterTemplateClient.saveRosterTemplates(request).subscribe((response) => {
      if (response.errorMessage && response.errorMessage.length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage], title: 'Save Failed' }));
      } else if (response.data && response.data.rosterTemplateSet) {
        this.deletedTemplates = [];
        const setIndex = sets.findIndex((set) => set.id === response.data.rosterTemplateSet.id);

        if (setIndex === 0 || setIndex > 0) {
          sets[setIndex] = response.data.rosterTemplateSet;
          this._templateSets.next(sets);
          this._selectedTemplateSet.next(sets[setIndex]);
        }

        this.fetchTemplates(response.data.rosterTemplateSet.id);
      }

      this._loading.next(false);
    });
  }

  applyTemplates(dateFrom: Date, dateTo: Date, includePHs: boolean, startDay: number) {
    this._loading.next(true);
    let rosterset: RosterTemplateSetDO;
    this._selectedTemplateSet.pipe(take(1)).subscribe((set) => { rosterset = set; });

    this.rosterTemplateClient.applyTemplates(rosterset.id, dateFrom, dateTo, includePHs, this.userPkId,
      this.userName, this.licenseUserId, rosterset.cycleLength, startDay).subscribe((result: APIResponseOfBoolean) => {
      if (result && result.errorMessage && result.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [result.errorMessage], title: 'Apply Templates Failed' }));
        this._loading.next(false);
      } else if (result.data) {
        notify({
          message: 'Templates have been applied successfully', type: 'success', displayTime: 3000, width: 500,
        });
        this._showApplyPopup.next(false);
        this.selectedTemplateSetChanged(rosterset, true);
      } else {
        this.store.dispatch(new SetError({
          errorMessages: ['Unable to apply templates.'],
          title: 'Apply Templates Failed',
        }));
      }
    });
  }

  recalculateHoursForDoctor(doctorId: number, templates: RosterTemplateDO[]) {
    this._doctors.pipe(take(1)).subscribe((drs) => {
      const drIndex = drs.findIndex((dr) => dr.doctorId === doctorId);
      if (drIndex === 0 || drIndex > 0) {
        const doctor = drs[drIndex];
        doctor.rosterHours = 0;
        doctor.numSessions = 0;

        templates.filter((t) => t.isDoctor && t.doctorId && t.doctorId === doctorId).forEach((template) => {
          doctor.numSessions += 1;
          doctor.rosterHours += (differenceInMinutes(template.trueEndDate, template.trueStartDate) / 60);
        });

        drs[drIndex] = doctor;
        this._doctors.next(drs);
      }
    });
  }

  recalculateHoursForStaffMember(staffId: number, templates: RosterTemplateDO[]) {
    this._staff.pipe(take(1)).subscribe((s) => {
      const sIndex = s.findIndex((sm) => sm.staffId === staffId);
      if (sIndex === 0 || sIndex > 0) {
        const staffMember = s[sIndex];
        staffMember.rosterHours = 0;
        staffMember.numSessions = 0;

        templates.filter((t) => !t.isDoctor && t.staffId && t.staffId === staffId).forEach((template) => {
          staffMember.numSessions += 1;
          staffMember.rosterHours += (differenceInMinutes(template.trueEndDate, template.trueStartDate) / 60);
        });

        s[sIndex] = staffMember;
        this._staff.next(s);
      }
    });
  }

  subtractSessionHours(template: RosterTemplateDO, doctor?: DoctorDO, staffMember?: StaffDO) {
    if (doctor && template) {
      let doctors: DoctorDO[];
      this._doctors.pipe(take(1)).subscribe((ds) => { doctors = ds; });

      const drIndex = doctors.findIndex((dr) => dr.doctorId === doctor.doctorId);
      if (drIndex === 0 || drIndex > 0) {
        doctors[drIndex].rosterHours -= (differenceInMinutes(template.trueEndDate, template.trueStartDate) / 60);
        doctors[drIndex].numSessions -= 1;
      }

      this._doctors.next(doctors);
    } else if (staffMember && template) {
      let staff: StaffDO[];
      this._staff.pipe(take(1)).subscribe((s) => { staff = s; });

      const staffIndex = staff.findIndex((s) => s.staffId === staffMember.staffId);
      if (staffIndex === 0 || staffIndex > 0) {
        staff[staffIndex].rosterHours -= (differenceInMinutes(template.trueEndDate, template.trueStartDate) / 60);
        staff[staffIndex].numSessions -= 1;
      }

      this._staff.next(staff);
    }
  }

  deleteTemplates(dateFrom: Date, dateTo: Date, deleteAll: boolean) {
    let rosterset: RosterTemplateSetDO;
    this._selectedTemplateSet.pipe(take(1)).subscribe((set) => { rosterset = set; });

    this.rosterTemplateClient.deleteTemplates(rosterset.id, dateFrom,
      dateTo, deleteAll, this.licenseUserId, this.userPkId)
      .subscribe((result: APIResponseOfBoolean) => {
        if (result && result.errorMessage && result.errorMessage.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [result.errorMessage], title: 'Delete Templates Failed' }));
        } else if (result.data) {
          notify({
            message: 'Templates have been deleted successfully', type: 'success', displayTime: 3000, width: 500,
          });
          this._showApplyPopup.next(false);
        } else {
          this.store.dispatch(new SetError({
            errorMessages: ['Unable to delete templates.'],
            title: 'Delete Templates Failed',
          }));
        }
      });
  }

  conflictingTemplateError(staffName: string, conflictingTemplate: RosterTemplateDO) {
    this._selectedTemplateSet.pipe(take(1)).subscribe((sts) => {
      if (sts.cycleLength <= 7) {
        this.store.dispatch(new SetError({
          errorMessages: [`Unable to create template for ${staffName
          }.</br></br>They are already rostered at:</br>${conflictingTemplate.locationRoomName} (${
            this.rosterHelper.getDayOfWeek(conflictingTemplate.trueStartDate.getDay())} ${
            conflictingTemplate.trueStartDate.toLocaleTimeString()} - ${
            conflictingTemplate.trueEndDate.toLocaleTimeString()})`],
          title: 'Template Creation Failed',
        }));
      } else {
        this.store.dispatch(new SetError({
          errorMessages: [`Unable to create template for ${staffName
          }.</br></br>They are already rostered at:</br>${conflictingTemplate.locationRoomName} (${
            this.rosterHelper.getDayOfWeek(conflictingTemplate.trueStartDate.getDay())} Week ${
            this.rosterHelper.getWeekNumber(conflictingTemplate.trueStartDate)}: ${
            conflictingTemplate.trueStartDate.toLocaleTimeString()} - ${
            conflictingTemplate.trueEndDate.toLocaleTimeString()})`],
          title: 'Template Creation Failed',
        }));
      }
    });
  }

  fetchTemplates(setId: number) {
    this._loading.next(true);

    this.rosterTemplateClient.getTemplatesForSet(setId).subscribe((response) => {
      if (response.errorMessage && response.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [response.errorMessage], title: 'Load Failed' }));
      } else {
        this.populateData(response.data);
      }

      this._loading.next(false);
    });
  }

  getRoster(rosterID: number) {
    return this.rosterTemplateClient.getRoster(rosterID).pipe(
      map((response: APIResponseOfRosterBookingDO) => response, () => this.store.dispatch(
        new SetError({ errorMessages: ['Unable to process query, please check your network connection.'] }))));
  }

  splitRoster(rosterID: number, newEndTime: Date, newDuration: number, user: string, pushEndTime: boolean) {
    return this.rosterTemplateClient.splitRoster(rosterID, newEndTime, newDuration, user, pushEndTime)
      .pipe(map((response: APIResponseOfBoolean) => response, () => this.store.dispatch(new SetError({
        errorMessages: [
          'Unable to process query, please check your network connection.'],
      }))));
  }

  populateData(templates: RosterTemplateDO[]) {
    let staff: StaffDO[];
    this._staff.pipe(take(1)).subscribe((s) => { staff = s; });

    let doctors: DoctorDO[];
    this._doctors.pipe(take(1)).subscribe((d) => { doctors = d; });

    let locationRooms: LocationRoomDO[];
    this._locationRooms.pipe(take(1)).subscribe((lr) => { locationRooms = lr; });

    let bookingRoles: BookingRoleDO[];
    this._bookingRoles.pipe(take(1)).subscribe((brs) => { bookingRoles = brs; });

    // reset all staff and doctor hours
    doctors.forEach((dr) => {
      dr.rosterHours = 0;
      dr.numSessions = 0;
    });

    staff.forEach((sm) => {
      sm.rosterHours = 0;
      sm.numSessions = 0;
    });

    templates.forEach((template) => {
      const locationRoom = locationRooms.find(
        (lr) => lr.locationId === template.locationId && lr.roomId === template.roomId);
      if (locationRoom) { template.locationRoomName = locationRoom.displayName; }
      let idx: number;

      if (template.isDoctor) {
        idx = doctors.findIndex((d) => d.doctorId === template.doctorId);
        template.roleName = 'Doctor';

        if (idx === 0 || idx > 0) {
          if (!doctors[idx].rosterHours) { doctors[idx].rosterHours = 0; }
          doctors[idx].rosterHours += (differenceInMinutes(template.trueEndDate, template.trueStartDate) / 60);
          if (!doctors[idx].numSessions) { doctors[idx].numSessions = 0; }
          doctors[idx].numSessions += 1;
        }
      } else {
        idx = staff.findIndex((s) => s.staffId === template.staffId);

        if (idx === 0 || idx > 0) {
          if (!staff[idx].rosterHours) { staff[idx].rosterHours = 0; }
          staff[idx].rosterHours += (differenceInMinutes(template.trueEndDate, template.trueStartDate) / 60);
          if (!staff[idx].numSessions) { staff[idx].numSessions = 0; }
          staff[idx].numSessions += 1;
          if (template.roleId && template.roleId > 0) {
            const roleIndex = bookingRoles.findIndex((br) => br.roleId === template.roleId);

            if (roleIndex === 0 || roleIndex > 0) {
              template.roleName = bookingRoles[roleIndex].displayName;
            } else {
              template.roleName = 'Staff Member';
            }
          } else {
            template.roleName = 'Staff Member';
          }
        }
      }

      if (idx === 0 || idx > 0) {
        template.staffName = (template.isDoctor) ? doctors[idx].doctorName : staff[idx].staffName;
      } else {
        template.staffName = 'Not Found';
      }
    });

    this._templates.next(templates);
    this._doctors.next(doctors);
    this._staff.next(staff);
  }
}
