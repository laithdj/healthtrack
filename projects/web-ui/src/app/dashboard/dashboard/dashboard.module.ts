import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxSelectBoxModule, DxButtonModule } from 'devextreme-angular';
import { DashboardWidgetModule } from '../dashboard-widget/dashboard-widget.module';
import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardClient } from '../../../../../../Generated/CoreAPIClient';
import { DashboardService } from './dashboard.service';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    DashboardWidgetModule,
    DashboardRoutingModule,
    DxSelectBoxModule,
    DxButtonModule,
  ],
  providers: [
    DashboardClient,
    DashboardService,
  ],
})
export class DashboardModule { }
