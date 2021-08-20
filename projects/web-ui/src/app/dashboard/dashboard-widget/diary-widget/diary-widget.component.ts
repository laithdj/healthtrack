import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardService } from '../../dashboard/dashboard.service';
import { StompService } from '../../../shared/stomp/stomp.service';
import { DoctorDiaryData } from '../../../shared/models/Dashboard/DoctorDiaryData';

@Component({
  selector: 'app-diary-widget',
  templateUrl: './diary-widget.component.html',
  styleUrls: ['./diary-widget.component.css']
})
export class DiaryWidgetComponent {
  @Input() inactive: boolean;
  @Input() doctorId: number = 0;

  testDiary = new DoctorDiaryData([ 10, 2, 1 ]);
  diaryData$: Observable<DoctorDiaryData>;

  constructor(private stompService: StompService,
    private dashboardService: DashboardService) {
    this.diaryData$ = dashboardService.diaryData$;
    // this.diaryData$.subscribe(_ => console.log('CONSOLE LOG DIARY', _));
  }

  openWindow() {
    const date = new Date();
    const day = date.getDay();
    this.stompService.goToDiaryDoctor(day, this.doctorId);
  }
}
