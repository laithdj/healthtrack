import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { DxTreeListComponent } from 'devextreme-angular';
import {
  Store,
  select,
} from '@ngrx/store';
import { Subject } from 'rxjs';
import * as _ from 'lodash';
import { takeUntil } from 'rxjs/operators';
import { confirm } from 'devextreme/ui/dialog';
import {
  GraftDO,
  NormalisedResult,
  GetAllListItems,
  ListItemDefinition,
  NormalisedResultsType,
  ListToQuery,
} from '../../../../../../../Generated/CoreAPIClient';
import { ClinicalRecordAppState } from '../../store/clinical-record.reducers';
import { CoronariesGrid } from './coronaries.model';
import { selectShowReportBeside, selectSegmentByRefId } from '../../store/clinical-record.selectors';
import {
  CardiacCTUpdateNormalisedResult,
  CardiacCTGraftsChanged,
  CardiacCTCoronaryDescription,
  CardiacCTRemoveNormalisedResult,
} from '../store/cardiac-ct.actions';
import { FieldsList } from '../../shared/enums/hiddenFields';
import {
  selectCardiacCTGrafts,
  selectCardiacCTGraftAnastamosisList,
  selectCardiacCTSeverityList,
  selectCardiacCTGraftTypeList,
  selectCardiacCTGraftLocationList,
} from '../store/cardiac-ct.selectors';
import { CheckBox } from '../models/check-box.model';

