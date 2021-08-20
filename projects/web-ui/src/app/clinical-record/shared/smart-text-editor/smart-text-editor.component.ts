import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import * as _ from 'lodash';
import {
  selectDoctorDisplayName,
  selectDoctorId,
  selectUserName,
} from '../../../app-store/app-ui.selectors';
import { AppState } from '../../../app-store/reducers';
import {
  ClinicalRecordInit,
  ReferenceIDListFetch,
  SmartTextBundleFetch,
  SmartTextInitFetch,
  SmartTextPackageSave,
  SmartTextTemplateDelete,
  SmartTextTemplateListSave,
  SmartTextTemplateSave,
} from '../../store/clinical-record.actions';
import {
  selectReferenceIdList,
  selectSmartTextList,
  selectSmartTextPackage,
  selectSmartTextStyleProperties,
  selectSmartTextTemplates,
} from '../../store/clinical-record.selectors';
import {
  SmartTextNode,
  SmartTextTemplate,
} from '../../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../../app-store/app-ui-state.actions';
import { ClinicalRecordDefinition } from '../clinical-record-models';

@Component({
  selector: 'app-smart-text-editor',
  templateUrl: './smart-text-editor.component.html',
  styleUrls: ['./smart-text-editor.component.css'],
})
export class SmartTextEditorComponent implements OnInit {
  userName$ = this.store.pipe(select(selectUserName));
  doctorId$ = this.store.pipe(select(selectDoctorId));
  doctorDisplayName$ = this.store.pipe(select(selectDoctorDisplayName));
  smartTextTemplateList$ = this.store.pipe(select(selectSmartTextTemplates));
  smartTextNodeList$ = this.store.pipe(select(selectSmartTextList));
  smartTextStyleProperties$ = this.store.pipe(select(selectSmartTextStyleProperties));
  referenceIdList$ = this.store.pipe(select(selectReferenceIdList));
  definition: ClinicalRecordDefinition;
  selectedTemplate: SmartTextTemplate;
  medGroup: string;
  medArea: string;

  constructor(private store: Store<AppState>, private route: ActivatedRoute, private title: Title) { }

  ngOnInit() {
    this.title.setTitle('Smart Text Configuration');

    this.route.params.subscribe((params) => {
      const { formDisplay } = params;
      const recordSubCategory: number = +params.recordSubCategory;

      if (formDisplay && formDisplay.trim().length > 0 && recordSubCategory && recordSubCategory > 0) {
        const definition = new ClinicalRecordDefinition();
        definition.formDisplay = formDisplay;
        definition.recordSubCategory = recordSubCategory;
        this.definition = definition;

        if (this.definition.formDisplay === 'MR_CardiacCT' && this.definition.recordSubCategory === 1) {
          this.medGroup = 'cardio';
          this.medArea = 'CT';
          this.store.dispatch(new ReferenceIDListFetch({ medGroup: this.medGroup, medArea: this.medArea }));
          this.store.dispatch(new ClinicalRecordInit({ patient: undefined, definition: this.definition }));
        }

        if (this.definition.formDisplay === 'EchoCardiogram_Reporting' && this.definition.recordSubCategory === 1) {
          this.medGroup = 'cardio';
          this.medArea = 'echo';
          this.store.dispatch(new ReferenceIDListFetch({ medGroup: this.medGroup, medArea: this.medArea }));
          this.store.dispatch(new ClinicalRecordInit({ patient: undefined, definition: this.definition }));
        }
      }
    });
  }

  reloadSmartTextClicked(e: boolean) {
    if (e === true) {
      this.store.dispatch(new SmartTextBundleFetch());
    } else if (e === false) {
      this.store.dispatch(new SmartTextBundleFetch());
    } else {
      this.store.dispatch(new SmartTextInitFetch(this.definition));
    }
  }

  saveSelectedTemplate(template: SmartTextTemplate) {
    this.store.dispatch(new SmartTextTemplateSave(template));
  }

  deleteTemplate(e: number) {
    this.store.dispatch(new SmartTextTemplateDelete({
      templateId: e,
      formDisplay: this.definition.formDisplay,
      recordSubCategory: this.definition.recordSubCategory,
    }));
  }

  saveTemplateList(list: SmartTextTemplate[]) {
    this.store.dispatch(new SmartTextTemplateListSave({
      templateDisplayOrderList: list,
      formDisplay: this.definition.formDisplay,
      recordSubCategory: this.definition.recordSubCategory,
    }));
  }

  saveSmartTextPackage(smartTextList: SmartTextNode[]) {
    this.store.pipe(take(1), select(selectSmartTextPackage)).subscribe((smartTextPackage) => {
      const clonePackage = _.cloneDeep(smartTextPackage);
      clonePackage.smartTextNodes = smartTextList.map((a) => new SmartTextNode(a));

      this.store.dispatch(new SmartTextPackageSave(clonePackage));
    });
  }

  handleError(message: string) {
    this.store.dispatch(new SetError({ errorMessages: [message] }));
  }
}
