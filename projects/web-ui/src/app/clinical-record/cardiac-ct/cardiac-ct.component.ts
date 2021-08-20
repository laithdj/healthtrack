import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { DxTabsComponent } from 'devextreme-angular';
import { confirm } from 'devextreme/ui/dialog';
import { Subject } from 'rxjs';
import { take, takeUntil, withLatestFrom } from 'rxjs/operators';
import * as _ from 'lodash';
import {
  FullStructuredReportDO,
  GetAllListItems,
  ListToQuery,
  SmartTextClient,
} from '../../../../../../Generated/CoreAPIClient';
import { selectUserName, selectLog } from '../../app-store/app-ui.selectors';
import { StompService } from '../../shared/stomp/stomp.service';
import { ClinicalRecordDefinition } from '../shared/clinical-record-models';
import {
  ReportContentChanged,
  SmartTextReportSave,
  ToggleShowReportBeside,
  SmartTextBundleFetch,
} from '../store/clinical-record.actions';
import {
  selectPatient,
  selectReferenceIdList,
  selectReport,
  selectShowReportBeside,
  selectSmartTextBundle,
  selectSmartTextStyleProperties,
  selectSmartTextTemplates,
} from '../store/clinical-record.selectors';
import {
  CardiacCTActionTypes,
  CardiacCTInitFetch,
  CardiacCTSaveResultsForRecord,
  CardiacCTSaveResultsForRecordSuccess,
  CardiacCTListFetch,
  CardiacCTDeleteRecord,
  CardiacCTDeleteRecordSuccess,
  CardiacCTInitFetchSuccess,
} from './store/cardiac-ct.actions';
import { CardiacCTAppState } from './store/cardiac-ct.reducers';
import { SetLog } from '../../app-store/app-ui-state.actions';
import { selectCardiacCTNormalisedResults } from './store/cardiac-ct.selectors';
import { SmartTextReportComponent, STMeasurement } from '../../../../../smart-text/src/public-api';
import { STLetterTagValue } from '../../../../../smart-text/src/lib/models/hms-letter-tag-value.model';

@Component({
  selector: 'app-cardiac-ct',
  templateUrl: './cardiac-ct.component.html',
  styleUrls: ['./cardiac-ct.component.css'],
})
export class CardiacCTComponent implements OnInit, OnDestroy, AfterViewInit {
  private _destroyed$ = new Subject<void>();

  @ViewChild('selectTab') selectTab: DxTabsComponent;
  @ViewChild('reportInTab') reportInTab: SmartTextReportComponent;
  @ViewChild('reportBeside') reportBeside: SmartTextReportComponent;

  tabs = [
    { text: 'Clinical Details' },
    { text: 'Pre Admission' },
    { text: 'Nursing' },
    { text: 'Radiographer' },
    { text: 'Coronaries' },
    { text: 'Structural/Non-Cardiac' },
    { text: 'Report' },
    { text: 'Internal' },
  ];
  patient$ = this.store.pipe(select(selectPatient));
  report$ = this.store.pipe(select(selectReport));
  userName$ = this.store.pipe(select(selectUserName));
  smartTextStyleProperties$ = this.store.pipe(select(selectSmartTextStyleProperties));
  referenceIdList$ = this.store.pipe(select(selectReferenceIdList));
  smartTextTemplateList$ = this.store.pipe(select(selectSmartTextTemplates));
  normalisedResults$ = this.store.pipe(select(selectCardiacCTNormalisedResults));
  smartTextBundle$ = this.store.pipe(select(selectSmartTextBundle));
  definition: ClinicalRecordDefinition = { formDisplay: 'MR_CardiacCT', recordSubCategory: 1 };
  patientId: number;
  showReportBeside$ = this.store.pipe(select(selectShowReportBeside));
  showLog$ = this.store.pipe(select(selectLog));
  reportRender = false;
  loadingVisible = false;
  loadMessage = '';
  windowClose = true;
  fullStructuredReport = new FullStructuredReportDO();
  editMode = false;
  templateContent: string;
  containerId: number;
  listEnum = ListToQuery;
  loading = true;
  measurements: STMeasurement[] = [];
  letterTemplateTagValues: STLetterTagValue[];

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler() {
    this.closeStompService();
  }

