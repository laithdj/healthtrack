import { Component, ViewEncapsulation } from '@angular/core';
import { Observable } from 'rxjs';
import { EffectedConnectsOnProgramDO, ProgramDO, ActionDO, PcActionDO } from '../../../../../../../../Generated/CoreAPIClient';
import { ActionStepVM } from './action-step.viewmodel';
import { ActionVM } from '../action-viewmodel/action.viewmodel';


@Component({
  selector: 'app-pc-action-changed',
  templateUrl: './pc-action-changed.component.html',
  styleUrls: ['./pc-action-changed.component.css'],
  encapsulation: ViewEncapsulation.Emulated
})
export class PcActionChangedComponent {
  actionChangedPopupVisible = false;
  selectedProgramDO: ProgramDO;
  selectedActions: ActionVM[];
  effectedConnects: EffectedConnectsOnProgramDO;
  commitSave: Function;
  username: string;
  newActions: ActionStepVM[];
  popupHeight = 270;
  effectedConnects$: Observable<EffectedConnectsOnProgramDO>;
  selectedProgram$: Observable<ProgramDO>;

  constructor() {}

  actionChangedPopup(bool: boolean, effectedConnects: EffectedConnectsOnProgramDO,
    selectedProgramDO: ProgramDO, selectedActions: ActionVM[], actionList: PcActionDO[], commitSave: Function) {
    const h = 180 + (effectedConnects.effectedConnectSteps.length * 40);
    this.popupHeight = h < 580 ? h : 580;
    this.effectedConnects = effectedConnects;
    selectedProgramDO.effectedConnects = effectedConnects;
    this.selectedProgramDO = selectedProgramDO;
    this.commitSave = commitSave;
    this.newActions = selectedActions.map<ActionStepVM>((action: ActionDO) => {
      return {
        step: action.step,
        stepAction: `Step ${action.step} ${actionList.find(a => a.id === action.action).actionName}`
      };
    });
    this.actionChangedPopupVisible = bool;
  }

  onSaveConfirmed(confirmed: boolean) {
    this.actionChangedPopupVisible = false;
    if (confirmed) {
      this.commitSave(this.selectedProgramDO, this.selectedProgramDO.reason);
    }
  }
}
