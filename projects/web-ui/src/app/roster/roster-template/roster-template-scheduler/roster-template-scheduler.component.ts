import { Component, Input, OnDestroy, ViewChild } from '@angular/core';
import { LocationRoomDO, RosterTemplateDO, SessionDO } from '../../../../../../../Generated/CoreAPIClient';
import { take, takeUntil } from 'rxjs/operators';
import { RosterService } from '../../roster.service';
import { Subject, combineLatest } from 'rxjs';
import { DxSchedulerComponent } from 'devextreme-angular';
import * as _ from 'lodash';
import { RosterPopup } from '../../../shared/models/RosterPopup';
import { getWeekOfMonth } from 'date-fns';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app-store/reducers';

@Component({
  selector: 'app-roster-template-scheduler',
  templateUrl: './roster-template-scheduler.component.html',
  styleUrls: ['./roster-template-scheduler.component.css']
})
export class RosterTemplateSchedulerComponent implements OnDestroy {
  @ViewChild('rosterScheduler') rosterScheduler: DxSchedulerComponent;

  private _selectedDay: number;
  private _destroyed$ = new Subject<void>();

  locationRooms$ = this.rosterService.getLocationRooms();
  cellDuration$ = this.rosterService.getSchedulerCellDuration();
  templates: RosterTemplateDO[];
  currentDate$ = this.rosterService.getSchedulerCurrentDate();
  schedulerView$ = this.rosterService.getSchedulerView();
  selectedView$ = this.rosterService.getSelectedView();
  selectedSet$ = this.rosterService.getSelectedTemplateSet();
  roomResource = [];
  timeout = null;
  selectedLocationRoom$ = this.rosterService.getSelectedLocationRoom();
  contextMenuCellData: any;
  cellContextMenuItems: any[];
  selectedDayString: string;
  editedResource: any[];
  sessions: SessionDO[];
  numSessions = 1;
  view: string;
  appointmentContextMenuItems: any;
  updatedTemplate: RosterTemplateDO;
  oldTemplate: RosterTemplateDO;

  @Input() selectedWeek: number;
  @Input() set selectedDay(day: number) {
    this._selectedDay = day;
    this.selectedDayString = this.getSelectedDayString(day);
  }
  get selectedDay(): number { return this._selectedDay; }

