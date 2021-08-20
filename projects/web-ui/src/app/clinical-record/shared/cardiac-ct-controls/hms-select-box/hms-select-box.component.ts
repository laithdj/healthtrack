import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { selectNormalizedResultByRefId } from '../../../../clinical-record/store/clinical-record.selectors';
import { ClinicalRecordAppState } from '../../../../clinical-record/store/clinical-record.reducers';
import { NormalisedResultsType } from '../../../../../../../../Generated/CoreAPIClient';
import { CardiacCTUpdateNormalisedResult } from '../../../../clinical-record/cardiac-ct/store/cardiac-ct.actions';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-select-box',
  templateUrl: './hms-select-box.component.html',
  styleUrls: ['./hms-select-box.component.css']
})
export class HmsSelectBoxComponent implements OnInit {
  private _referenceId: number = 0;

  @Input()
  get referenceId() { return this._referenceId; }
  set referenceId(refId: number) {
    this._referenceId = refId;
    this.normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(refId)));
  }
  @Input() items: any;
  @Input() acceptCustomValue: boolean;
  @Input() searchEnabled: boolean;
  @Input() displayEx: any;
  @Input() valueEx: any;
  @Input() value: any;
  @Input() width: any;

  @Output() toggle: EventEmitter<number> = new EventEmitter();
  @Output() customVal: EventEmitter<number> = new EventEmitter();

  normalizedResult$ = this.store.pipe(select(selectNormalizedResultByRefId(this.referenceId)));

  constructor(private store: Store<ClinicalRecordAppState>) { }

  ngOnInit() { }


  changeValue(e: any) {
    if (e && e.value) {
      const result = parseInt(e.value);
      const itemText = this.items.find(a => a[this.valueEx] === e.value);
        this.store.dispatch(new CardiacCTUpdateNormalisedResult({
          result: result, referenceId: this.referenceId,
          resultType: NormalisedResultsType.Number, displayValue: itemText ? itemText[this.displayEx] : null
        }));
    }
  }

  customValue(e: any) {
    if (e) {
      e.customItem = parseInt(e.text);
      this.customVal.emit(e.text);
    }
  }
}
