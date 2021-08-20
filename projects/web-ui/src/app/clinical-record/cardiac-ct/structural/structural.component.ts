/* eslint-disable max-classes-per-file */
import { Component, OnInit, Input } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as _ from 'lodash';
import { FieldsList } from '../../shared/enums/hiddenFields';
import { CardiacCTAppState } from '../store/cardiac-ct.reducers';
import { selectShowReportBeside } from '../../store/clinical-record.selectors';
import { NormalisedResult, NormalisedResultsType } from '../../../../../../../Generated/CoreAPIClient';
import { CardiacCTUpdateNormalisedResult } from '../store/cardiac-ct.actions';

export class Structural {
  leftSize = false;
  aorticValve = false;
  aortaSize = false;
  atriumSize = false;
  septalDefect = false;
  cardiacFindings = false;
}
@Component({
  selector: 'app-structural',
  templateUrl: './structural.component.html',
  styleUrls: ['./structural.component.css'],
})
export class StructuralComponent implements OnInit {
  @Input() normalisedResults: NormalisedResult[];

  showReportBeside$ = this.store.pipe(select(selectShowReportBeside));
  LvOptions = [{ id: 1, name: 'Normal' }, { id: 2, name: 'Increased' }];
  sizeOptions = [{ id: 1, name: 'Normal' }, { id: 2, name: 'Enlarged' }];
  morphOptions = [{ id: 1, name: 'Trileaflet' }, { id: 2, name: 'Bicuspid' }];
  atrialOptions = [{ id: 1, name: 'N/A' }, { id: 2, name: 'Possible' }, { id: 3, name: 'No' }];
  commonOptions = [{ id: 1, name: 'No' }, { id: 2, name: 'Yes' }];
  nonCardiac = [{ id: 1, name: 'Unknown' }, { id: 2, name: 'No' }, { id: 3, name: 'Yes' }];
  structural: Structural = new Structural();
  fieldsEnum = new FieldsList();
  hiddenField = this.fieldsEnum.hiddenField;
  resultTypeEnum = NormalisedResultsType;

  constructor(private store: Store<CardiacCTAppState>) {}

  ngOnInit() {}

  toggle(e: any, index: number, refId: number, thirdOption?:boolean) {
    if ((!e) && (e !== 0) && this.normalisedResults) {
      if (this.normalisedResults.find((item) => item.hmsReferenceId === refId)) {
        e = _.cloneDeep(this.normalisedResults.find((item) => item.hmsReferenceId === refId).result);
      }
    }
    if (refId === 17715) {
      if (!this.normalisedResults?.find((item) => item.hmsReferenceId === 17715)) {
        this.store.dispatch(new CardiacCTUpdateNormalisedResult({
          result: 2,
          referenceId: 17715,
          resultType: this.resultTypeEnum.Number,
          displayValue: 'Yes',
        }));
        e = 2;
      }
      if (e === 1) { // the value 1 represents the yes in the radio options to display message box
        this.hiddenField[index] = 1; // 1 represents true to show extra details box
      } else {
        this.hiddenField[index] = 0;
      }
    } else if (thirdOption) { // if non cardiac findings
      if (e === 3) { // the value 2 represents the yes in the radio options to display message box
        this.hiddenField[index] = 1; // 1 represents true to show extra details box
      } else {
        this.hiddenField[index] = 0;
      }
    } else if (e === 2) { // the value 2 represents the yes in the radio options to display message box
      this.hiddenField[index] = 1; // 1 represents true to show extra details box
    } else {
      this.hiddenField[index] = 0;
    }
  }
}
