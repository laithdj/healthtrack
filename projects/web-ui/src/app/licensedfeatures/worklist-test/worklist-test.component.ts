import { Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { SetShowWorklist } from '../store/licensedfeatures.actions';
import { LicensedFeatureAppState } from '../store/licensedfeatures.reducers';
import { dicomWorklistSelector, showDicomWorklistSelector } from '../store/licensedfeatures.selectors';


@Component({
  selector: 'app-worklist-test',
  templateUrl: './worklist-test.component.html',
  styleUrls: ['./worklist-test.component.css'],
})
export class WorklistTestComponent {
  aeTitle = '';
  queryCount = 0;
  dicomworklist$ = this.store.pipe(select(dicomWorklistSelector));
  showDicomWorklist$ = this.store.pipe(select(showDicomWorklistSelector));

  constructor(private store: Store<LicensedFeatureAppState>) { }

  onClose() {
    this.store.dispatch(new SetShowWorklist(false));
  }
}
