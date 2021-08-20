import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { Observable } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { DocumentsData } from '../../../shared/models/Dashboard/DocumentsData';

@Component({
  selector: 'app-documents-widget',
  templateUrl: './documents-widget.component.html',
  styleUrls: ['./documents-widget.component.css']
})
export class DocumentsWidgetComponent {
  @Input() inactive: boolean;

  testDocuments = new DocumentsData([ 4, 72 ]);
  documentsData$: Observable<DocumentsData>;

  constructor(private dashboardService: DashboardService,
    private stompService: StompService) {
    this.documentsData$ = this.dashboardService.documentsData$;
    //this.documentsData$.subscribe(_ => console.log('CONSOLE LOG DOCUMENTS', _));
  }

  openWindow() {
    this.stompService.goToDocumentManagement('Letters', 0);
  }
}
