import { Component, OnInit, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { selectNormalizedResultByRefId } from '../../../../clinical-record/store/clinical-record.selectors';
import { ClinicalRecordAppState } from '../../../../clinical-record/store/clinical-record.reducers';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-label-text',
  templateUrl: './hms-label-text.component.html',
  styleUrls: ['./hms-label-text.component.css']
})
export class HmsLabelTextComponent implements OnInit  {
  private _referenceId: number = 0;

  @Input()
  get referenceId() { return this._referenceId; }
  set referenceId(refId: number) {
    this._referenceId = refId;
    this.normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(refId)));
  }
  @Input() text: string;
  @Input() refIDs: number[];


  normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(this.referenceId)));

  constructor(private store: Store<ClinicalRecordAppState>) { }

  ngOnInit() { }
}
