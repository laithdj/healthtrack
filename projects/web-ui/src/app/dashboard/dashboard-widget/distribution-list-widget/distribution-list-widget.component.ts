import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { Observable } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { DistributionListData } from '../../../shared/models/Dashboard/DistributionListData';


@Component({
  selector: 'app-distribution-list-widget',
  templateUrl: './distribution-list-widget.component.html',
  styleUrls: ['./distribution-list-widget.component.css']
})
export class DistributionListWidgetComponent {
  @Input() inactive: boolean;

  testDistributionList = new DistributionListData([2]);
  distributionListData$: Observable<DistributionListData>;

  constructor(private dashboardService: DashboardService,
    private stompService: StompService) {
    this.distributionListData$ = this.dashboardService.distributionListData$;
    // this.distributionListData$.subscribe(_ => console.log('CONSOLE LOG DISTRIBUTION LIST', _));
  }

  openWindow() { }
}
