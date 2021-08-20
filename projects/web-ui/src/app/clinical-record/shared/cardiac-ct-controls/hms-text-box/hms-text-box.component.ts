import { Component, OnInit, Input } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { NormalisedResultsType } from '../../../../../../../../Generated/CoreAPIClient';
import { ClinicalRecordAppState } from '../../../../clinical-record/store/clinical-record.reducers';
import { selectNormalizedResultByRefId } from '../../../../clinical-record/store/clinical-record.selectors';
import {
  CardiacCTUpdateNormalisedResult,
  CardiacCTCoronaryDescription,
} from '../../../../clinical-record/cardiac-ct/store/cardiac-ct.actions';

@Component({
  selector: 'hms-text-box',
  templateUrl: './hms-text-box.component.html',
  styleUrls: ['./hms-text-box.component.css'],
})
export class HmsTextBoxComponent implements OnInit {
  private _referenceId: number = 0;

  @Input()
  get referenceId() { return this._referenceId; }
  set referenceId(refId: number) {
    this._referenceId = refId;
    this.normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(refId)));
  }
  @Input() width: number;
  @Input() unit: string;
  @Input() sup: string;
  @Input() includeUnit = false;
  @Input() disabled: boolean;
  @Input() getText = false;

  normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(this.referenceId)));

  constructor(private store: Store<ClinicalRecordAppState>) { }

  ngOnInit() { }

  changeValue(e: any) {
    if (this.getText) {
      this.getTextValue(e);
    }
    if (e && e.value) {
      this.store.dispatch(new CardiacCTUpdateNormalisedResult({
        result: e.value,
        referenceId: this.referenceId,
        resultType: NormalisedResultsType.Text,
      }));
    }
  }
  getTextValue(e: any) {
    this.store.dispatch(new CardiacCTCoronaryDescription({
      refId: this.referenceId, text: e?.value, reason: true,
    }));
  }
}
