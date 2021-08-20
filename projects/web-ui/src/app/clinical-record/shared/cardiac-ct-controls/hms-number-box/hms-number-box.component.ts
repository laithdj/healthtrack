import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NormalisedResultsType } from '../../../../../../../../Generated/CoreAPIClient';
import { Store, select } from '@ngrx/store';
import { ClinicalRecordAppState } from '../../../../clinical-record/store/clinical-record.reducers';
import { selectNormalizedResultByRefId } from '../../../../clinical-record/store/clinical-record.selectors';
import { CardiacCTUpdateNormalisedResult } from '../../../../clinical-record/cardiac-ct/store/cardiac-ct.actions';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-number-box',
  templateUrl: './hms-number-box.component.html',
  styleUrls: ['./hms-number-box.component.css']
})
export class HmsNumberBoxComponent implements OnInit {
  private _referenceId: number = 0;

  @Input()
  get referenceId() { return this._referenceId; }
  set referenceId(refId: number) {
    this._referenceId = refId;
    this.normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(refId)));
  }
  @Input() width: number;
  @Input() readOnly: boolean;
  @Input() unit: string;
  @Input() sup: string;
  @Input() includeUnit = false;
  @Output() resultChange: EventEmitter<number> = new EventEmitter();

  normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(this.referenceId)));

  constructor(private store: Store<ClinicalRecordAppState>) { }

  ngOnInit() { }

  changeValue(e: any) {
    if (e && e.value) {
      this.store.dispatch(new CardiacCTUpdateNormalisedResult({result: e.value , referenceId: this.referenceId,
        resultType: NormalisedResultsType.Number}));
        this.resultChange.emit(e.value);
    }
  }
}
