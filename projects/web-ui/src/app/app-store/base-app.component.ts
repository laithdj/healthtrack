import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { selectEditMode, selectUserName } from './app-ui.selectors';
import { ToggleEditMode } from './app-ui-state.actions';

@Component({
  selector: 'app-base-app',
  templateUrl: './base-app.component.html',
  styleUrls: ['./base-app.component.css']
})
export class BaseAppComponent implements OnInit {
  editMode$ = this.appUiStore.pipe(select(selectEditMode));
  username = '';

  constructor(private appUiStore: Store<any>) { }

  ngOnInit(): void {
    this.appUiStore.pipe(select(selectUserName)).subscribe(username => this.username = username);
  }

  onToggleEdit() {
    this.appUiStore.dispatch(new ToggleEditMode());
  }
}
