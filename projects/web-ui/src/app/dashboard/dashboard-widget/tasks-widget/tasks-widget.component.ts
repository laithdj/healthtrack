import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Observable } from 'rxjs';
import { TasksData } from '../../../shared/models/Dashboard/TasksData';

@Component({
  selector: 'app-tasks-widget',
  templateUrl: './tasks-widget.component.html',
  styleUrls: ['./tasks-widget.component.css']
})
export class TasksWidgetComponent {
  @Input() inactive: boolean;

  testTasks = new TasksData([ 2, 3, 1 ]);
  tasksData$: Observable<TasksData>;

  constructor(private stompService: StompService,
    private dashboardService: DashboardService) {
    this.tasksData$ = this.dashboardService.tasksData$;
    //this.tasksData$.subscribe(_ => console.log('CONSOLE LOG TASKS', _));
  }

  openWindow() {
    this.stompService.goToTaskList();
  }
}
