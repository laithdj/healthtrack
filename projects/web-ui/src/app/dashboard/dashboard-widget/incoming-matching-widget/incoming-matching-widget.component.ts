import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { Observable } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { IncomingMatchingData } from '../../../shared/models/Dashboard/IncomingMatchingData';

@Component({
  selector: 'app-incoming-matching-widget',
  templateUrl: './incoming-matching-widget.component.html',
  styleUrls: ['./incoming-matching-widget.component.css']
})
export class IncomingMatchingWidgetComponent {
  @Input() inactive: boolean;

  testIncomingMatching = new IncomingMatchingData([ 1999 ]);
  incomingMatchingData$: Observable<IncomingMatchingData>;

  constructor(private dashboardService: DashboardService,
    private stompService: StompService) {
    this.incomingMatchingData$ = this.dashboardService.incomingMatchingData$;
    //this.incomingMatchingData$.subscribe(_ => console.log('CONSOLE LOG INCOMING MATCHING', _));
  }

  openWindow() {
    this.stompService.goToIncomingMatching();
  }
}
