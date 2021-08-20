import { Component, Input } from '@angular/core';
import { PatientProgram, PatientConnectLogDO } from '../../../../../../../../../Generated/CoreAPIClient';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent {
  @Input() selectedProgram: PatientProgram;
  @Input() selectedLog: PatientConnectLogDO;

  showAll = false;

  constructor() { }

  onSelectionChanged (e: any) {
    const selectedLogs = e.selectedRowsData;
    if (selectedLogs && selectedLogs.length === 1) {
      this.selectedLog = selectedLogs[0];
    }
  }

}
