/* eslint-disable no-return-assign */
// eslint-disable-next-line max-classes-per-file
import {
  Component, OnInit, Output, EventEmitter, OnDestroy,
} from '@angular/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as SurveyKo from 'survey-knockout';
import * as widgets from 'surveyjs-widgets';
import * as SurveyCreator from 'survey-creator';
// import json from "../../../assets/survey.json";
// import { HttpDataService } from 'app/services/http-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { confirm } from 'devextreme/ui/dialog';
import { Store, select } from '@ngrx/store';
import { takeUntil, take } from 'rxjs/operators';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { Actions, ofType } from '@ngrx/effects';
import notify from 'devextreme/ui/notify';
import { SetError } from '../../app-store/app-ui-state.actions';
import { init as initCustomWidget } from '../custom-widget/custom-widget.component';
import { QuestionnaireAppState } from '../store/questionnaire.reducers';
import { QuestionnaireTemplateDO } from '../../../../../../Generated/CoreAPIClient';
import {
  SaveTemplate, InitFetchTemplate, DeleteTemplate, QuestionnaireActionTypes,
  DeleteTemplateSuccess, SaveTemplateSuccess, InitFetchRecordSubCategoryList,
} from '../store/questionnaire.actions';
import { selectQuestionnaireTemplate, selectRecordSubCategory } from '../store/questionnaire.selectors';
import { selectInAdminMode } from '../../app-store/app-ui.selectors';
import { QuestionnaireService } from '../questionnaire-service.service';

export class Employee {
  id: number;
  name: string;
  jobtype: string;
  email: string;
  address: string;
  imageUrl: string;
}
// eslint-disable-next-line no-shadow

// SurveyCreator.StylesManager.applyTheme("default");

// var CkEditor_ModalEditor = {
//   afterRender: function(modalEditor, htmlElement) {
//     var editor = window["CKEDITOR"].replace(htmlElement);
//     editor.on("change", function() {
//       modalEditor.editingValue = editor.getData();
//     });
//     editor.setData(modalEditor.editingValue);
//   },
//   destroy: function(modalEditor, htmlElement) {
//     var instance = window["CKEDITOR"].instances[htmlElement.id];
//     if (instance) {
//       instance.removeAllListeners();
//       window["CKEDITOR"].remove(instance);
//     }
//   }
// };
// SurveyCreator.SurveyPropertyModalEditor.registerCustomWidget(
//   "html",
//   CkEditor_ModalEditor
// );
// CKEditor is the third party library
/* Steps to use CKEditor in the project:
    1. run 'npm i ckeditor'
    2. update the "build" section of the angular.json: add ckeditor.js script in the scripts section.
*/
@Component({
  selector: 'app-survey.creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.css'],
})

export class CreatorComponent implements OnInit, OnDestroy {
  private _destroyed$ = new Subject<void>();

  thing: Employee = new Employee();
  list: any[];
  selectedItem: any;
  adminMode = false;
  templateTypeList = ['Immediate', 'Long', 'Clinical']
  template: QuestionnaireTemplateDO = new QuestionnaireTemplateDO();
  template$ = this.store.pipe(select(selectQuestionnaireTemplate));
  recordSubCategory$ = this.store.pipe(select(selectRecordSubCategory));
  saveAndClose: any;
  constructor(private router: Router, private store: Store<QuestionnaireAppState>,
    private actions$: Actions,
    protected questionnaireService:QuestionnaireService,
    public route: ActivatedRoute) {
    this.store.dispatch(new InitFetchRecordSubCategoryList());
    this.route.params.subscribe((params) => {
      this.store.pipe(take(1), select(selectInAdminMode))
        .subscribe((admin: boolean) => this.adminMode = admin || false);
      if (params.id) {
        this.store.dispatch(new InitFetchTemplate(params.id));
        this.template$.pipe(takeUntil(this._destroyed$)).subscribe((t: QuestionnaireTemplateDO) => {
          this.template = t ? _.cloneDeep(t) : new QuestionnaireTemplateDO();
          if ((this.template.templateId) && (this.surveyCreator)) {
            this.surveyCreator.text = this.template.templatePages;
            if (this.template.expiry < 1) {
              this.template.expiry = 7;
            }
            if (!this.template.expiry) {
              this.template.expiry = null;
            }
          }
        });
      } else {
        this.template = new QuestionnaireTemplateDO();
        this.template.usePin = false;
        this.template.prefill = false;
      }
    });
  }
  surveyCreator: SurveyCreator.SurveyCreator;
  @Output() surveySaved: EventEmitter<Object> = new EventEmitter();

