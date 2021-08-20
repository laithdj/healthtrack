import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RosterTemplateComponent } from './roster-template.component';
import { RosterTemplateRoutingModule } from './roster-template-routing.module';
import { DxFormModule, DxSchedulerModule, DxSelectBoxModule, DxLoadPanelModule, DxPopupModule, DxButtonModule,
  DxDateBoxModule, DxValidatorModule, DxRadioGroupModule, DxCheckBoxModule, DxCalendarModule, DxContextMenuModule,
  DxTextBoxModule, DxNumberBoxModule, DxTextAreaModule, DxListModule } from 'devextreme-angular';
import { RosterTemplateSchedulerComponent } from './roster-template-scheduler/roster-template-scheduler.component';
import { LocationClient, RosterTemplateClient } from '../../../../../../Generated/CoreAPIClient';
import { RosterService } from '../roster.service';
import { RosterTemplateSetComponent } from './roster-template-set/roster-template-set.component';
import { DoctorSchedulerComponent } from './roster-template-scheduler/doctor-scheduler/doctor-scheduler.component';
import { RosterTemplatePopupComponent } from './roster-template-scheduler/roster-template-popup/roster-template-popup.component';
import { RosterTemplateApplyComponent } from './roster-template-apply/roster-template-apply.component';
import { RosterHelpers } from '../roster-helpers';
import { SplitRosterComponent } from './split-roster/split-roster.component';
import { RosterDetailsComponent } from './split-roster/roster-details/roster-details.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    RosterTemplateComponent,
    RosterTemplateSchedulerComponent,
    RosterTemplatePopupComponent,
    RosterTemplateSetComponent,
    DoctorSchedulerComponent,
    RosterTemplateApplyComponent,
    SplitRosterComponent,
    RosterDetailsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DxFormModule,
    DxSchedulerModule,
    DxSelectBoxModule,
    DxListModule,
    DxLoadPanelModule,
    DxPopupModule,
    DxButtonModule,
    DxNumberBoxModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxValidatorModule,
    DxRadioGroupModule,
    DxCheckBoxModule,
    DxCalendarModule,
    DxTextAreaModule,
    DxContextMenuModule,
    RosterTemplateRoutingModule
  ],
  providers: [
    RosterService,
    RosterHelpers,
    LocationClient,
    RosterTemplateClient
  ]
})
export class RosterTemplateModule { }
