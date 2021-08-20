import { Component, OnInit, Input } from '@angular/core';
import { NormalisedResult } from '../../../../../../../Generated/CoreAPIClient';
import { selectPatient, selectShowReportBeside } from '../../store/clinical-record.selectors';
import { Store, select } from '@ngrx/store';
import { CardiacCTAppState } from '../store/cardiac-ct.reducers';
import { FieldsList } from '../../shared/enums/hiddenFields';
import * as _ from 'lodash';

@Component({
  selector: 'app-pre-admission',
  templateUrl: './pre-admission.component.html',
  styleUrls: ['./pre-admission.component.css']
})
export class PreAdmissionComponent implements OnInit {
  @Input() normalisedResults: NormalisedResult[];

  patient$ = this.store.pipe(select(selectPatient));
  showReportBeside$ = this.store.pipe(select(selectShowReportBeside));
  commonOptions = [{ id: 1, name: 'Unknown' }, { id: 2, name: 'No' }, { id: 3, name: 'Yes' }];
  erectileOption = [{ id: 1, name: 'Unknown' }, { id: 2, name: 'No' },
    { id: 3, name: 'Yes, in the last 24 hours (i.e. Viagra)' }];
  diabetesOptions = [{ id: 1, name: 'Unknown' } , { id: 2, name: 'Type 1' }, { id: 3, name: 'Type 2' }];
  metforminOptions = [{ id: 1, name: 'Unknown' }, { id: 2, name: 'Yes' }, { id: 3, name: 'No' }];
  cardiacSurgeryOptions = [{ id: 1, name: 'Unknown' } , { id: 2, name: 'Bypass' }, { id: 3, name: 'Valve' }, { id: 4, name: 'Other' }];
  smokingOptions = [{ id: 1, name: 'Unknown   ' }, { id: 2, name: 'Never' }, { id: 3, name: 'Past' },
    { id: 4, name: 'Current' }];
  exerciseOptions = [{ id: 1, name: 'Unknown' }, { id: 2, name: 'No' },
    { id: 3, name: 'Yes (30 min or more , 3 days/week)' }];
  dyeOptions = [{ id: 1, name: 'Unknown' }, { id: 2, name: 'No' },
    { id: 3, name: 'Yes   (If "Yes", contact nursing staff)' }];
  contrastOptions = [{ id: 1, name: 'Unknown' }, { id: 2, name: 'No' }, { id: 3, name: 'Yes   (CT Scan, IVP/Kidney Xray)' }];
  medicationDetails = false;
  dyeDetails = false;
  latexDetails = false;
  selectedDurationOption = this.commonOptions[1];
  allergies = false;
  latex = false;
  dye = false;
  common = true;
  diabetes = false;
  cardiac = false;
  cardiacOptions = true;
  radioOption: number;
  fieldsEnum = new FieldsList();
  hiddenField = this.fieldsEnum.hiddenField;

  constructor(private store: Store<CardiacCTAppState>) { }

  ngOnInit() { }

  toggle(e: any, index: number, refId: number) {
    
    if ((!e) && (e !== 0) && this.normalisedResults) {
      
      if (this.normalisedResults.find(item => item.hmsReferenceId === refId)) {
        e = _.cloneDeep(this.normalisedResults.find(item => item.hmsReferenceId === refId).result);
      }
    }

    if (e === 3) { // the value 3 represents the yes in the radio options to display message box
      this.hiddenField[index] = 1; // 1 represents true to show message box
    } else {
      this.hiddenField[index] = 0;
    }
  }
}


