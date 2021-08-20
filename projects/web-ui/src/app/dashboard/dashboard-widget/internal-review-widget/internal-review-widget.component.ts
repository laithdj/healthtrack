import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { KnownConfigurationScreen } from '../../../../../../../Generated/HMS.Interfaces';
import { Observable } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { InternalReviewData } from '../../../shared/models/Dashboard/InternalReviewData';

@Component({
  selector: 'app-internal-review-widget',
  templateUrl: './internal-review-widget.component.html',
  styleUrls: ['./internal-review-widget.component.css']
})
export class InternalReviewWidgetComponent {
  @Input() inactive: boolean;

  testInternalReview = new InternalReviewData([ 1, 3 ]);
  internalReviewData$: Observable<InternalReviewData>;

  constructor(private dashboardService: DashboardService,
    private stompService: StompService) {
    this.internalReviewData$ = this.dashboardService.internalReviewData$;
    // this.internalReviewData$.subscribe(_ => console.log('CONSOLE LOG INTERNAL REVIEW', _));
  }

  openWindow() {
    this.stompService.openHealthTrackWindow(KnownConfigurationScreen.InternalReview);
  }
}
