import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { addMinutes } from 'date-fns';
import { DxSchedulerComponent } from 'devextreme-angular';
import * as _ from 'lodash';
import { combineLatest, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { RosterTemplateDO, SessionDO } from '../../../../../../../../Generated/CoreAPIClient';
import { RosterPopup } from '../../../../shared/models/RosterPopup';
import { RosterService } from '../../../roster.service';

@Component({
  selector: 'app-doctor-scheduler',
  templateUrl: './doctor-scheduler.component.html',
  styleUrls: ['./doctor-scheduler.component.css']
})
export class DoctorSchedulerComponent implements OnDestroy {
  @ViewChild('doctorScheduler') doctorScheduler: DxSchedulerComponent;
  @ViewChild('staffScheduler') staffScheduler: DxSchedulerComponent;

  private _destroyed$ = new Subject<void>();
  private _selectedDay: number;

  currentDate$ = this.rosterService.getSchedulerCurrentDate();
  schedulerView$ = this.rosterService.getSchedulerView();
  staffViewDuration$ = this.rosterService.getStaffViewDuration();
  selectedSet$ = this.rosterService.getSelectedTemplateSet();
  selectedView$ = this.rosterService.getSelectedView();
  dsView$ = this.rosterService.getDSView();
  numSessions = 1;
  sessions: SessionDO[];
  timeout = null;
  editedResource = [{ id: true, color: '#5cb85c' }, { id: false, color: '#337ab7' }];
  cellContextMenuItems: any[];
  contextMenuCellData: any;
  templates: RosterTemplateDO[] = [];
  appointmentContextMenuItems: any;
  staffHeight: string;
  doctorHeight = 'calc(100vh - 12px)';
  doctors$ = combineLatest(this.rosterService.getDoctors(), this.schedulerView$, this.rosterService.getSelectedLocationRoom())
    .pipe(map(([ doctors, view, selectedLocationRoom ]) => {
    if (doctors && doctors.length > 0) {
      doctors = doctors.filter(dr => !dr.defaultLocation || dr.defaultLocation === 0 ||
        dr.defaultLocation === selectedLocationRoom.locationId);
      const calcHeight = (view === 'Day') ? (40 * doctors.length) + 77 : (40 * doctors.length) + 108;
      this.doctorHeight = (calcHeight > window.innerHeight) ? 'calc(100vh - 12px)' : calcHeight + 'px';
    }
    return doctors.sort((a, b) => a.doctorName.localeCompare(b.doctorName));
  }));
  staff$ = combineLatest(this.rosterService.getStaff(), this.rosterService.getSelectedBookingRole(),
    this.schedulerView$, this.rosterService.getSelectedLocationRoom()).pipe(
    map(([ staff, selectedBookingRole, view, selectedLR ]) => {
      if (selectedBookingRole && selectedBookingRole.roleId > 0) {
        const filteredStaff = staff.sort((staff1, staff2) => staff1.staffName.localeCompare(staff2.staffName))
          .filter(s => s.staffRoles && s.staffRoles.some(r => r.roleId === selectedBookingRole.roleId &&
          (r.defaultLocation === 0 || r.defaultLocation === selectedLR.locationId)));
        if (filteredStaff && filteredStaff.length > 0) {
          const calcHeight = (view === 'Day') ? (40 * filteredStaff.length) + 77 : (40 * filteredStaff.length) + 108;
          this.staffHeight = (calcHeight > window.innerHeight) ? 'calc(100vh - 12px)' : calcHeight + 'px';
        }
        return filteredStaff;
      } else {
        if (staff && staff.length > 0) {
          const calcHeight = (40 * staff.length) + 37 + 39;
          this.staffHeight = (calcHeight > window.innerHeight) ? 'calc(100vh - 12px)' : calcHeight + 'px';
        }
        return staff.sort((staff1, staff2) => staff1.staffName.localeCompare(staff2.staffName))
          .filter(s => s.staffRoles.some(r => r.defaultLocation === 0 || r.defaultLocation === selectedLR.locationId));
      }
  }));

  @Input() selectedWeek: number;
  @Input() set selectedDay(day: number) { this._selectedDay = day; }
  get selectedDay(): number { return this._selectedDay; }

  constructor(private rosterService: RosterService) {
    this.rosterService.getSessions().pipe(takeUntil(this._destroyed$))
      .subscribe((s: SessionDO[]) => {
        this.sessions = s;
        this.numSessions = (s && s.length > 0) ? s.length : 1; });

    this.rosterService.getTemplates().pipe(takeUntil(this._destroyed$))
      .subscribe(ts => this.templates = this.rosterService.getDisplayDates(ts.filter(t => !t.deleted)));

    this.cellContextMenuItems = [ { text: 'Add Template', onItemClick: (data: any) => this.contextMenuAddTemplateClicked(data) } ];
    this.appointmentContextMenuItems = [ { text: 'Edit', onItemClick: (data: any) => this.editTemplate(data) },
      { text: 'Delete', onItemClick: (data: any) => this.deleteTemplate(data) } ];
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  stopPropagation(e: any) { e.stopPropagation(); }

  onCellContextMenu(e: any) {
    this.contextMenuCellData = e.cellData;
    this.doctors$.pipe(take(1)).subscribe(drs => {
      const drIndex = drs.findIndex(d => d.doctorId === e.cellData.groups.doctorId);
      if (drIndex && drIndex >= 0) {
        this.cellContextMenuItems[0].text = 'Add Template (' + drs[drIndex].doctorName + '), Session ';
      } else {
        this.cellContextMenuItems[0].text = 'Add Template, Session ';
      }
    });
  }

  // delete template using context menu
  deleteTemplate(e: any) {
    if (e && this.rosterService.contextMenuAppointmentData) {
      const tIndex = this.templates.findIndex(t => (t.templateId === 0) ?
        t.newId === this.rosterService.contextMenuAppointmentData.newId :
        t.templateId === this.rosterService.contextMenuAppointmentData.templateId);
      this.templates[tIndex].deleted = true;

      if (Array.isArray(this.rosterService.contextMenuAppointmentData.roomId)) {
        this.templates[tIndex].roomId = this.rosterService.contextMenuAppointmentData[0];
      }

      if (this.templates[tIndex].isDoctor && this.templates[tIndex].doctorId) {
        this.doctors$.pipe(take(1)).subscribe(drs => {
          const drIndex = drs.findIndex(dr => dr.doctorId === this.templates[tIndex].doctorId);
          if (drIndex >= 0) {
            this.rosterService.subtractSessionHours(this.templates[tIndex], drs[drIndex]);
            this.removeTemplate(tIndex);
          }
        });
      } else {
        this.staff$.pipe(take(1)).subscribe(staff => {
          const sIndex = staff.findIndex(s => s.staffId === this.templates[tIndex].staffId);
          if (sIndex >= 0) {
            this.rosterService.subtractSessionHours(this.templates[tIndex], undefined, staff[sIndex]);
            this.removeTemplate(tIndex);
          }
        });
      }
    }
  }

  private removeTemplate(index: number) {
    this.rosterService.deletedTemplates.push(_.cloneDeep(this.templates[index]));
    this.templates.splice(index, 1);
    this.rosterService.templatesUpdated(this.templates);

    if (this.doctorScheduler && this.doctorScheduler.instance) {
      this.doctorScheduler.instance.hideAppointmentTooltip();
    } else {
      this.staffScheduler.instance.hideAppointmentTooltip();
    }
  }

  // edit template using context menu
  editTemplate(e: any) {
    if (e && this.rosterService.contextMenuAppointmentData) {
      const tIndex = this.templates.findIndex(t => (t.templateId === 0) ?
        t.newId === this.rosterService.contextMenuAppointmentData.newId :
        t.templateId === this.rosterService.contextMenuAppointmentData.templateId);
      if (Array.isArray(this.rosterService.contextMenuAppointmentData.roomId)) {
        this.templates[tIndex].roomId = this.rosterService.contextMenuAppointmentData[0];
      }

      const rosterPopup = new RosterPopup(true, this.templates[tIndex]);
      this.rosterService.rosterPopupChanged(rosterPopup);

      if (this.doctorScheduler && this.doctorScheduler.instance) { this.doctorScheduler.instance.hideAppointmentTooltip(); }
    }
  }

  onContextMenuItemClick(e: any) { e.itemData.onItemClick(e.itemData); }

  contextMenuAddTemplateClicked(data?: any) {
    if (data && this.contextMenuCellData && this.contextMenuCellData.groups) {
      if (this.contextMenuCellData) {
        const doctorId = this.contextMenuCellData.groups.doctorId;
        const start = new Date(this.contextMenuCellData.startDate);
        const end = new Date(this.contextMenuCellData.endDate);

        if (this.contextMenuCellData.endDate.getHours() === 0 && this.contextMenuCellData.endDate.getMinutes() === 0) {
          // is custom session, so use set start and end time
          start.setHours(this.rosterService.customStart.getHours());
          start.setMinutes(this.rosterService.customStart.getMinutes());
          const adjustDate = end.getDate() - 1;
          end.setDate(adjustDate);
          end.setHours(this.rosterService.customEnd.getHours());
          end.setMinutes(this.rosterService.customEnd.getMinutes());
        } else {
          let sessionId: number;
          if (this.contextMenuCellData.startDate.getHours() === 0 && this.contextMenuCellData.startDate.getMinutes() === 0) {
            sessionId = 1;
          } else {
            // is not a custom session
            if (this.numSessions > 2) {
              const mins = 1440 / this.numSessions;
              const s2Start = addMinutes(new Date(this.contextMenuCellData.startDate), (0 - mins));
              const s3Start = addMinutes(new Date(this.contextMenuCellData.startDate), (0 - (mins * 2)));
              const s4Start = addMinutes(new Date(this.contextMenuCellData.startDate), (0 - (mins * 3)));

              if (s2Start.getHours() === 0 && s2Start.getMinutes() === 0) { sessionId = 2; }
              if (s3Start.getHours() === 0 && s3Start.getMinutes() === 0) { sessionId = 3; }
              if (s4Start.getHours() === 0 && s4Start.getMinutes() === 0) { sessionId = 4; }
            }
          }

          const session = this.sessions.find(s => s.sessionId === sessionId);
          start.setHours(session.startHour);
          start.setMinutes(session.startMinutes);
          end.setHours(session.endHour);
          end.setMinutes(session.endMinutes);
        }

        this.rosterService.addNewDoctorTemplate(this.templates, doctorId, start, end);
      }
    }
  }

  // hides tooltip if doubleclick, otherwise shows tooltip
  onAppointmentClick(e: any) {
    e.cancel = true;
    if (e.component.__tooltipTimeout) { clearTimeout(e.component.__tooltipTimeout); }
    e.component.__tooltipTimeout = setTimeout(() => {
      e.component.showAppointmentTooltip(e.appointmentData, e.appointmentElement);
    }, 500);
  }

  onAppointmentDblClick(e: any) {
    // prevents appointment form being shown on doubleclick
    e.cancel = true;
    if (e.component.__tooltipTimeout) { clearTimeout(e.component.__tooltipTimeout); }
    if (e.appointmentData && e.appointmentData.isDoctor) {
      this.doctorScheduler.instance.hideAppointmentTooltip();
      this.editTemplateOnDoubleClick(e.appointmentData);
      this.doctorScheduler.instance.hideAppointmentTooltip();
    } else {
      this.staffScheduler.instance.hideAppointmentTooltip();
      this.editTemplateOnDoubleClick(e.appointmentData);
      this.staffScheduler.instance.hideAppointmentTooltip();
    }
  }

  editTemplateOnDoubleClick(template: RosterTemplateDO) {
    if (template) {
      const tIndex = (template.templateId > 0) ? this.templates.findIndex(t => t.templateId === template.templateId) :
        this.templates.findIndex(t => t.templateId === 0 && t.newId === template.newId);
      if (Array.isArray(template.roomId)) {
        this.templates[tIndex].roomId = template.roomId[0];
      }

      const rosterPopup = new RosterPopup(true, this.templates[tIndex]);
      this.rosterService.rosterPopupChanged(rosterPopup);
    }
    if (template.isDoctor) {
      this.doctorScheduler.instance.hideAppointmentTooltip();
    } else {
      this.staffScheduler.instance.hideAppointmentTooltip();
    }
  }

  onStaffCellClick(e: any) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;

      if (e.cellData && e.cellData.groups && e.cellData.startDate) {
        const staffId = e.cellData.groups.staffId;
        const start = new Date(e.cellData.startDate);
        const end = new Date(e.cellData.endDate);

        if (e.cellData.endDate.getHours() === 0 && e.cellData.endDate.getMinutes() === 0) {
          // is custom session, so use set start and end time
          start.setHours(this.rosterService.customStart.getHours());
          start.setMinutes(this.rosterService.customStart.getMinutes());
          const adjustDate = end.getDate() - 1;
          end.setDate(adjustDate);
          end.setHours(this.rosterService.customEnd.getHours());
          end.setMinutes(this.rosterService.customEnd.getMinutes());
        } else {
          let sessionId: number;
          if (e.cellData.startDate.getHours() === 0 && e.cellData.startDate.getMinutes() === 0) {
            sessionId = 1;
          } else {
            // is not a custom session
            if (this.numSessions > 2) {
              const mins = 1440 / this.numSessions;
              const s2Start = addMinutes(new Date(e.cellData.startDate), (0 - mins));
              const s3Start = addMinutes(new Date(e.cellData.startDate), (0 - (mins * 2)));
              const s4Start = addMinutes(new Date(e.cellData.startDate), (0 - (mins * 3)));

              if (s2Start.getHours() === 0 && s2Start.getMinutes() === 0) { sessionId = 2; }
              if (s3Start.getHours() === 0 && s3Start.getMinutes() === 0) { sessionId = 3; }
              if (s4Start.getHours() === 0 && s4Start.getMinutes() === 0) { sessionId = 4; }
            }
          }

          const session = this.sessions.find(s => s.sessionId === sessionId);
          start.setHours(session.startHour);
          start.setMinutes(session.startMinutes);
          end.setHours(session.endHour);
          end.setMinutes(session.endMinutes);
        }

        this.rosterService.addNewStaffTemplate(this.templates, staffId, start, end);
      }
    } else {
      this.timeout = setTimeout(() => { this.timeout = null; }, 400);
    }
  }

  onCellClick(e: any) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;

      if (e.cellData && e.cellData.groups && e.cellData.startDate) {
        const doctorId = e.cellData.groups.doctorId;
        const start = new Date(e.cellData.startDate);
        const end = new Date(e.cellData.endDate);

        if (e.cellData.endDate.getHours() === 0 && e.cellData.endDate.getMinutes() === 0) {
          // is custom session, so use set start and end time
          start.setHours(this.rosterService.customStart.getHours());
          start.setMinutes(this.rosterService.customStart.getMinutes());
          const adjustDate = end.getDate() - 1;
          end.setDate(adjustDate);
          end.setHours(this.rosterService.customEnd.getHours());
          end.setMinutes(this.rosterService.customEnd.getMinutes());
        } else {
          let sessionId: number;
          if (e.cellData.startDate.getHours() === 0 && e.cellData.startDate.getMinutes() === 0) {
            sessionId = 1;
          } else {
            // is not a custom session
            if (this.numSessions > 2) {
              const mins = 1440 / this.numSessions;
              const s2Start = addMinutes(new Date(e.cellData.startDate), (0 - mins));
              const s3Start = addMinutes(new Date(e.cellData.startDate), (0 - (mins * 2)));
              const s4Start = addMinutes(new Date(e.cellData.startDate), (0 - (mins * 3)));

              if (s2Start.getHours() === 0 && s2Start.getMinutes() === 0) { sessionId = 2; }
              if (s3Start.getHours() === 0 && s3Start.getMinutes() === 0) { sessionId = 3; }
              if (s4Start.getHours() === 0 && s4Start.getMinutes() === 0) { sessionId = 4; }
            }
          }

          const session = this.sessions.find(s => s.sessionId === sessionId);
          start.setHours(session.startHour);
          start.setMinutes(session.startMinutes);
          end.setHours(session.endHour);
          end.setMinutes(session.endMinutes);
        }

        this.rosterService.addNewDoctorTemplate(this.templates, doctorId, start, end);
      }
    } else {
      this.timeout = setTimeout(() => { this.timeout = null; }, 400);
    }
  }

  // delete template using button in tooltip
  deleteTemplateClicked(e: any, template: RosterTemplateDO) {
    if (template) {
      const temps = this.templates;
      const tIndex = (template.templateId > 0) ? temps.findIndex(t => t.templateId === template.templateId) :
        temps.findIndex(t => t.templateId === 0 && t.newId === template.newId);
      temps[tIndex].deleted = true;

      if (Array.isArray(template.roomId)) { this.templates[tIndex].roomId = template.roomId[0]; }

      if (this.templates[tIndex].isDoctor && this.templates[tIndex].doctorId) {
        this.doctors$.pipe(take(1)).subscribe(drs => {
          const drIndex = drs.findIndex(dr => dr.doctorId === this.templates[tIndex].doctorId);
          if (drIndex >= 0) {
            this.rosterService.subtractSessionHours(this.templates[tIndex], drs[drIndex]);
            this.removeTemplate(tIndex);
          }
        });
      } else {
        this.staff$.pipe(take(1)).subscribe(staff => {
          const sIndex = staff.findIndex(s => s.staffId === this.templates[tIndex].staffId);
          if (sIndex >= 0) {
            this.rosterService.subtractSessionHours(this.templates[tIndex], undefined, staff[sIndex]);
            this.removeTemplate(tIndex);
          }
        });
      }
    }

    e.event.stopPropagation();
  }

  onAppointmentContextMenu(e: any) {
    this.rosterService.contextMenuAppointmentData = e.appointmentData;
    this.rosterService.contextMenuTargetedAppointmentData = e.targetedAppointmentData;
  }
}
