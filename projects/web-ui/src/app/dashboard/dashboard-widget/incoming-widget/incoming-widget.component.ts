import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { KnownConfigurationScreen } from '../../../../../../../Generated/HMS.Interfaces';
import { Observable } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { IncomingData } from '../../../shared/models/Dashboard/IncomingData';

@Component({
  selector: 'app-incoming-widget',
  templateUrl: './incoming-widget.component.html',
  styleUrls: ['./incoming-widget.component.css']
})
export class IncomingWidgetComponent {
  @Input() inactive: boolean;

  testIncoming = new IncomingData([ 3, 7, 1 ]);
  incomingData$: Observable<IncomingData>;

  constructor(private dashboardService: DashboardService,
    private stompService: StompService) {
    this.incomingData$ = this.dashboardService.incomingData$;
    // this.incomingData$.subscribe(_ => console.log('CONSOLE LOG INCOMING', _));
  }

  openWindow() {
    this.stompService.openHealthTrackWindow(KnownConfigurationScreen.IncomingApproval);
  }
}
