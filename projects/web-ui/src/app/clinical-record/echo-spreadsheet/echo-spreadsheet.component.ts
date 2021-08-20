import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { DxTabsComponent } from 'devextreme-angular';
import { IgxSpreadsheetComponent } from 'igniteui-angular-spreadsheet';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { ExcelUtility } from './excel-utility.model';
import { Patient, PatientClient, SmartTextClient } from '../../../../../../Generated/CoreAPIClient';
import { selectUserName } from '../../app-store/app-ui.selectors';
import {
  ClinicalRecordInit,
  ReportContentChanged,
  SmartTextBundleFetch,
  ToggleShowReportBeside,
} from '../store/clinical-record.actions';
import { ClinicalRecordAppState } from '../store/clinical-record.reducers';
import {
  selectPatient,
  selectReport,
  selectShowReportBeside,
  selectSmartTextBundle,
} from '../store/clinical-record.selectors';
import { STLetterTagValue } from '../../../../../smart-text/src/lib/models/hms-letter-tag-value.model';

@Component({
  selector: 'app-test-spreadsheet',
  templateUrl: './echo-spreadsheet.component.html',
  styleUrls: ['./echo-spreadsheet.component.css'],
})
export class EchoSpreadsheetComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject<void>();

  @ViewChild('selectTab') selectTab: DxTabsComponent;
  @ViewChild('spreadsheet') spreadsheet: IgxSpreadsheetComponent;

  patient$ = this.store.pipe(select(selectPatient));
  smartTextBundle$ = this.store.pipe(select(selectSmartTextBundle));
  showReportBeside$ = this.store.pipe(select(selectShowReportBeside));
  userName$ = this.store.pipe(select(selectUserName));
  report$ = this.store.pipe(select(selectReport));
  letterTemplateTagValues: STLetterTagValue[];
  measurements = [];
  reportRender = true;
  duration = 90;
  heightUnit = 'cm'
  tabs = [
    { text: 'Clinical Details' },
    { text: 'Measurements' },
    { text: 'Report' },
  ];

  constructor(private store: Store<ClinicalRecordAppState>,
    private route: ActivatedRoute,
    private patientClient: PatientClient,
    private smartTextClient: SmartTextClient) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const patientId = +params.id;
      if (patientId) {
        this.loadPatient(patientId);
      }
    });

    this.showReportBeside$.pipe(takeUntil(this._destroyed$)).subscribe((show) => {
      if (show === false) {
        this.tabs = [
          { text: 'Clinical Details' },
          { text: 'Measurements' },
          { text: 'Report' },
        ];
      } else {
        this.tabs = [
          { text: 'Clinical Details' },
          { text: 'Measurements' },
        ];
      }

      setTimeout(() => {
        this.selectTab.selectedIndex = 0;
      }, 50);
    });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  onUploadFile(event: any) {
    const files: any[] = event?.target?.files;
    if (files && files.length > 0) {
      const file = files[0];
      ExcelUtility.load(file).then((w) => {
        this.spreadsheet.workbook = w;
      });
    }
  }

  loadPatient(patientId: number) {
    this.patientClient.getPatient(patientId).subscribe((response) => {
      this.store.dispatch(new ClinicalRecordInit({
        patient: response as Patient,
        definition: { formDisplay: 'EchoCardiogram_Reporting', recordSubCategory: 1 },
      }));
    });
  }

  refreshSmartText() {
    this.store.dispatch(new SmartTextBundleFetch());
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