  constructor(private store: Store<CardiacCTAppState>, private route: ActivatedRoute, private title: Title,
    private stompService: StompService, private actions$: Actions, private cdRef: ChangeDetectorRef,
    private smartTextClient: SmartTextClient) {
    this.store.dispatch(new SetLog(`${`${new Date()}: `}Cardiac CT Constructor`));
    this.getMeasurements();
  }

  ngOnInit() {
    this.title.setTitle('Cardiac CT Clinical Record');
    this.fetchLists();

    this.route.params.subscribe((params) => {
      const patientId = +params.id;
      this.patientId = patientId;
      this.containerId = +params.containerId;

      if (patientId && patientId > 0) {
        if (this.containerId && this.containerId > 0) {
          this.store.dispatch(new CardiacCTInitFetch({
            definition: this.definition,
            patientId,
            medGroup: 'cardio',
            medArea: 'CT',
            containerId: this.containerId,
          }));
        } else {
          this.containerId = 0;
          this.store.dispatch(new CardiacCTInitFetch({
            definition: this.definition,
            patientId,
            medGroup: 'cardio',
            medArea: 'CT',
          }));
        }
      }
      if (this.containerId && this.containerId > 0) {
        this.editMode = true;
      }
    });

    this.showReportBeside$.pipe(takeUntil(this._destroyed$)).subscribe((show) => {
      if (show === false) {
        this.tabs = [
          { text: 'Clinical Details' },
          { text: 'Pre Admission' },
          { text: 'Nursing' },
          { text: 'Radiographer' },
          { text: 'Coronaries' },
          { text: 'Structural / Non-Cardiac' },
          { text: 'Report' },
          { text: 'Internal' },
        ];
      } else {
        this.tabs = [
          { text: 'Clinical Details' },
          { text: 'Pre Admission' },
          { text: 'Nursing' },
          { text: 'Radiographer' },
          { text: 'Coronaries' },
          { text: 'Structural / Non-Cardiac' },
          { text: 'Internal' },
        ];
      }

      setTimeout(() => {
        this.selectTab.selectedIndex = 0;
      }, 50);
    });
  }

