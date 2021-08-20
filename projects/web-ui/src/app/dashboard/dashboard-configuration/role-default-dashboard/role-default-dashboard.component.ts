import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RoleDO, RolesClient, APIResponseOfRoleDOOf, APIResponseOfBoolean, DashboardDO } from '../../../../../../../Generated/CoreAPIClient';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app-store/reducers';
import { SetError } from '../../../app-store/app-ui-state.actions';
import * as _ from 'lodash';

@Component({
  selector: 'app-role-default-dashboard',
  templateUrl: './role-default-dashboard.component.html',
  styleUrls: ['./role-default-dashboard.component.css']
})
export class RoleDefaultDashboardComponent {
  private _showPopup: boolean;

  // fetch roles on popup open, clone list for editing to enable undo changes
  @Input() set showPopup(showPopup: boolean) {
    this._showPopup = showPopup;
    if (showPopup === true) {
      this.rolesClient.getAllRoles().subscribe((result: APIResponseOfRoleDOOf) => {
        if (result.errorMessage && result.errorMessage.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [ result.errorMessage ] }));
        } else {
          this.roles = result.data;
          this.editRoles = _.cloneDeep(this.roles);
          this.loading = false;
        }
      });
    }
  }
  get showPopup(): boolean {
    return this._showPopup;
  }

  @Input() dashboards: DashboardDO[];

  @Output() rolesUpdated: EventEmitter<boolean> = new EventEmitter();

  roles: RoleDO[];
  editRoles: RoleDO[];
  loading = true;

  constructor(private rolesClient: RolesClient,
    private store: Store<AppState>) { }

  closePopupNoChanges() {
    this.showPopup = false;
    this.rolesUpdated.emit(false);
  }

  undoChanges() {
    this.editRoles = _.cloneDeep(this.roles);
  }

  updateRoleDashboards() {
    this.rolesClient.updateAllRoles(this.editRoles).subscribe((result: APIResponseOfBoolean) => {
      if (result.errorMessage && result.errorMessage.length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [ result.errorMessage ] }));
      } else {
        this.showPopup = false;
        this.rolesUpdated.emit(true);
      }
    });
  }
}
