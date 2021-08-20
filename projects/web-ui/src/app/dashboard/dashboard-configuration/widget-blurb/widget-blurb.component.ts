import { Component, Input} from '@angular/core';
import { DashboardWidget } from '../../../../../../../Generated/HMS.Interfaces';

@Component({
  selector: 'app-widget-blurb',
  templateUrl: './widget-blurb.component.html',
  styleUrls: ['./widget-blurb.component.css']
})
export class WidgetBlurbComponent {
  @Input() widget: DashboardWidget;

  blurb: string;

  constructor() { }

  getWidgetBlurb(): string {
    switch (this.widget) {
      case DashboardWidget.Diary: return 'Check your appointments for today';
      case DashboardWidget.Tasks: return 'Check your tasks for today';
      case DashboardWidget.Documents: return 'Documents assigned to you that need attention';
      case DashboardWidget.Incoming: return 'Incoming documents that need your attention';
      case DashboardWidget.Patient: return 'Check your patients for different periods';
      case DashboardWidget.InternalReview: return 'Documents that need to be reviewed';
      case DashboardWidget.ClinicalRecords: return 'Clinical Records assigned to you that need attention';
      case DashboardWidget.InitialContact: return 'Initial Contact';
      case DashboardWidget.Triage: return 'Triage cases for you to view';
      case DashboardWidget.IncomingMatching: return 'Incoming documents to be matched';
      case DashboardWidget.Messenger: return 'Send an email';
      case DashboardWidget.PatientConnect: return 'Dashboard Access to patient connect';
      case DashboardWidget.LocationDiary: return 'View appointments for a specific location';
      case DashboardWidget.BillingWorksheet: return 'Open the patient billing worksheet for the current patient';
      case DashboardWidget.NewRequest: return 'Open a new request for the current patient';
    }
  }
}
