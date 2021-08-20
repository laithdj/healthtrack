import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { NormalisedResultsType } from '../../../../../../../../Generated/CoreAPIClient';
import { selectNormalizedResultByRefId } from '../../../../clinical-record/store/clinical-record.selectors';
import { ClinicalRecordAppState } from '../../../../clinical-record/store/clinical-record.reducers';
import {
  CardiacCTUpdateNormalisedResult,
  CardiacCTCoronaryDescription,
} from '../../../../clinical-record/cardiac-ct/store/cardiac-ct.actions';

@Component({
  selector: 'hms-check-box',
  templateUrl: './hms-check-box.component.html',
  styleUrls: ['./hms-check-box.component.css'],
})
export class HmsCheckBoxComponent implements OnInit {
  private _referenceId: number = 0;

  @Input()
  get referenceId() { return this._referenceId; }
  set referenceId(refId: number) {
    this._referenceId = refId;
    this.normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(refId)));
  }
  @Input() text: any;
  @Input() getText = false;
  @Input() reason = false;
  @Input() disabled: boolean = false;
  @Output() toggle: EventEmitter<number> = new EventEmitter();

  normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(this.referenceId)));

  constructor(private store: Store<ClinicalRecordAppState>) { }

  ngOnInit() {
    this.toggle.emit();
  }

  changeValue(e: any) {
    let checkResult: number;
    let displayValue = '';

    if (this.getText) {
      this.getTextValue(e.value);
    }

    if (e && e.value) {
      checkResult = 1;
    } else {
      checkResult = 0;
    }

    if (checkResult !== undefined) {
      displayValue = checkResult ? 'Yes' : 'No';
    }

    this.store.dispatch(new CardiacCTUpdateNormalisedResult({
      result: checkResult,
      referenceId: this.referenceId,
      resultType: NormalisedResultsType.Number,
      displayValue,
    }));

    this.toggle.emit(e.value);
  }

  disableValue() {
    if (this.disabled) {
      this.store.dispatch(new CardiacCTUpdateNormalisedResult({
        result: 0,
        referenceId: this.referenceId,
        resultType: NormalisedResultsType.Number,
      }));

      this.getTextValue(false);
    }
  }

  getTextValue(e:any) {
    let value = 0;
    if (e !== false) { value = e; }

    this.store.dispatch(new CardiacCTCoronaryDescription({
      refId: this.referenceId, text: this.text, value, reason: this.reason,
    }));
  }
}
