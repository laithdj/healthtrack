import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { KnownConfigurationScreen } from '../../../../../../../Generated/HMS.Interfaces';
import { Observable } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ManualMatchingData } from '../../../shared/models/Dashboard/ManualMatchingData';

@Component({
  selector: 'app-manual-matching-widget',
  templateUrl: './manual-matching-widget.component.html',
  styleUrls: ['./manual-matching-widget.component.css']
})
export class ManualMatchingWidgetComponent {
  @Input() inactive: boolean;

  testManualmatching = new ManualMatchingData([2]);
  manualMatchingData$: Observable<ManualMatchingData>;

  constructor(private dashboardService: DashboardService,
    private stompService: StompService) {
    this.manualMatchingData$ = this.dashboardService.manualMatchingData$;
    // this.manualMatchingData$.subscribe(_ => console.log('CONSOLE LOG MANUAL MATCHING', _));
   }

  openWindow() {
    this.stompService.openHealthTrackWindow(KnownConfigurationScreen.ManualMatching);
  }
}
