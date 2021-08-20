import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EchocardiogramAppState } from './store/echocardiogram.reducers';
import { Store, select } from '@ngrx/store';
import { selectDoctorId, selectEditMode } from '../../app-store/app-ui.selectors';
import { SetEditMode } from '../../app-store/app-ui-state.actions';

@Component({
  selector: 'app-echocardiogram',
  templateUrl: './echocardiogram.component.html',
  styleUrls: ['./echocardiogram.component.css']
})
export class EchocardiogramComponent implements OnInit {
  private _showReport = false;

  doctorId$ = this.store.pipe(select(selectDoctorId));
  newClinicalRecordPlaceholder = { id: 0, reportContent: 'report content' };
  editMode$ = this.store.pipe(select(selectEditMode));
  openNav = true;
  btnOptions = { icon: 'menu', onClick: () => this.openNav = !this.openNav };
  navigation: any[] = [
    { id: 1, text: 'Clinical Detail' },
    { id: 2, text: 'MMode/2D' }
  ];
  showSmartText = false;

  constructor(private title: Title, private store: Store<EchocardiogramAppState>) { }

  ngOnInit() {
    this.title.setTitle('Echocardiogram Clinical Record');
  }

  toggleShowReport = () => {
    this._showReport = !this._showReport;
    // this.store.dispatch(new ShowReportToggled(this._showReport));
  }

  toggleShowSmartText = () => {
    this.showSmartText = !this.showSmartText;
    // this.store.dispatch(new ShowSmartTextToggled(this._showSmartText));
  }

  toggleEditMode(editMode: boolean) {
    this.store.dispatch(new SetEditMode(editMode));
  }
}
