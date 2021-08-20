import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { selectNormalizedResultByRefId } from '../../../../clinical-record/store/clinical-record.selectors';
import { ClinicalRecordAppState } from '../../../../clinical-record/store/clinical-record.reducers';
import { NormalisedResultsType } from '../../../../../../../../Generated/CoreAPIClient';
import {
  CardiacCTUpdateNormalisedResult,
  CardiacCTCoronaryDescription,
} from '../../../../clinical-record/cardiac-ct/store/cardiac-ct.actions';

@Component({
  selector: 'hms-radio-group',
  templateUrl: './hms-radio-group.component.html',
  styleUrls: ['./hms-radio-group.component.css'],
})
export class HmsRadioGroupComponent implements OnInit {
  private _referenceId: number = 0;

  @Input()
  get referenceId() { return this._referenceId; }
  set referenceId(refId: number) {
    this._referenceId = refId;
    this.normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(refId)));
  }
  @Input() items: any[];
  @Input() default: boolean = true;
  @Input() displayEx: string;
  @Input() valueEx: string;
  @Input() layout: string;
  @Input() getText = false;
  @Input() width: any;

  @Output() toggle: EventEmitter<number> = new EventEmitter();
  @Output() getValue: EventEmitter<number> = new EventEmitter();

  normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(this.referenceId)));

  constructor(private store: Store<ClinicalRecordAppState>) { }

  ngOnInit() {
    this.toggle.emit();
  }

  changeValue(e: any) {
    if (e && e.value) {
      if (this.getText) {
        this.getTextValue(e.value);
      }

      this.toggle.emit(e.value);
      this.getValue.emit(e.value);
      const itemText = this.items.find((a) => a.id === e.value);
      this.store.dispatch(new CardiacCTUpdateNormalisedResult({
        result: e.value,
        referenceId: this.referenceId,
        resultType: NormalisedResultsType.Number,
        displayValue: itemText?.name === 'Unknown' ? 'UNKNOWN' : itemText?.name,
      }));
    }
  }

  getTextValue(e: any) {
    const temp = this.items.find((a) => a.id === e);
    if (temp) {
      this.store.dispatch(new CardiacCTCoronaryDescription({
        refId: this.referenceId, text: temp.name,
      }));
    }
  }
}