  ngOnInit() {
    // Add a tag property to all questions

    if (!this.template.templateId) {
      this.template.templateDescription = this.questionnaireService.templateDescription;
      this.template.class = this.templateTypeList[this.questionnaireService.templateClass - 1];
    }
    widgets.icheck(SurveyKo);
    widgets.select2(SurveyKo);
    widgets.inputmask(SurveyKo);
    widgets.jquerybarrating(SurveyKo);
    // widgets.jqueryuidatepicker(SurveyKo);
    widgets.nouislider(SurveyKo);
    widgets.select2tagbox(SurveyKo);
    // widgets.signaturepad(SurveyKo);
    widgets.sortablejs(SurveyKo);
    // widgets.ckeditor(SurveyKo);
    widgets.autocomplete(SurveyKo);
    widgets.bootstrapslider(SurveyKo);
    // widgets.emotionsratings(SurveyKo);
    initCustomWidget(SurveyKo);

    SurveyKo.JsonObject.metaData.addProperty(
      'questionbase',
      'referenceId:text',
    );

    SurveyKo.JsonObject.metaData.addProperty(
      'questionbase',
      {
        name: 'referenceId',
        default: 'default',
        colCount: 0,
        choices:
          [{ value: 17003, text: 'First Name (17003)' },
            { value: 17004, text: 'Surname (17004)' },
            { value: 17005, text: 'Status (17005)' },
            { value: 17006, text: 'Patient ID (17006)' },
            { value: 17007, text: 'Gender (17007)' },
          ],
      },
    );

    this.populateList();

    const options = {
      showEmbededSurveyTab: this.adminMode,
      generateValidJSON: true,
      designerHeight: 'calc(100vh - 190px)',
      haveCommercialLicense: true,
      showJSONEditorTab: this.adminMode,
    };

    this.surveyCreator = new SurveyCreator.SurveyCreator(
      'surveyCreatorContainer',
      options,
    );
    this.surveyCreator.haveCommercialLicense = true;
    this.surveyCreator.toolbox.getItemByName('radiogroup').json = {
      type: 'radiogroup',
      choices: ['Blue', 'Red'],
    };
    this.surveyCreator.saveSurveyFunc = this.saveMySurvey;
  }
  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
  loadConfig(json: any) {
    if (this.surveyCreator) {
      this.surveyCreator.text = JSON.stringify(json);
    }
  }

  populateList() {
    /*
    this.service.getList().subscribe((response) => {
      this.list = response;
    });
    */
  }
  selectQuestionnaire() {
    /*
    if(e.selectedItem){
      this.selectedItem = e.selectedItem.id;
      this.service.getItem(e.selectedItem.id).subscribe((response) => {
       this.loadConfig(response);
      // console.log(response)
      });
    }
    */
  }
  deleteQuiz() {
    const result = confirm('<span style=\'text-align:center\'><p>This will <b>Delete</b> this Template'
    + '. <br><br> Do you wish to continue?</p></span>', 'Confirm changes');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.store.dispatch(new DeleteTemplate(this.template?.templateId));
        this.actions$.pipe(ofType(QuestionnaireActionTypes.DeleteTemplateSuccess), takeUntil(this._destroyed$))
          .subscribe((action: DeleteTemplateSuccess) => {
            if (action.payload) {
              this.router.navigate(['questionnaire-admin']);
            }
          });
      }
    });
  }
  saveTemplateClose() {
    this.saveAndClose = true;
    this.saveMySurvey();
  }
  saveTemplate() {
    this.saveMySurvey();
  }
  cancel() {
    this.router.navigate(['questionnaire-admin']);
  }

  saveMySurvey = () => {
  //  const templateTitle = JSON.parse(this.surveyCreator.text)?.title;
    let error = '';
    /*
    if ((!templateTitle) || (templateTitle?.length < 1)) {
      error += '<span>Please set a Title for this template under Properties.</span></br>';
    }
    */
    if ((this.template.prefill) && (!this.template.usePin)) {
      error += 'User Pin is required to be checked.';
    }
    if (error.length > 0) {
      this.store.dispatch(new SetError({ errorMessages: [error], title: 'Validation' }));
      this.saveAndClose = false;
    } else {
      const template = _.cloneDeep(this.template);
      template.templatePages = this.surveyCreator.text;
      template.templateDescription = this.template.templateDescription;
      template.class = this.template.class;
      template.recordSubCategory = this.template.recordSubCategory;
      template.templateType = 1; // this needs to become an enum it presents type
      if (this.template.templateId) {
        this.store.dispatch(new SaveTemplate({ template, isNew: false }));
      } else {
        this.store.dispatch(new SaveTemplate({ template, isNew: true }));
      }
      this.actions$.pipe(ofType(QuestionnaireActionTypes.SaveTemplateSuccess), takeUntil(this._destroyed$))
        .subscribe((action: SaveTemplateSuccess) => {
          if (action.payload) {
            this.template.templateId = action.payload.templateId;
            if (this.saveAndClose) {
              this.router.navigate(['questionnaire-admin']);
            } else {
              notify('Template was saved  successfully', 'success', 3000);
            }
          }
        });
    }
  };
}
