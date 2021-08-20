import { Component, OnInit, Input } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { selectSegmentByRefId } from '../../../../clinical-record/store/clinical-record.selectors';
import { ClinicalRecordAppState } from '../../../../clinical-record/store/clinical-record.reducers';
import { NormalisedResult, NormalisedResultsType } from '../../../../../../../../Generated/CoreAPIClient';
import { CardiacCTCoronaryDescription } from '../../store/cardiac-ct.actions';
import { CoronaryEnum } from '../../../../shared/models/DescriptionEnum';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css'],
})
export class DescriptionComponent implements OnInit {
  descriptionArrays : CoronaryEnum = new CoronaryEnum();
  @Input() text: string;
  @Input() refIDs: number[];
  @Input() normalisedResults: NormalisedResult[];
  description$ = this.store.pipe(select(selectSegmentByRefId([])));
  constructor(private store: Store<ClinicalRecordAppState>) { }

  ngOnInit() {
    this.description$ = this.store.pipe(select(selectSegmentByRefId(this.refIDs)));
    this.onInitialize();
  }

  onInitialize() {
    this.normalisedResults.forEach((element) => {
      const i = this.refIDs.findIndex((a) => a === element.hmsReferenceId);
      if (i > -1) {
        if (element.resultType === NormalisedResultsType.Text) {
          this.store.dispatch(new CardiacCTCoronaryDescription({
            refId: element.hmsReferenceId, text: element.result, reason: true,
          }));
        } else {
          const temp = this.descriptionArrays.coronaryOptions[i]?.optionsArray.find((a) => a.id === element.result);
          if (temp) {
            this.store.dispatch(new CardiacCTCoronaryDescription({
              refId: element.hmsReferenceId, text: temp.name, reason: temp.reason ? temp.reason : null,
            }));
          }
        }
      }
    });
  }
}
