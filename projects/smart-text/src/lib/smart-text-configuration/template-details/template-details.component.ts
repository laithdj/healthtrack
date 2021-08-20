import {
  Component,
  Input,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
} from '@angular/core';
import { ViewType } from 'devexpress-richedit/lib/core/view-settings/views-settings';
import * as _ from 'lodash';
import { DxTextBoxComponent } from 'devextreme-angular';
import { RichTextEditorComponent } from '../../rich-text-editor/rich-text-editor.component';
import { STSmartTextTemplate } from '../../models/smart-text-template.model';
import { STSmartTextStyleProperty } from '../../models/smart-text-style-property.model';
import { STSetSize } from '../../models/set-size.model';
import { STDoctor } from '../../models/doctor.model';
import { STReferenceID } from '../../models/reference-id.model';
import { STClinicalRecordDefinition } from '../../models/clinical-record-definition.model';
import { STSmartTextNode } from '../../models/smart-text-node.model';

@Component({
  selector: 'lib-template-details',
  templateUrl: './template-details.component.html',
  styleUrls: ['./template-details.component.css'],
})
export class TemplateDetailsComponent implements OnInit {
  private _selectedTemplate: STSmartTextTemplate;
  private _doctor: STDoctor;

  @ViewChild(RichTextEditorComponent) richEdit: RichTextEditorComponent;
  @ViewChild('templateNameTextBox') templateNameTextBox: DxTextBoxComponent;

  @Input()
  get doctor(): STDoctor { return this._doctor; }
  set doctor(docApi: STDoctor) {
    this._doctor = _.cloneDeep(docApi);
    if (docApi && docApi.doctorId && docApi.doctorId > 0) {
      this.visibilityOptions = (docApi.displayName && docApi.displayName.trim().length > 0)
        ? [{ doctorId: 0, display: 'Anyone' }, { doctorId: docApi.doctorId, display: docApi.displayName }]
        : [{ doctorId: 0, display: 'Anyone' }, { doctorId: docApi.doctorId, display: 'Only Me' }];
    } else {
      this.visibilityOptions = [{ doctorId: 0, display: 'Anyone' }];
    }
  }
  @Input() listAvailableHeaders: STSmartTextNode[];
  @Input() smartTextStyleProperties: STSmartTextStyleProperty[];
  @Input() referenceIdList: STReferenceID[];
  @Input() definition: STClinicalRecordDefinition;
  @Input() editMode: boolean;
  @Input() userName: string;
  @Input()
  get selectedTemplate(): STSmartTextTemplate { return this._selectedTemplate; }
  set selectedTemplate(template: STSmartTextTemplate) {
    this._selectedTemplate = _.cloneDeep(template);
    if (this.richEdit) {
      this.richEdit.clearText();
      if (template?.fullText?.trim()?.length > 0) {
        this.richEdit.addSmartText(template?.fullText);
      }
    }
  }

  @Output() editTemplateClicked = new EventEmitter<void>();
  @Output() cancelEditTemplate = new EventEmitter<void>();
  @Output() deleteTemplateClicked = new EventEmitter<void>();
  @Output() saveTemplateClicked = new EventEmitter<void>();
  @Output() errorMessage = new EventEmitter<string>();
  @Output() undoChangesClicked = new EventEmitter<void>();

  viewType = ViewType;
  richEditorSize: STSetSize = { height: 'calc(100vh - 148px)', width: '790px' };
  visibilityOptions: any[] = [{ doctorId: 0, display: 'Anyone' }];

  constructor() { }

  ngOnInit() { }

  saveTemplate() {
    if (!this.selectedTemplate.templateName || this.selectedTemplate.templateName.trim().length === 0) {
      this.errorMessage.emit('Template Name cannot be empty');
    } else {
      this.selectedTemplate.fullText = this.richEdit.templateContent;
      this.saveTemplateClicked.emit();
    }
  }

  undoChanges() {
    this.undoChangesClicked.emit();
  }

  newTemplate(duplicate: boolean) {
    if (duplicate) {
      if (this.selectedTemplate) {
        const newTemplate = _.cloneDeep(this.selectedTemplate);
        newTemplate.templateId = 0;
        newTemplate.templateName = `${this.selectedTemplate?.templateName} - COPY`;
        newTemplate.displayOrder = 1;
        this.selectedTemplate = newTemplate;
        this.richEdit.clearText();
        this.richEdit.addSmartText(this.selectedTemplate.fullText);
      }
    } else if (this.definition) {
      const newTemplate = new STSmartTextTemplate();
      newTemplate.formDisplay = this.definition.formDisplay;
      newTemplate.recordSubCategory = this.definition.recordSubCategory;
      newTemplate.templateId = 0;
      newTemplate.doctorId = 0;
      newTemplate.fullText = '';
      newTemplate.templateName = '';
      newTemplate.displayOrder = 1;

      this.selectedTemplate = newTemplate;

      if (this.richEdit) {
        this.richEdit.clearText();
        this.richEdit.addSmartText(this.selectedTemplate.fullText);
      }
    } else {
      this.errorMessage.emit('Unable to create Template, the clinical record type is unknown.');
    }

    this.templateNameTextBox.instance.focus();
  }

  editClicked() {
    this.editTemplateClicked.emit();
    this.templateNameTextBox.instance.focus();
  }

  deleteTemplate() {
    this.deleteTemplateClicked.emit();
  }

  cancelEdit() {
    this.cancelEditTemplate.emit();
  }
}
