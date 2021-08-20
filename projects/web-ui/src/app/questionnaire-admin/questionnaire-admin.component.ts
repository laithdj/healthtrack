import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import { QuestionnaireAppState } from './store/questionnaire.reducers';
import { InitFetchTemplates } from './store/questionnaire.actions';
import { QuestionnaireTemplateDO } from '../../../../../Generated/CoreAPIClient';
import { selectQuestionnaireTemplates } from './store/questionnaire.selectors';
import { QuestionnaireService } from './questionnaire-service.service';
import { SetError } from '../app-store/app-ui-state.actions';

@Component({
  selector: 'app-questionnaire-admin',
  templateUrl: './questionnaire-admin.component.html',
  styleUrls: ['./questionnaire-admin.component.css'],
})
export class QuestionnaireAdminComponent implements OnInit {
  templates: QuestionnaireTemplateDO[];
  templates$ = this.store.pipe(select(selectQuestionnaireTemplates));
  templateDescription = '';
  templateClass:any;
  // eslint-disable-next-line max-len
  classOptions = [{ text: 'Immediate - user answers questions and results returned immediately (i.e no save) (typically send via SMS, so should be limited to < 20 questions)', value: 1 },
    { text: 'Long - user required to "Logon", may partially answer questions, save and return later ', value: 2 },
    { text: 'Clinical - used within HealthTrack as an user extension', value: 3 }];
  newTemplateModal = false;
  constructor(private router: Router, private store: Store<QuestionnaireAppState>, private title: Title,
    private activatedRoute: ActivatedRoute, protected questionnaireService:QuestionnaireService) {
    this.title.setTitle('Questionnaire Management');
    this.store.dispatch(new InitFetchTemplates(1));
  }

  ngOnInit(): void {
  }
  editCreator(e:any) {
    this.router.navigate([`creator/${e}`], { relativeTo: this.activatedRoute });
  }
  doubleClickRow(e: any) {
    const { component } = e;
    const prevClickTime = component.lastClickTime;
    component.lastClickTime = new Date();
    if (prevClickTime && (component.lastClickTime - prevClickTime < 300)) {
      this.router.navigate([`creator/${e?.data.templateId}`], { relativeTo: this.activatedRoute });
    }
  }
  newTemplate() {
    this.questionnaireService.templateDescription = this.templateDescription;
    this.questionnaireService.templateClass = this.templateClass?.value;
    let error = '';
    if ((!this.questionnaireService.templateDescription)
     || (this.questionnaireService.templateDescription?.length < 1)) {
      error += '<span>Please set a Name for this template.</span></br>';
    }
    if (!this.questionnaireService.templateClass) {
      error += 'Please select a class for this Template.';
    }
    if (error.length > 0) {
      this.store.dispatch(new SetError({ errorMessages: [error], title: 'Validation' }));
    } else {
      this.router.navigate(['creator'], { relativeTo: this.activatedRoute });
    }
  }
}
