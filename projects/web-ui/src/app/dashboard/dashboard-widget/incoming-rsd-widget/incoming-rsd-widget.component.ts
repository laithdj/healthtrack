import { Component, OnInit, Input } from '@angular/core';
import { IncomingData } from '../../../shared/models/Dashboard/IncomingData';
import { Observable } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { StompService } from '../../../shared/stomp/stomp.service';
import { IncomingRSDData } from '../../../shared/models/Dashboard/IncomingRSDData';


@Component({
  selector: 'app-incoming-rsd-widget',
  templateUrl: './incoming-rsd-widget.component.html',
  styleUrls: ['./incoming-rsd-widget.component.css']
})
export class IncomingRsdWidgetComponent {
  @Input() inactive: boolean;

  testIncoming = new IncomingData([ 3, 7, 1 ]);
  incomingRSDData$: Observable<IncomingRSDData>;

  constructor(private dashboardService: DashboardService,
    private stompService: StompService) {
    this.incomingRSDData$ = this.dashboardService.incomingRSDData$;
    // this.incomingRSDData$.subscribe(_ => console.log('CONSOLE LOG INCOMING RSD', _));
  }

  openWindow() {
    this.stompService.goToIncomingRSD();
  }
}
