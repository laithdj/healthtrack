import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { DashboardService } from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-worksheet-widget',
  templateUrl: './worksheet-widget.component.html',
  styleUrls: ['./worksheet-widget.component.css']
})
export class WorksheetWidgetComponent {
  @Input() inactive: boolean;


  constructor(private dashboardService: DashboardService,
    private stompService: StompService) {
    //this.WorksheetData$.subscribe(_ => console.log('CONSOLE LOG CLINICAL RECORDS', _));
  }

  openWindow() {
    this.stompService.goToBillingWorksheet();
  }
}
