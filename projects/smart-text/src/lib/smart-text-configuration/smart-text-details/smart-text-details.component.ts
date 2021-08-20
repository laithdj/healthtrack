import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { ViewType } from 'devexpress-richedit/lib/core/view-settings/views-settings';
import { DxTextBoxComponent } from 'devextreme-angular';
import * as _ from 'lodash';
import { STHeaderStyle } from '../../models/enums/header-style.enum';
import { STSegmentType } from '../../models/enums/segment-type.enum';
import { STSmartTextType } from '../../models/enums/smart-text-type.enum';
import { STReferenceID } from '../../models/reference-id.model';
import { STSetSize } from '../../models/set-size.model';
import { STSmartTextNode } from '../../models/smart-text-node.model';
import { STSmartTextStyleProperty } from '../../models/smart-text-style-property.model';
import { RichTextEditorComponent } from '../../rich-text-editor/rich-text-editor.component';

@Component({
  selector: 'lib-smart-text-details',
  templateUrl: './smart-text-details.component.html',
  styleUrls: ['./smart-text-details.component.css'],
})
export class SmartTextDetailsComponent implements OnInit {
  @ViewChild('rich_edit') richEdit: RichTextEditorComponent;
  @ViewChild('groupText') groupText: DxTextBoxComponent;
  @ViewChild('shortDescriptionTextBox') shortDescriptionTextBox: DxTextBoxComponent;

  @Input() editMode: boolean;
  @Input() smartText: STSmartTextNode;
  @Input() referenceIdList: STReferenceID[];
  @Input() smartTextStyleProperties: STSmartTextStyleProperty[];
  @Input() smartTextNodeList: STSmartTextNode[];
  @Input() userName: string;

  @Output() editSmartTextClicked = new EventEmitter<void>();
  @Output() cancelEditSmartText = new EventEmitter<void>();
  @Output() deleteSmartTextClicked = new EventEmitter<void>();
  @Output() saveSmartTextClicked = new EventEmitter<STSmartTextNode>();
  @Output() errorMessage = new EventEmitter<string>();

  richEditorSize: STSetSize = { height: 'calc(100vh - 247px)', width: '790px' };
  viewType = ViewType;
  nodeType = STSmartTextType;
  stylesList = [{ displayStyle: 'None', value: STHeaderStyle.Normal },
    { displayStyle: 'Header 1', value: STHeaderStyle.Header1 },
    { displayStyle: 'Header 2', value: STHeaderStyle.Header2 },
    { displayStyle: 'Header 3', value: STHeaderStyle.Header3 },
    { displayStyle: 'Invisible', value: STHeaderStyle.Invisible }];

  constructor() { }

  ngOnInit() {
  }

  addNewSmartText(nodeType: STSmartTextType) {
    if (this.smartText?.navID && this.smartText.navID > 0) {
      let parentId = this.smartText.navID;
      if (parentId === -1) {
        const reportParent = (this.smartTextNodeList.findIndex((a) => a.parentID === -1));
        if (reportParent > -1) {
          parentId = this.smartTextNodeList[reportParent].navID;
        }
      }

      let displayOrder = 1;

      if (parentId > 0) {
        const siblings = this.smartTextNodeList.filter((a) => a.parentID === parentId)
          .sort((st1, st2) => st2.displayOrder - st1.displayOrder);
        displayOrder = (siblings && siblings.length > 0) ? siblings[0].displayOrder + 1 : 1;
      }

      // calculate max id
      const ids = this.smartTextNodeList.map((a) => a.navID);
      const maxId = ids?.length > 0 ? Math.max(...ids) : 0;

      const newSt = new STSmartTextNode();
      newSt.displayOrder = displayOrder;
      newSt.navID = maxId + 1;
      newSt.parentID = parentId;
      newSt.nodeType = nodeType;
      newSt.nodeSegment = STSegmentType.StartEnd;
      newSt.noNewLinesForHeaders = false;
      newSt.trackingDisabled = false;
      newSt.disablePunctuation = false;

      if (nodeType === STSmartTextType.Group) {
        newSt.styleID = STHeaderStyle.Normal;
        newSt.nodeSegment = STSegmentType.Heading;
      }

      this.smartText = newSt;

      if (nodeType === STSmartTextType.Group) {
        setTimeout(() => {
          this.groupText.instance.focus();
        }, 20);
      } else {
        this.shortDescriptionTextBox.instance.focus();
      }
    }

    if (this.richEdit) {
      this.richEdit.clearText();
    }
  }

  saveSmartText() {
    const smartTextTemp = _.cloneDeep(this.smartText);

    if (this.richEdit && smartTextTemp.nodeType === STSmartTextType.SmartText) {
      smartTextTemp.nodeText = this.richEdit.templateContent;
    }

    if (!smartTextTemp.shortDescription) {
      smartTextTemp.shortDescription = '';
    }

    this.saveSmartTextClicked.emit(smartTextTemp);
  }

  onEditClicked() {
    this.editSmartTextClicked.emit();
    if (this.shortDescriptionTextBox && this.shortDescriptionTextBox.instance) {
      this.shortDescriptionTextBox.instance.focus();
    } else if (this.groupText && this.groupText.instance) {
      this.groupText.instance.focus();
    }
  }

  onDeleteClicked() {
    this.deleteSmartTextClicked.emit();
  }

  onSaveClicked() {
    if (this.smartText.navID === 0 && this.smartText.nodeType === STSmartTextType.Group) {
      if (!this.smartText.nodeText || this.smartText.nodeText.trim().length === 0) {
        this.errorMessage.emit('Text cannot be empty.');
      } else {
        if (!this.smartText.shortDescription || this.smartText.shortDescription.trim().length === 0) {
          if (this.smartText.nodeText.trim().length < 150) {
            this.smartText.shortDescription = this.smartText.nodeText.trim();
          } else {
            this.smartText.shortDescription = this.smartText.nodeText.trim().substring(0, 149);
          }
        }
        this.saveSmartText();
      }
    } else {
      this.saveSmartText();
    }
  }

  cancelChanges() {
    this.cancelEditSmartText.emit();
  }

  enterTagClicked() {
    this.richEdit.addSpaceBehind();
    this.richEdit.addHighlightedText('[[ENTER]]');
    this.richEdit.moveCursor(1);
  }

  addInputRequest(e: string) {
    this.richEdit.addSpaceBehind();
    this.richEdit.addHighlightedText(`[[?${e}?]]`);
    this.richEdit.moveCursor(1);
  }

  addSelectionOptions(e: string) {
    this.richEdit.addSpaceBehind();
    this.richEdit.addHighlightedText(e);
    this.richEdit.moveCursor(1);
  }

  addMeasurementData(e: { referenceId: number, option: string }) {
    this.richEdit.addSpaceBehind();

    switch (e.option) {
      case 'Value only':
        this.richEdit.addHighlightedText(`[[ReferenceData_${e.referenceId}]]`);
        break;
      case 'Value lookup from HMS-Lists':
        this.richEdit.addHighlightedText(`[[ReferenceData_${e.referenceId}_Lookup]]`);
        break;
      case 'Value with units':
        this.richEdit.addHighlightedText(`[[ReferenceData_${e.referenceId}_WithUnits]]`);
        break;
      default:
        break;
    }

    this.richEdit.moveCursor(1);
  }

  handleError(error: string) {
    this.errorMessage.emit(error);
  }
}
