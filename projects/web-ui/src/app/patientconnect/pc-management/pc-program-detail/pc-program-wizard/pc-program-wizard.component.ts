import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { DxValidationGroupComponent } from 'devextreme-angular';
import * as _ from 'lodash';
import { SetError } from '../../../../app-store/app-ui-state.actions';
import { AppState } from '../../../../app-store/reducers';
import {
  ProgramTypeDO,
  ProgramDO,
  ProgramType,
  BookingToCompleteType,
} from '../../../../../../../../Generated/CoreAPIClient';

@Component({
  selector: 'app-pc-program-wizard',
  templateUrl: './pc-program-wizard.component.html',
  styleUrls: ['./pc-program-wizard.component.css'],
})
export class PcProgramWizardComponent {
  private _programTypes: ProgramTypeDO[];

  @ViewChild('new_program') newProgram: DxValidationGroupComponent;

  @Input() showWizard: boolean;
  @Input() selectedProgramDO: ProgramDO;
  @Input() frequencyRadioGroupItems: [{ id: string, name: string }];
  @Input() set programTypes(types: ProgramTypeDO[]) {
    this._programTypes = types;
    const typesList = _.cloneDeep(types);
    const idx = typesList?.findIndex((a) => a.id === ProgramType.General);
    const general = idx > -1 ? _.cloneDeep(typesList[idx]) : undefined;

    if (general) {
      typesList.splice(idx, 1);
      typesList.unshift(general);
    }

    this.orderedProgramTypes = typesList;
  }
  get programTypes(): ProgramTypeDO[] {
    return this._programTypes;
  }

  @Output() loadNewProgram = new EventEmitter<ProgramDO>();
  @Output() showWizardChange = new EventEmitter<boolean>();

  programType = 'General';
  orderedProgramTypes: ProgramTypeDO[];

  constructor(private store: Store<AppState>) { }

  updateProgramType(e: any) {
    if (e.value && typeof e.value === 'number' && e.value > 0) {
      const programType = e?.value as ProgramType;
      const selectedIdx = this.programTypes.findIndex((a) => a.id === programType);
      this.programType = selectedIdx > -1 ? this.programTypes[selectedIdx].typeName
        : this.orderedProgramTypes[0].typeName;
      this.selectedProgramDO.bookingToCompleteType = programType === ProgramType.Recall
        || programType === ProgramType.Program || programType === ProgramType.General
        ? BookingToCompleteType.Ignore : BookingToCompleteType.Any;

      if (programType === ProgramType.Referral || programType === ProgramType.Booking) {
        this.selectedProgramDO.recurringCount = 1;
      }
    }
  }

  onContinue = () => {
    if (!this.selectedProgramDO.reason || this.selectedProgramDO.reason.trim().length === 0) {
      this.store.dispatch(new SetError({ errorMessages: ['Name cannot be empty.'] }));
    } else if (this.selectedProgramDO.type < ProgramType.Recall || this.selectedProgramDO.type > ProgramType.General) {
      this.store.dispatch(new SetError({ errorMessages: ['Invalid Patient Connect Type.'] }));
    } else if (this.selectedProgramDO.recurringCount < 1 || this.selectedProgramDO.frequencyValue < 1
      || !this.selectedProgramDO.frequencyUnit || this.selectedProgramDO.frequencyUnit?.trim().length === 0) {
      this.store.dispatch(new SetError({ errorMessages: ['Invalid Cycle Configuration.'] }));
    } else {
      this.loadNewProgram.emit(_.cloneDeep(this.selectedProgramDO));
      this.newProgram.instance.reset();
    }
  }

  onCancel() {
    this.showWizardChange.emit(false);
  }

  onSetFrequency(i: number) {
    this.selectedProgramDO.frequencyValue = i;
  }
}
