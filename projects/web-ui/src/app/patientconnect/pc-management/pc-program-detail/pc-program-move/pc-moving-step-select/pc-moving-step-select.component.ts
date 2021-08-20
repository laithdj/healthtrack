import { Component, ViewEncapsulation, Input, OnChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MovingConnectsDO, ProgramDO } from '../../../../../../../../../Generated/CoreAPIClient';
import { PatientConnectService } from '../../../../../patientconnect/patientconnect.service';
import notify from 'devextreme/ui/notify';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-moving-step-select',
  templateUrl: './pc-moving-step-select.component.html',
  styleUrls: ['./pc-moving-step-select.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})

export class PcMovingStepSelectComponent implements OnChanges, OnDestroy {

  popupHeight = 270;
  @Input() movingStepSelectPopupVisible = false;
  @Output() movingStepSelectPopupVisibleChange = new EventEmitter<boolean>();
  @Input() error: string;
  @Output() errorChange = new EventEmitter<string>();
  @Input() movingConnects: MovingConnectsDO;
  @Input() username: string;
  @Input() disableMovingFrom: boolean;
  @Input() selectedProgramDO: ProgramDO;

  private subscription: Subscription = new Subscription();

  allNextStepsSelected = false;

  constructor(private patientConnectService: PatientConnectService) {
    this.patientConnectService = patientConnectService;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnChanges() {
    if (this.movingConnects) {
    const h = 180 + (this.movingConnects.movingConnectSteps.length * 40);
    this.popupHeight = h < 580 ? h : 580;
    }
  }

  onMoveConfirmed() {
    this.movingConnects.userLastModified = this.username;
    this.subscription.add(this.patientConnectService.movePatientsToAnotherProgram(this.movingConnects).subscribe(res => {
      notify({ message: `${res} ${res > 1 ? 'patients' : 'patient'} moved`, maxWidth: '300px', position: { at: 'right bottom', offset: '-200 -50' } }, 'success', 2000);
      this.movingStepSelectPopupVisibleChange.emit(false);
    }));
    if (this.disableMovingFrom) {
        const selectedProgramDO = Object.assign({}, this.selectedProgramDO);
        selectedProgramDO.enabled = false;
        selectedProgramDO.userLastModified = this.username;
        this.subscription.add(this.patientConnectService.saveProgram(selectedProgramDO).subscribe(res => {
            if (res.errorMessage && res.errorMessage.length > 0) {
                this.errorChange.emit(`${selectedProgramDO.reason} not disabled!`);
            }
        }));
    }
  }

  onMoveCancelled() {
      this.movingStepSelectPopupVisibleChange.emit(false);
  }

  nextStepValueChanged() {
      this.allNextStepsSelected = this.movingConnects && this.movingConnects.movingConnectSteps &&
        this.movingConnects.movingConnectSteps.filter(step => step.afterMoveNextStep === 0).length === 0 ? true : false;
  }

}
