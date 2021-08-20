import { Component, OnInit, Input } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ClinicalRecordAppState } from '../../../../clinical-record/store/clinical-record.reducers';
import { selectNormalizedResultByRefId } from '../../../../clinical-record/store/clinical-record.selectors';
import { NormalisedResultsType } from '../../../../../../../../Generated/CoreAPIClient';
import { CardiacCTUpdateNormalisedResult } from '../../../../clinical-record/cardiac-ct/store/cardiac-ct.actions';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-text-area',
  templateUrl: './hms-text-area.component.html',
  styleUrls: ['./hms-text-area.component.css']
})
export class HmsTextAreaComponent implements OnInit {
  private _referenceId: number = 0;

  @Input()
  get referenceId() { return this._referenceId; }
  set referenceId(refId: number) {
    this._referenceId = refId;
    this.normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(refId)));
  }
  @Input() width: any;
  @Input() class: any;
  @Input() height: any;

  normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(this.referenceId)));

  constructor(private store: Store<ClinicalRecordAppState>) { }

  ngOnInit() { }

  changeValue(e: any) {
    if (e && e.value) {
      this.store.dispatch(new CardiacCTUpdateNormalisedResult({result: e.value , referenceId: this.referenceId,
        resultType: NormalisedResultsType.Text}));
    }
  }
}
