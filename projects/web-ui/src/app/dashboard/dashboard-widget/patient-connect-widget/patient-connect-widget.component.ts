import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';

@Component({
  selector: 'app-patient-connect-widget',
  templateUrl: './patient-connect-widget.component.html',
  styleUrls: ['./patient-connect-widget.component.css']
})
export class PatientConnectWidgetComponent {
  @Input() inactive: boolean;

  constructor(
    private stompService: StompService,
  ) { }

  openWindow() {
    this.stompService.goToPatientConnectPracticeWide();
  }
}
