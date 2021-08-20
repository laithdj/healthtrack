import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { addDays } from 'date-fns/esm';

@Component({
  selector: 'app-patient-widget',
  templateUrl: './patient-widget.component.html',
  styleUrls: ['./patient-widget.component.css']
})
export class PatientWidgetComponent {
  @Input() inactive: boolean;

  constructor(
    private stompService: StompService,
  ) { }

  openToday() {
    const today: Date = new Date();
    this.stompService.goToPatientWorkList(today, 1);
  }

  openYesterday() {
    const today: Date = new Date();
    const yesterday: Date = addDays(today, -1);
    this.stompService.goToPatientWorkList(yesterday, 1);
  }

  openNextWeek() {
    const t: Date = new Date();

    t.setDate(t.getDate() + (7 - t.getDay()) % 7 + 1);
    this.stompService.goToPatientWorkList(t, 7);
  }
}
