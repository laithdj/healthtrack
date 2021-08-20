import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { DashboardService } from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-triage-widget',
  templateUrl: './triage-widget.component.html',
  styleUrls: ['./triage-widget.component.css']
})
export class TriageWidgetComponent {
  @Input() inactive: boolean;

  constructor(private stompService: StompService,
    private dashboardService: DashboardService) { }

  openWindow() {
    this.stompService.goToTriage();
  }
}
