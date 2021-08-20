import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardConfigurationComponent } from './dashboard-configuration.component';
import { DashboardConfigurationRoutingModule } from './dashboard-configuration-routing.module';
import { DxSelectBoxModule, DxButtonModule, DxNumberBoxModule, DxTextBoxModule, DxPopupModule, DxListModule } from 'devextreme-angular';
import { DashboardWidgetModule } from '../dashboard-widget/dashboard-widget.module';
import { DashboardClient, LocationClient, RolesClient } from '../../../../../../Generated/CoreAPIClient';
import { SharedModule } from '../../shared/shared.module';
import { RoleDefaultDashboardComponent } from './role-default-dashboard/role-default-dashboard.component';
import { DashboardService } from '../dashboard/dashboard.service';
import { WidgetBlurbComponent } from './widget-blurb/widget-blurb.component';

@NgModule({
  declarations: [
    DashboardConfigurationComponent,
    RoleDefaultDashboardComponent,
    WidgetBlurbComponent
  ],
  imports: [
    CommonModule,
    DashboardWidgetModule,
    DxSelectBoxModule,
    DxButtonModule,
    DxTextBoxModule,
    DxPopupModule,
    DxListModule,
    DxNumberBoxModule,
    SharedModule,
    DashboardConfigurationRoutingModule
  ],
  providers: [
    DashboardClient,
    LocationClient,
    RolesClient,
    DashboardService
  ]
})
export class DashboardConfigurationModule { }