  ngAfterViewInit() {
    this.pageLoaded();
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  getMeasurements() {
    this.normalisedResults$.pipe(takeUntil(this._destroyed$), withLatestFrom(this.referenceIdList$)).subscribe(
      ([results, referenceIds]) => {
        const measurements: STMeasurement[] = [];

        for (let index = 0; index < referenceIds.length; index++) {
          const result = _.cloneDeep(referenceIds[index]);
          const resIdx = results?.findIndex((a) => a.hmsReferenceId === result.referenceId);
          const measurement = new STMeasurement();
          if (resIdx > -1) {
            measurement.result = results[resIdx].displayValue ? results[resIdx].displayValue : results[resIdx].result;
            measurement.units = result.units;
          } else {
            measurement.result = undefined;
          }
          measurement.referenceId = result.referenceId;
          measurement.description = result.description;

          measurements.push(measurement);
        }

        this.measurements = [...measurements];
      });
  }

  contentReady() {
    this.reportRender = true;
    this.cdRef.detectChanges();
  }

  saveRecord() {
    this.loadMessage = 'Saving...';
    this.loadingVisible = true;
    this.windowClose = false;

    this.showReportBeside$.pipe(take(1)).subscribe((show) => {
      if (show === true) {
        this.store.dispatch(new ReportContentChanged(this.reportBeside.getReportContent()));
      } else {
        this.store.dispatch(new ReportContentChanged(this.reportInTab.getReportContent()));
      }
    });

    this.store.dispatch(new CardiacCTSaveResultsForRecord());
    this.actions$.pipe(ofType(CardiacCTActionTypes.SaveResultsForRecordSuccess), takeUntil(this._destroyed$))
      .subscribe((action: CardiacCTSaveResultsForRecordSuccess) => {
        if (action.payload.containerId) {
          this.saveReport(action.payload.containerId, action.payload.cVersion);
          this.loadingVisible = false;
          this.stompService?.closeClinicalRecord(action.payload.containerId);
          window.close();
        }
      });
  }

  deleteRecord() {
    this.windowClose = false;
    const result = confirm('<span style=\'text-align:center\'><p>This will <b>Delete</b> the Clinical Record'
      + '. <br><br> Do you wish to continue?</p></span>', 'Confirm changes');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.loadMessage = 'Deleting...';
        this.loadingVisible = true;
        this.store.dispatch(new CardiacCTDeleteRecord());
        this.actions$.pipe(ofType(CardiacCTActionTypes.DeleteRecordSuccess), takeUntil(this._destroyed$))
          .subscribe((action: CardiacCTDeleteRecordSuccess) => {
            if (action.payload) {
              this.loadingVisible = false;
              this.stompService?.deleteClinicalRecord();
              window.close();
            }
          });
      }
    });
  }

  pageLoaded() {
    this.actions$.pipe(ofType(CardiacCTActionTypes.InitFetchSuccess), takeUntil(this._destroyed$))
      .subscribe((action: CardiacCTInitFetchSuccess) => {
        if (action.payload) {
          this.loading = false;
          this.store.dispatch(new SetLog(`${`${new Date()}: `}Cardiac CT Fetch Finish`));
          this.showLog$.pipe(takeUntil(this._destroyed$)).subscribe((show) => {
            console.log(show);
          });
        }
      });
  }

  saveReport(containerId: number, cVersion: number) {
    this.fullStructuredReport.containerId = containerId;
    this.fullStructuredReport.cVersion = cVersion;

    this.report$.pipe(take(1)).subscribe((report) => {
      if (report?.fullStructuredReport) {
        this.fullStructuredReport.fullStructuredReport = report.fullStructuredReport;
      }
    });

    // need a condition here to check if changes are made then save else don't save
    this.store.dispatch(new SmartTextReportSave(this.fullStructuredReport));
  }

  changeTab(e: any) {
    this.getMeasurements();
    this.showReportBeside$.pipe(take(1)).subscribe((show) => {
      if (e?.itemIndex !== 6) {
        if (show === true) {
          this.store.dispatch(new ReportContentChanged(this.reportBeside.getReportContent()));
        } else {
          this.store.dispatch(new ReportContentChanged(this.reportInTab.getReportContent()));
        }
      }
    });
  }

  refreshSmartText() {
    this.store.dispatch(new SmartTextBundleFetch());
  }

  fetchLists() {
    this.store.dispatch(new CardiacCTListFetch({
      scannerModel: this.setListObject('CoronaryRadiographerScannerMod'),
      graftType: this.setListObject('CoronaryGraftType'),
      graftAnastamosis: this.setListObject('CoronaryGraftAnastamosis'),
      graftSeverity: this.setListObject('CoronaryGraftSeverity'),
      graftLocation: this.setListObject('CoronaryGraftLocation'),
      indicationsList: this.setListObject('Indications'),
      riskFactorsList: this.setListObject('RiskFactors'),
    }));
  }

  setListObject(listName: string) : GetAllListItems {
    const list: GetAllListItems = new GetAllListItems();
    list.listGroup = 'CardiacCT';

    if ((listName === 'Indications') || (listName === 'RiskFactors')) {
      list.listToQuery = this.listEnum.List_Cardio;
    } else {
      list.listToQuery = this.listEnum.List_Clinical;
    }
    list.listName = listName;
    return list;
  }

  openSmartTextEditor() {
    if (this.definition) {
      this.stompService?.goToAngularScreen('SmartTextConfigurationUri',
        [this.definition.formDisplay, this.definition.recordSubCategory.toString()]);
      // in web:
      // window.open('/clinical-record/smart-text/MR_CardiacCT/1', '_blank');
    }
  }

  cancel() {
    window.close();
  }

  closeStompService() {
    if (this.windowClose) {
      this.stompService?.CancelClinicalRecord(this.containerId);
    }
  }

  toggleShowReportBeside(event: { showReportBeside: boolean, reportContent: string }) {
    this.showReportBeside$.pipe(take(1)).subscribe((show) => {
      if (event?.showReportBeside !== show) {
        this.store.dispatch(new ReportContentChanged(event?.reportContent));
        this.store.dispatch(new ToggleShowReportBeside(event?.showReportBeside));
      }
    });
  }

  fetchLetterTagValues(tags: string[]) {
    this.smartTextClient.getLetterTagValues(tags).subscribe((result) => {
      if (this.letterTemplateTagValues) {
        const letterValues = _.cloneDeep(this.letterTemplateTagValues);
        if (result && result.data) {
          letterValues.concat(result.data);
          this.letterTemplateTagValues = [...letterValues];
        }
      } else {
        this.letterTemplateTagValues = [...result.data];
      }
    });
  }
}
