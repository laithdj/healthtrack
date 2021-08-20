import { Component, Input, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ProgramDO, MovingConnectsDO } from '../../../../../../../../Generated/CoreAPIClient';
import { PatientConnectService } from '../../../../patientconnect/patientconnect.service';
import { DxSelectBoxComponent } from 'devextreme-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pc-program-move',
  templateUrl: './pc-program-move.component.html',
  styleUrls: ['./pc-program-move.component.css']
})
export class PcProgramMoveComponent implements OnDestroy {

  @Input() selectedProgramDO: ProgramDO;
  @Input() allEnabledPrograms: ProgramDO[];
  @Input() editMode: boolean;
  @ViewChild(DxSelectBoxComponent, { static : true }) dxSelectBox: DxSelectBoxComponent;
  @Output() initialiseMovingStepPopup = new EventEmitter<{
    movingConnects: MovingConnectsDO,
    disableMovingFrom:  boolean }>();

  private subscription: Subscription = new Subscription();

  patientCount = null;
  moveToProgramId = -1;
  moveProgramPopupVisible = false;
  movingFromDisabled = false;
  programReason: string;
  patientsToMoveCount = 0;
  movingToProgramName = '';
  allEnabledProgramsExceptMovingFrom: ProgramDO[];

  constructor(private patientConnectService: PatientConnectService) {
    this.patientConnectService = patientConnectService;
  }

  ngOnDestroy() {
  this.subscription.unsubscribe();
  }

  onMove() {
    const movingFromDisabled = Boolean(this.movingFromDisabled);
    this.subscription.add(this.patientConnectService.getMovingPatientSteps(this.selectedProgramDO.id, this.moveToProgramId)
      .subscribe(res => {
      if (res.data) {
        this.initialiseMovingStepPopup.emit({ movingConnects: res.data, disableMovingFrom: movingFromDisabled });
      } else if (res.errorMessage) {
        console.error('Error: getMovingPatientSteps - ', res.errorMessage);
      }
    }));
    this.resetMovePopup();
  }

  removeMovingProgram(allEnabledPrograms, movingFromProgramId): ProgramDO[] {
    return allEnabledPrograms.filter((program: ProgramDO) =>
       program.id !== movingFromProgramId
    );
  }

  moveProgramPopup() {
    this.subscription.add(this.patientConnectService.getActivePatientConnectsCount(this.selectedProgramDO.id).subscribe(patientCount => {
     this.patientCount = patientCount.data;
     this.moveProgramPopupVisible = true;
    }));
    this.programReason = this.selectedProgramDO.reason;
    this.moveProgramPopupVisible = true;
    this.allEnabledProgramsExceptMovingFrom = this.removeMovingProgram(this.allEnabledPrograms, this.selectedProgramDO.id);
  }

   resetMovePopup() {
     this.moveProgramPopupVisible = false;
     this.movingFromDisabled = false;
     this.dxSelectBox.instance.reset();
     this.moveToProgramId = -1;
     this.patientCount = null;
   }

   onProgramSelected(e: any) {
     if (e.value) {
      this.moveToProgramId = e.value;
      const selectedProg = this.allEnabledPrograms.filter(p => p.id === e.value);
      this.movingToProgramName = selectedProg.length === 1 ? selectedProg[0].reason : 'Patient Connect';
      this.subscription.add(this.patientConnectService.getPatientsMovingToProgramAlreadyOn(this.selectedProgramDO.id, this.moveToProgramId)
        .subscribe(res => {
        if (res || res === 0) {
          this.patientsToMoveCount = res;
        } else {
          console.error('Error: getPatientsMovingToProgramAlreadyOn');
        }
      }));
    }
   }

   onMovedFromDisabled(e: any) {
    if (e && e.event) {
      this.movingFromDisabled = e.value;
    }
  }
}
