import {
  Component, Input, ViewEncapsulation, OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { PageQuery } from '../../../../shared/pagequery';
import {
  PatientProgramOnProgramDO,
  ProgramDO,
  PatientProgramOnProgramResponse,
} from '../../../../../../../../Generated/CoreAPIClient';
import { PatientConnectService } from '../../../../patientconnect/patientconnect.service';

@Component({
  selector: 'app-pc-patients-on-program',
  templateUrl: './pc-patients-on-program.component.html',
  styleUrls: ['./pc-patients-on-program.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})

export class PcPatientsOnProgramComponent implements OnDestroy {
  @Input() selectedProgramDO: ProgramDO;

  private subscription: Subscription = new Subscription();

  patientsOnProgramPopupVisible = false;
  patientsOnProgram: PatientProgramOnProgramDO[];
  title: string;

  constructor(private patientConnectService: PatientConnectService) {
    this.patientConnectService = patientConnectService;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  handleShowPopup() {
    const pageQuery = new PageQuery();
    pageQuery.pageIndex = 1;
    pageQuery.pageSize = 25;
    this.subscription.add(this.patientConnectService.getPatientsOnProgram(this.selectedProgramDO.id, pageQuery)
      .subscribe((pop: PatientProgramOnProgramResponse) => {
        this.patientsOnProgram = pop.patientsOnProgram;
        this.title = `Patients on ${this.selectedProgramDO.reason} - Total: ${pop.totalPatientsOnProgram}`;
      }));
    this.patientsOnProgramPopupVisible = true;
  }
}