@Component({
  selector: 'app-coronaries',
  templateUrl: './coronaries.component.html',
  styleUrls: ['./coronaries.component.css'],
})
export class CoronariesComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject<void>();

  @ViewChild('coronaryGrid') coronaryGrid: DxTreeListComponent;

  @Input() containerId: number | null;
  @Input() normalisedResults: NormalisedResult[];

  showReportBeside$ = this.store.pipe(select(selectShowReportBeside));
  graftType$ = this.store.pipe(select(selectCardiacCTGraftTypeList));
  graftAnastamosis$ = this.store.pipe(select(selectCardiacCTGraftAnastamosisList));
  graftSeverity$ = this.store.pipe(select(selectCardiacCTSeverityList));
  graftLocation$ = this.store.pipe(select(selectCardiacCTGraftLocationList));
  coronaryDom = [
    { id: 1, name: 'Unknown' },
    { id: 2, name: 'Right' },
    { id: 3, name: 'Left' },
    { id: 4, name: 'Co-Dominant' },
  ];
  coronaryAno = [
    { id: 1, name: 'Unknown' },
    { id: 2, name: 'No' },
    { id: 3, name: 'Yes' }];
  cadOptions = [
    { id: 1, name: 'Unknown' },
    { id: 2, name: '1' },
    { id: 3, name: '2' },
    { id: 4, name: '3' },
    { id: 5, name: '4A' },
    { id: 6, name: '4B' },
    { id: 7, name: '5' },
    { id: 8, name: 'N' }];
  assessmentOptions = [
    { id: 'Normal', name: 'Normal' },
    { id: 'Abnormal', name: 'Abnormal' }];
  nonAssessed = [{ id: 'Not Assessed', name: 'Not Assessed' }];
  vesselCalibreOptions = [
    { id: 1, name: 'Large' },
    { id: 2, name: 'Moderate' },
    { id: 3, name: 'Small' }];
  plaqueOptions = [
    { id: 1, name: 'Non-Calcified' },
    { id: 2, name: 'Calcified' },
    { id: 3, name: 'Mixed' }];
  quantitativeOptions = [
    { id: 1, name: 'Normal' },
    { id: 2, name: '<25% - Minimal' },
    { id: 3, name: '25%-49% - Mild' },
    { id: 4, name: '50%-69% - Moderate' },
    { id: 5, name: '70%-99% - Severe' },
    { id: 6, name: 'Occluded' },
    { id: 7, name: 'Non-Evaluable - Reason:' }];
  diseaseOptions = [
    { id: 1, name: 'Diffuse' },
    { id: 2, name: 'Focal' }];
  stentOptions = [
    { id: 1, name: 'No Significant ISR' },
    { id: 2, name: 'Severe ISR:' },
    { id: 3, name: 'Peri-Stent Restenosis:' },
    { id: 4, name: 'Non-Evaluable - Reason:' }];
  reasonOptions = [
    { id: 'Motion', name: 'Motion' },
    { id: 'Noise', name: 'Noise' },
    { id: 'Calcium', name: 'Calcium' },
    { id: 'Stent', name: 'Stent' },
    { id: 'Other', name: 'Other' }];
  normal = [{ id: 3, name: 'Normal' }];
  abnormal = [{ id: 2, name: 'Abnormal' }];
  non = [{ id: 1, name: 'Not Assessed' }];
  type: ListItemDefinition[] = [];
  anastamosis: ListItemDefinition[] = [];
  severity: ListItemDefinition[] = [];
  location: ListItemDefinition[] = [];
  nonTest: any;
  abTest: any;
  normalTest: any;
  coronariesGrid: CoronariesGrid = new CoronariesGrid();
  grid = this.coronariesGrid.gridValues;
  grafts: GraftDO[] = [];
  currentResult: NormalisedResult = new NormalisedResult();
  description = '';
  segmentShow = false;
  plaqueType = '';
  plaque = '';
  stenosis = '';
  highRiskPlaque = '';
  stenosisReason: string[] = [];
  highRisk: string[] = [];
  reasonArray: string[] = [];
  list: GetAllListItems = new GetAllListItems();
  resultTypeEnum = NormalisedResultsType;
  listEnum = ListToQuery;
  currentRef: number;
  fieldsEnum = new FieldsList();
  hiddenField = this.fieldsEnum.hiddenField;
  imgOptions = [
    { id: 1, name: 'Unknown' },
    { id: 2, name: 'Excellent' },
    { id: 3, name: 'Good' },
    { id: 4, name: 'Poor' },
  ];
  reason: CheckBox[] = [
    { id: 0, display: 'Motion', value: false },
    { id: 1, display: 'Noise', value: false },
    { id: 2, display: 'Calcium', value: false },
    { id: 3, display: 'Stent', value: false },
    { id: 4, display: 'Other', value: false },
  ];
  highRiskBox: CheckBox[] = [
    { id: 0, display: 'Positive Remodelling', value: false },
    { id: 1, display: 'Low-Attenuation Plaque', value: false },
    { id: 2, display: 'Spotty Calcification', value: false },
    { id: 3, display: 'Napkin Ring', value: false },
  ];
  segmentTitle: string;
  desRefIds: number[] = new Array(19);
  grafts$ = this.store.pipe(select(selectCardiacCTGrafts))
  selectedRow: any;
  reasonDisabled = true;
  stentNonEvaluableSelected = false;
  stentSevereISRSelected = false;
  stentPeriStentRestenosisSelected = false;
  radioClicked = 0;
  remove = false;

  constructor(private cdRef: ChangeDetectorRef, private store: Store<ClinicalRecordAppState>) {
    this.list.listGroup = 'CardiacCT';
    this.list.listToQuery = this.listEnum.List_Clinical;
  }

  ngOnInit() {
    this.grafts$.pipe(takeUntil(this._destroyed$)).subscribe((g: GraftDO[]) => {
      this.grafts = g ? _.cloneDeep(g) : [];
    });
    this.setDefault();
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  rowColourControl(e: any) {
    if (e.node) {
      if (e.node.data.parentCategory === -1) {
        e.rowElement.style.backgroundColor = '#d3d3d3';
      }
    }
  }
  setDefault() {
    // Coronary Dominance set default value to Right
    if (!this.normalisedResults?.find((item) => item.hmsReferenceId === 17079)) {
      this.store.dispatch(new CardiacCTUpdateNormalisedResult({
        result: 2,
        referenceId: 17079,
        resultType: this.resultTypeEnum.Number,
        displayValue: 'Right',
      }));
    }
  }

  markAllNormal() {
    this.grid.forEach((d) => {
      this.store.dispatch(new CardiacCTUpdateNormalisedResult({
        result: 3,
        referenceId: d.refId,
        resultType: this.resultTypeEnum.Number,
      }));
    });
  }

  clearSelection() {
    this.coronaryGrid.instance.forEachNode((d) => {
      this.coronaryGrid.instance.expandRow(d.key);
    });
    this.grid.forEach((d) => {
      this.store.dispatch(new CardiacCTUpdateNormalisedResult({
        result: 1,
        referenceId: d.refId,
        resultType: this.resultTypeEnum.Number,
      }));
    });
  }

  normalSelection(e: any) {
    if (this.coronaryGrid) {
      this.coronaryGrid.instance.collapseRow(e.row.key);
    }
  }

  addGraft() {
    this.store.dispatch(new CardiacCTGraftsChanged());
  }

  updateGraft(e: any) {
    const graft:GraftDO = e.data;
    this.store.dispatch(new CardiacCTGraftsChanged({ graft, indx: e.rowIndex }));
  }

  removeGraft(e: any) {
    const graft:GraftDO = e.data;
    this.store.dispatch(new CardiacCTGraftsChanged({ graft, deleted: true, indx: e.rowIndex }));
  }

  combineText() {
    this.segmentShow = false;
    // this.setDescriptionField(this.selectedRow, this.desRefIds);
    this.store.dispatch(new CardiacCTUpdateNormalisedResult({
      result: 2,
      referenceId: this.selectedRow,
      resultType: this.resultTypeEnum.Number,
    }));
  }

  // setDescriptionField(parent: number, refIds: number[]) {

  // }

  showSegmentOnDblClick(e: any) {
    this.currentResult = _.cloneDeep(this.normalisedResults.find((a) => a.hmsReferenceId === e.data.refId));
    if (this.currentResult) {
      if (this.currentResult.result === 2) {
        this.desRefIds = e.data.desc;
        this.segmentTitle = e.data.categoryName;
        this.segmentShow = true;
        this.stenosisReasonCheck();
      }
    }
  }

  stenosisReasonCheck() {
    const normResult = this.normalisedResults.find((item) => item.hmsReferenceId === this.desRefIds[0]);
    if (normResult) {
      if (normResult.result === 7) {
        this.reasonDisabled = false;
      } else {
        this.reasonDisabled = true;
      }
    } else {
      this.reasonDisabled = true;
    }
  }

  checkStenosis(e: any) {
    if (e === 7) { // check to see if non e-valuable - reason option is selected to enable check boxes
      this.reasonDisabled = false;
    } else {
      this.reasonDisabled = true;
    }
  }

  checkStentSelection(e: number) {
    this.stentSevereISRSelected = e && e === 2;
    this.stentPeriStentRestenosisSelected = e && e === 3;
    this.stentNonEvaluableSelected = e && e === 4;
    if (!this.stentSevereISRSelected) {
      this.store.dispatch(new CardiacCTUpdateNormalisedResult({
        result: '',
        referenceId: this.desRefIds[14],
        resultType: NormalisedResultsType.Text,
      }));
    }
    if (!this.stentPeriStentRestenosisSelected) {
      this.store.dispatch(new CardiacCTUpdateNormalisedResult({
        result: '',
        referenceId: this.desRefIds[15],
        resultType: NormalisedResultsType.Text,
      }));
    }
  }

  addReason(e: any, text: string) {
    if (e.value) {
      const find = this.stenosisReason.find((s) => s === text);

      if (!find) {
        this.stenosisReason.push(text);
      }
    } else {
      const indx = this.stenosisReason.findIndex((s) => s === text);
      this.stenosisReason.splice(indx, 1);
    }
  }

  addHighRisk(e: any, text: string) {
    if (e.value) {
      const find = this.highRisk.find((s) => s === text);

      if (!find) {
        this.highRisk.push(text);
      }
    } else {
      const indx = this.highRisk.findIndex((s) => s === text);
      this.highRisk.splice(indx, 1);
    }
  }
  checkSomething(refIDs: number[]): boolean {
    let a = false;
    this.store.pipe(select(selectSegmentByRefId(refIDs))).pipe(takeUntil(this._destroyed$)).subscribe((g) => {
      if (g.length > 1) {
        a = true;
      }
    });
    return a;
  }

  toggle(value: any, e: any) {
    const description = this.checkSomething(e.data.desc); // if there is description
    if (value) {
      if (value === 3) {
        if (description) {
          const result = confirm('<p style="text-align:center">Changing Options '
          + 'will remove Segment Description.<br><br>Do you wish to continue?</p>',
          'Confirmation Required');
          result.then((dialogResult) => {
            if (dialogResult === true) {
              this.clearSegmentDescription(e.data.desc);
              this.coronaryGrid.instance.collapseRow(e.row.key);
              const parentId = e.data.categoryId;
              this.grid.forEach((d) => {
                if (d.parentCategory === parentId) {
                  this.store.dispatch(new CardiacCTUpdateNormalisedResult({
                    result: 3,
                    referenceId: d.refId,
                    resultType: this.resultTypeEnum.Number,
                  }));
                }
              });
              this.segmentShow = false;
            } else {
              this.store.dispatch(new CardiacCTUpdateNormalisedResult({
                result: 2,
                referenceId: e.data.refId,
                resultType: this.resultTypeEnum.Number,
              }));
              this.radioClicked = 1;
            }
          });
        } else {
          this.coronaryGrid.instance.collapseRow(e.row.key);
          const parentId = e.data.categoryId;
          this.grid.forEach((d) => {
            if (d.parentCategory === parentId) {
              this.store.dispatch(new CardiacCTUpdateNormalisedResult({
                result: 3,
                referenceId: d.refId,
                resultType: this.resultTypeEnum.Number,
              }));
            }
          });
          this.segmentShow = false;
        }
      } else if (value === 2) {
        if (e.data.parentCategory !== -1) {
          this.desRefIds = e.data.desc;
          this.selectedRow = e.data.refId;
          this.segmentTitle = e.data.categoryName;
          if (this.radioClicked === 0) {
            this.segmentShow = true;
          } else {
            this.radioClicked = 0;
          }
          this.stenosisReasonCheck();
          this.cdRef.detectChanges();
          this.store.dispatch(new CardiacCTUpdateNormalisedResult({
            result: 2,
            referenceId: e.data.refId,
            resultType: this.resultTypeEnum.Number,
          }));
          this.remove = true;
        } else {
          this.coronaryGrid.instance.expandRow(e.row.key);
        }
      } else if (description) {
        const result = confirm('<p style="text-align:center">Changing Options will remove Segment Description.'
            + '<br><br>Do you wish to continue?</p>', 'Confirmation Required');
        result.then((dialogResult) => {
          if (dialogResult === true) {
            this.clearSegmentDescription(e.data.desc);
            this.store.dispatch(new CardiacCTUpdateNormalisedResult({
              result: value,
              referenceId: e.data.refId,
              resultType: this.resultTypeEnum.Number,
              description: null,
            }));
          } else {
            this.store.dispatch(new CardiacCTUpdateNormalisedResult({
              result: 2,
              referenceId: e.data.refId,
              resultType: this.resultTypeEnum.Number,
            }));
            this.radioClicked = 1;
          }
        });
      } else {
        this.store.dispatch(new CardiacCTUpdateNormalisedResult({
          result: value,
          referenceId: e.data.refId,
          resultType: this.resultTypeEnum.Number,
          description: null,
        }));
      }
    }
  }

  clearSegmentDescription(refIds: number[]) {
    refIds.forEach((element) => {
      this.store.dispatch(new CardiacCTCoronaryDescription({
        refId: element, text: null,
      }));
      this.store.dispatch(new CardiacCTRemoveNormalisedResult(element));
    });
  }

  displayHiddenField(e: any, index: number, refId: number) {
    if ((!e) && (e !== 0) && this.normalisedResults) {
      if (this.normalisedResults.find((item) => item.hmsReferenceId === refId)) {
        e = _.cloneDeep(this.normalisedResults.find((item) => item.hmsReferenceId === refId).result);
      }
    }

    if (e === 3) {
      this.hiddenField[index] = 1;
    } else {
      this.hiddenField[index] = 0;
    }
  }
}