  constructor(private rosterService: RosterService, private store: Store<AppState>) {
    this.rosterService.getSessions().pipe(takeUntil(this._destroyed$)).subscribe(sessions => {
      this.sessions = sessions;
      this.numSessions = (sessions) ? sessions.length : 0;
    });

    this.editedResource = rosterService.editedResource;
    this.rosterService.getTemplates().pipe(takeUntil(this._destroyed$)).subscribe(t => this.templates = t);

    this.rosterService.getSelectedView().pipe(takeUntil(this._destroyed$)).subscribe((v: string) => {
      if (v !== this.view) {
        rosterService.templatesUpdated(this.templates);
        this.view = v;
      }
    });

    combineLatest(this.selectedLocationRoom$, this.rosterService.getLocationRooms()).pipe(takeUntil(this._destroyed$))
      .subscribe(([lr, lrs]: any[]) => {
        this.roomResource = (lr.roomId === 0) ? lrs.filter((a: LocationRoomDO) => a.locationId === lr.locationId) : [ lr ];
      });

    this.cellContextMenuItems = [ { text: 'New Template', onItemClick: (data: any) => this.contextMenuAddTemplateClicked(data) } ];
    this.appointmentContextMenuItems = [ { text: 'Edit', onItemClick: (data: any) => this.editTemplate(data) },
      { text: 'Delete', onItemClick: (data: any) => this.deleteTemplate(data) },
      { text: 'New Template', onItemClick: (data: any) => this.appointmentAddTemplateClicked(data) } ];
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  scrollToTime() { if (this.rosterScheduler && this.rosterScheduler.instance) { this.rosterScheduler.instance.scrollToTime(6, 30); } }

  getWeek(date: Date): number {
    return getWeekOfMonth(date, { weekStartsOn: 1 });
  }

  getSelectedDayString(day: number): string {
    return (day >= 0 && day <= 6) ?
      [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ][day] : 'Unknown';
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
    if (e.component.__tooltipTimeout) {
      clearTimeout(e.component.__tooltipTimeout);
    }
    if (e.appointmentData) {
      this.rosterScheduler.instance.hideAppointmentTooltip();
      this.editTemplateOnDoubleClick(e.appointmentData);
      this.rosterScheduler.instance.hideAppointmentTooltip();
    }
  }

  editTemplateOnDoubleClick(template: RosterTemplateDO) {
    if (template) {
      const tIndex = (template.templateId > 0) ? this.templates.findIndex(t => t.templateId === template.templateId) :
        this.templates.findIndex(t => t.templateId === 0 && t.newId === template.newId);
      if (Array.isArray(template.roomId)) {
        this.templates[tIndex].roomId = template.roomId[0];
        this.rosterService.templatesUpdated(this.templates);
      }

      const rosterPopup = new RosterPopup(true, this.templates[tIndex]);
      this.rosterService.rosterPopupChanged(rosterPopup);
    }
    this.rosterScheduler.instance.hideAppointmentTooltip();
  }

  // delete template using button in tooltip
  deleteTemplateClicked(e: any, template: RosterTemplateDO) {
    if (template) {
      const temps = this.templates;
      const tIndex = (template.templateId > 0) ? temps.findIndex(t => t.templateId === template.templateId) :
        temps.findIndex(t => t.templateId === 0 && t.newId === template.newId);
      temps[tIndex].deleted = true;

      if (Array.isArray(template.roomId)) {
        this.templates[tIndex].roomId = this.rosterService.contextMenuAppointmentData.roomId[0];
      }

      if (this.templates[tIndex].isDoctor && this.templates[tIndex].doctorId) {
        this.rosterService.getDoctors().pipe(take(1)).subscribe(drs => {
          const drIndex = drs.findIndex(dr => dr.doctorId === this.templates[tIndex].doctorId);
          if (drIndex >= 0) {
            this.rosterService.subtractSessionHours(this.templates[tIndex], drs[drIndex]);
            this.removeTemplate(tIndex);
          }
        });
      } else {
        this.rosterService.getStaff().pipe(take(1)).subscribe(staff => {
          const sIndex = staff.findIndex(s => s.staffId === this.templates[tIndex].staffId);
          if (sIndex >= 0) {
            this.rosterService.subtractSessionHours(this.templates[tIndex], undefined, staff[sIndex]);
            this.removeTemplate(tIndex);
          }
        });
      }
    }

    this.rosterScheduler.instance.hideAppointmentTooltip();
    e.event.stopPropagation();
  }

  editTooltipTemplate(template: RosterTemplateDO) {
    if (template) {
      const tIndex = this.templates.findIndex(t => t.templateId === this.rosterService.contextMenuAppointmentData.templateId);
      if (Array.isArray(this.rosterService.contextMenuAppointmentData.roomId)) {
        this.templates[tIndex].roomId = this.rosterService.contextMenuAppointmentData.roomId[0];
        this.rosterService.templatesUpdated(this.templates);
      }

      const rosterPopup = new RosterPopup(true, this.templates[tIndex]);
      this.rosterService.rosterPopupChanged(rosterPopup);
      this.rosterScheduler.instance.hideAppointmentTooltip();
    }
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
        this.rosterService.getDoctors().pipe(take(1)).subscribe(drs => {
          const drIndex = drs.findIndex(dr => dr.doctorId === this.templates[tIndex].doctorId);
          if (drIndex >= 0) {
            this.rosterService.subtractSessionHours(this.templates[tIndex], drs[drIndex]);
            this.removeTemplate(tIndex);
          }
        });
      } else {
        this.rosterService.getStaff().pipe(take(1)).subscribe(staff => {
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

    if (this.rosterScheduler && this.rosterScheduler.instance) {
      this.rosterScheduler.instance.hideAppointmentTooltip();
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
        this.rosterService.templatesUpdated(this.templates);
      }

      const rosterPopup = new RosterPopup(true, this.templates[tIndex]);
      this.rosterService.rosterPopupChanged(rosterPopup);

      if (this.rosterScheduler && this.rosterScheduler.instance) { this.rosterScheduler.instance.hideAppointmentTooltip(); }
    }
  }

  onCellClick(e: any) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;

      if (e.cellData && e.cellData.groups && e.cellData.startDate) {
        this.rosterService.addNewTemplates(e.cellData.groups.roomId, e.cellData.startDate);
      }
    } else {
      this.timeout = setTimeout(() => { this.timeout = null; }, 400);
    }
  }

