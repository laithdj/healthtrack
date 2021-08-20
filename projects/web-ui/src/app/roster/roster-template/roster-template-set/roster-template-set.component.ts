import { Component } from '@angular/core';
import * as _ from 'lodash';
import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { confirm } from 'devextreme/ui/dialog';
import { RosterService } from '../../roster.service';
import { RosterTemplateSetDO } from '../../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../../app-store/app-ui-state.actions';
import { AppState } from '../../../app-store/reducers';

@Component({
  selector: 'app-roster-template-set',
  templateUrl: './roster-template-set.component.html',
  styleUrls: ['./roster-template-set.component.css'],
})
export class RosterTemplateSetComponent {
  templateSets$ = this.rosterService.getTemplateSets();
  selectedSet$ = this.rosterService.getSelectedTemplateSet();
  showSetPopup = false;
  editMode = false;
  isNew = false;
  cycleOptions = [7, 14, 21, 28];
  selectedCycleOption = this.cycleOptions[0];
  editRosterSet: RosterTemplateSetDO;
  popupTitle = 'Manage Template Sets';
  loading$ = this.rosterService.getLoading();
  rosterTemplateSets$ = this.rosterService.getTemplateSets();
  selectedSet: any;

  constructor(private rosterService: RosterService,
    private store: Store<AppState>) { }

  onSetChanged(e: any) {
    const template = e.value as RosterTemplateSetDO;
    if (template && template.id) {
      this.rosterService.selectedTemplateSetChanged(template, false);
    }
  }

  onDuplicateSetChanged() {
    this.selectedCycleOption = this.selectedSet.cycleLength;
  }

  onManageSetsClicked = () => {
    this.selectedSet$.pipe(take(1)).subscribe((set: RosterTemplateSetDO) => {
      this.editRosterSet = _.cloneDeep(set);
      return set;
    });
    this.selectedCycleOption = this.editRosterSet.cycleLength;
    this.editMode = false;
    this.isNew = false;
    this.popupTitle = 'Manage Template Sets';
    this.showSetPopup = true;
    this.selectedSet = undefined;
  }

  onCloseClicked() {
    this.showSetPopup = false;
    this.editMode = false;
  }

  onNewSetClicked() {
    this.isNew = true;
    const newSet = new RosterTemplateSetDO();
    newSet.templateSetName = 'New Roster Template Set';
    this.editRosterSet = newSet;
    this.selectedCycleOption = (this.cycleOptions?.length > 0) ? this.cycleOptions[0] : undefined;
    this.popupTitle = 'Create New Set';
    this.editMode = true;
  }

  duplicateRosterSet(selectedSet: RosterTemplateSetDO) {
    if (this.cycleOptions.some((o) => o === this.selectedCycleOption)
      && this.editRosterSet.templateSetName.trim().length > 0) {
      this.editRosterSet.cycleLength = this.selectedCycleOption;
      this.rosterService.duplicateRosterSet(selectedSet.id, this.editRosterSet.templateSetName,
        this.editRosterSet.cycleLength);
      this.showSetPopup = false;
    } else {
      this.store.dispatch(new SetError({ errorMessages: ['Set name cannot be empty'] }));
    }
  }

  onSaveClicked() {
    if (this.isNew) {
      if (this.selectedSet) {
        this.selectedSet$.pipe(take(1)).subscribe((set) => {
          if (this.selectedCycleOption < set.cycleLength) {
            const result = confirm('Reducing the Cycle Length will result in any templates on days'
              + ' outside<br>of the new cycle length not being duplicated to the new set.<br><br>Do'
              + ' you wish to continue?', 'Confirm Cycle Length Change');
            result.then((dialogResult: boolean) => {
              if (dialogResult) {
                this.duplicateRosterSet(set);
              }
            });
          } else {
            this.duplicateRosterSet(set);
          }
        });
      } else if (this.cycleOptions.some((o) => o === this.selectedCycleOption)
          && this.editRosterSet.templateSetName.trim().length > 0) {
        this.rosterService.addNewRosterSet(this.editRosterSet.templateSetName, this.selectedCycleOption);
        this.showSetPopup = false;
      } else {
        this.store.dispatch(new SetError({ errorMessages: ['Set name cannot be empty'] }));
      }
    } else {
      if (!this.editRosterSet.templateSetName || this.editRosterSet.templateSetName.trim().length < 1) {
        this.store.dispatch(new SetError({
          errorMessages: ['Roster Template Set name cannot be empty'],
          title: 'Invalid Set Name',
        }));
        return;
      }
      if (this.editRosterSet.templateSetName.length > 100) {
        this.store.dispatch(new SetError(
          { errorMessages: ['Set name length cannot exceed 100 characters.'], title: 'Invalid Set Name' }));
        return;
      }
      if (this.selectedCycleOption < this.editRosterSet.cycleLength) {
        const result = confirm('Reducing the cycle length will result in any existing templates on<br/>'
          + 'days outside of the new cycle to be deleted.<br/><br/>Deleted templates cannot be recovered. '
          + '<br/><br/>Do you wish to continue?', 'Confirm Cycle Length Change');
        result.then((dialogResult: boolean) => {
          if (dialogResult) {
            this.editRosterSet.cycleLength = this.selectedCycleOption;
            this.rosterService.updateRosterSet(this.editRosterSet);
            this.showSetPopup = false;
          }
        });
      } else {
        this.editRosterSet.cycleLength = this.selectedCycleOption;
        this.rosterService.updateRosterSet(this.editRosterSet);
        this.showSetPopup = false;
      }
    }
  }

  onCancelChangesClicked() {
    this.selectedSet$.pipe(take(1)).subscribe((set: RosterTemplateSetDO) => {
      this.editRosterSet = _.cloneDeep(set);
      return set;
    });

    this.selectedCycleOption = this.editRosterSet.cycleLength;
    this.editMode = false;
    this.popupTitle = 'Manage Template Sets';
    this.isNew = false;
    this.selectedSet = undefined;
  }

  onCycleChanged = (data: any) => {
    this.selectedCycleOption = this.cycleOptions.find((option) => option === data.value);
  }

  onDeleteSetClicked() {
    let setName: string;
    this.selectedSet$.pipe(take(1)).subscribe((set) => {
      setName = set.templateSetName;
      return set;
    });

    const result = confirm(`This action will permanently delete the ${setName} Set and all of the included `
      + 'templates. <br/><br/>Deleted sets and templates cannot be recovered.<br/><br/> Do'
      + ' you wish to continue?', 'Confirm Set Deletion');

    result.then((dialogResult: boolean) => {
      if (dialogResult) { this.rosterService.deleteRosterSet(this.editRosterSet); }
    });
  }
}
