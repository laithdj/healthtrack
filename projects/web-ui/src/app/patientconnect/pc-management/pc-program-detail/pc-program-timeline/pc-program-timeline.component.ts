import { Component, Input } from '@angular/core';
import { ProgramDO, PcActionDO } from '../../../../../../../../Generated/CoreAPIClient';
import { addDays, differenceInDays, addYears, addMonths } from 'date-fns';
import { ProgramTimelineStepVM } from './programtimeline-step.viewmodel';

@Component({
  selector: 'app-pc-program-timeline',
  templateUrl: './pc-program-timeline.component.html',
  styleUrls: ['./pc-program-timeline.component.css']
})
export class PcProgramTimelineComponent {

  @Input() selectedProgramDO: ProgramDO;
  @Input() actionList: PcActionDO[];

  programTimeline: ProgramTimelineStepVM[];
  programTimelinePopupVisible = false;

  constructor() {}

  showProgramTimeLinePopup() {
    this.programTimeline = this.calculateSteps(this.selectedProgramDO, this.actionList);
    this.programTimelinePopupVisible = true;
  }

  calculateSteps(program: ProgramDO, actionlist: PcActionDO[]): ProgramTimelineStepVM[] {

    let referenceDate = new Date();
    const steps = new Array<ProgramTimelineStepVM>();

    if (program !== null) {

      let prevActionDate = new Date();

      for (let i = 1; i <= program.recurringCount; i++) {

        referenceDate = this.updateReferenceDateForCycle(program, referenceDate);

        for (let j = 0; j < program.actions.length; j++) {

          const action = program.actions[j];

          const actionDate  = addDays(referenceDate, action.actionDays);

          const timelineStep = new ProgramTimelineStepVM();
          timelineStep.step = action.step;
          timelineStep.cycle = i;
          timelineStep.action = actionlist.find(item => item.id === action.action).actionName;
          timelineStep.actionDate = actionDate;
          timelineStep.delay = differenceInDays(actionDate, prevActionDate);

          prevActionDate = actionDate;

          steps.push(timelineStep);
        }
      }
    }

    return steps;
  }

  updateReferenceDateForCycle(program: ProgramDO, referenceDate: Date): Date {
    switch (program.frequencyUnit) {
      case 'Y':
        return addYears(referenceDate, program.frequencyValue);

      case 'M':
        return addMonths(referenceDate, program.frequencyValue);

      case 'D':
        return addDays(referenceDate, program.frequencyValue);

      default:
        return referenceDate;
    }
  }

}