  stopPropagation(e: any) { e.stopPropagation(); }

  onAppointmentUpdating(e: any) {
    if (e && e.newData && e.oldData) {
      this.updatedTemplate = e.newData;
      this.oldTemplate = e.oldData;
    }
  }

  onTemplateUpdated(e: any) {
    if (e && e.appointmentData && this.rosterService.isValidTemplateEdit(this.templates, e.appointmentData)) {
      const idx = this.templates.findIndex(t => (t.templateId > 0) ?
        t.templateId === e.appointmentData.templateId : t.newId === e.appointmentData.newId);
      const newTemplate = _.cloneDeep(this.templates[idx]);
      const session = this.sessions.find(s => s.startHour === e.appointmentData.trueStartDate.getHours() &&
        s.startMinutes === e.appointmentData.trueStartDate.getMinutes() && s.endHour === e.appointmentData.trueEndDate.getHours()
        && s.endMinutes === e.appointmentData.trueEndDate.getMinutes());
      newTemplate.edited = true;
      newTemplate.sessionId = (session) ? session.sessionId : 0;
      newTemplate.roomId = (Array.isArray(e.appointmentData.roomId)) ? e.appointmentData.roomId[0] : e.appointmentData.roomId;
      this.templates[idx] = newTemplate;
      this.rosterService.templatesUpdated(this.templates);

      if (newTemplate.isDoctor && newTemplate.doctorId) {
        this.rosterService.recalculateHoursForDoctor(newTemplate.doctorId, this.templates);
      } else {
        this.rosterService.recalculateHoursForStaffMember(newTemplate.staffId, this.templates);
      }
    } else {
      // undo the change
      const index = (e.appointmentData.templateId === 0) ?
        this.templates.findIndex(t => t.templateId === 0 && t.newId === e.appointmentData.newId) :
        this.templates.findIndex(t => t.templateId === e.appointmentData.templateId);
      this.templates[index] = this.oldTemplate;
      this.rosterService.templatesUpdated(this.templates);
    }
  }

  contextMenuAddTemplateClicked(data?: any) {
    if (data && this.contextMenuCellData && this.contextMenuCellData.groups) {
      this.rosterService.addNewTemplates(this.contextMenuCellData.groups.roomId, this.contextMenuCellData.startDate);
    }
  }

  appointmentAddTemplateClicked(data?: any) {
    if (this.rosterService.contextMenuAppointmentData) {
      this.rosterService.addNewTemplates(this.rosterService.contextMenuAppointmentData.roomId,
        this.rosterService.contextMenuAppointmentData.trueStartDate);
    }
  }

  onCellContextMenu(e: any) {
    this.contextMenuCellData = e.cellData;
    this.selectedLocationRoom$.pipe(take(1)).subscribe(lr => {
      this.cellContextMenuItems[0].text = 'New Template (' + this.getRoomName(e.cellData.groups.roomId, lr.locationId) + ')';
    });
  }

  getRoomName(roomId: number, locationId: number): string {
    let roomName = 'Any Room';
    if (roomId === 0) { return roomName; }
    this.locationRooms$.pipe(take(1)).subscribe(lrs =>
      roomName = lrs.find(lr => lr.locationId === locationId && lr.roomId === roomId).roomName);
    return roomName;
  }

  onAppointmentContextMenu(e: any) {
    if (e) {
      this.rosterService.contextMenuAppointmentData = e.appointmentData;
      this.rosterService.contextMenuTargetedAppointmentData = e.targetedAppointmentData;
      this.appointmentContextMenuItems[2].text = 'New Template (' +
        this.getRoomName(e.appointmentData.roomId, e.appointmentData.locationId) + ')';
    }
  }

  onContextMenuItemClick(e: any) { e.itemData.onItemClick(e.itemData); }
}
