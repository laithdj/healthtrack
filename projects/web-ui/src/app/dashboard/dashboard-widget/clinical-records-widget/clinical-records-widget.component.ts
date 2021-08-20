import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { Observable } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { ClinicalRecordsData } from '../../../shared/models/Dashboard/ClinicalRecordsData';

@Component({
  selector: 'app-clinical-records-widget',
  templateUrl: './clinical-records-widget.component.html',
  styleUrls: ['./clinical-records-widget.component.css']
})
export class ClinicalRecordsWidgetComponent {
  @Input() inactive: boolean;

  testClinicalRecords = new ClinicalRecordsData([ 45, 112 ]);
  clinicalRecordsData$: Observable<ClinicalRecordsData>;

  constructor(private dashboardService: DashboardService,
    private stompService: StompService) {
    this.clinicalRecordsData$ = this.dashboardService.clinicalRecordsData$;
    //this.clinicalRecordsData$.subscribe(_ => console.log('CONSOLE LOG CLINICAL RECORDS', _));
  }

  openWindow() {
    this.stompService.goToDocumentManagement('Clinical', 0);
  }
}
