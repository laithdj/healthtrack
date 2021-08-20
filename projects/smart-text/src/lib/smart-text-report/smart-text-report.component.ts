import * as _ from 'lodash';
import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { custom } from 'devextreme/ui/dialog';
import { RichTextEditorComponent } from '../rich-text-editor/rich-text-editor.component';
import { STMeasurement } from '../models/measurement.model';
import { STSmartTextBundle } from '../models/smart-text-bundle.model';
import { STSmartTextNode } from '../models/smart-text-node.model';
import { STSmartTextType } from '../models/enums/smart-text-type.enum';
import { STHeaderStyle } from '../models/enums/header-style.enum';
import { STSetSize } from '../models/set-size.model';
import { STLetterTagValue } from '../models/hms-letter-tag-value.model';

@Component({
  selector: 'lib-smart-text-report',
  templateUrl: './smart-text-report.component.html',
  styleUrls: ['./smart-text-report.component.css'],
})
export class SmartTextReportComponent implements OnInit, AfterViewInit {
  private _smartTextBundle: STSmartTextBundle;

  @ViewChild(RichTextEditorComponent, { static: false }) richEdit: RichTextEditorComponent;

  @Input() richEditorSize: STSetSize = { height: 'calc(100vh - 195px)', width: '790px' };
  @Input() reportContent: string;
  @Input() userName: string;
  @Input() drawerHeight = 'calc(100vh - 200px)';
  @Input() lowerListHeight = 'calc(75vh - 230px)';
  @Input() showSmartText = true;
  @Input() showReportBeside = false;
  @Input() measurements: STMeasurement[];
  @Input() hmsLetterTemplateTagValues: STLetterTagValue[];
  @Input()
  get smartTextBundle(): STSmartTextBundle { return this._smartTextBundle; }
  set smartTextBundle(bundle: STSmartTextBundle) {
    this._smartTextBundle = _.cloneDeep(bundle);
    this.setHeaders();
  }

  @Output() showSmartTextToggled = new EventEmitter<boolean>();
  @Output() showReportBesideToggled = new EventEmitter<{ showReportBeside: boolean, reportContent: string }>();
  @Output() refreshSmartText = new EventEmitter<void>();
  @Output() openConfigScreen = new EventEmitter<void>();
  @Output() fetchHMSLetterTagValues = new EventEmitter<string[]>()

  reportReady = true;
  expandedRowKeys: number[];
  smartTextChildren: STSmartTextNode[];
  showTemplates = true;
  showMeasurements = false;
  headerList: STSmartTextNode[];

  constructor() { }

  ngOnInit() {
    // this.store.pipe(select(selectSmartTextList), takeUntil(this._destroyed$)).subscribe(list => {
    //   const copy = _.cloneDeep(list);
    //   copy.forEach(element => {
    //     element.parentID = -1;
    //   });
    //   this.smartTextChildren = copy;
    //   this.expandedRowKeys = this.getExpandedRowKeys();
    // });

    // this.store.pipe(select(selectSmartTextList), takeUntil(this._destroyed$)).subscribe(list => {
    //   const copy = _.cloneDeep(list);
    //   copy.forEach(element => {
    //     element.parentID = -1;
    //   });
    //   this.smartTextChildren = copy;
    //   this.expandedRowKeys = this.getExpandedRowKeys();
    // });
  }

  ngAfterViewInit(): void {
    this.reportReady = true;
  }

  setHeaders(): void {
    const temp = new STSmartTextNode();
    temp.navID = 0;
    temp.parentID = -1;
    temp.shortDescription = '-- TEMPLATES --';
    temp.nodeText = '-- TEMPLATES --';
    temp.displayOrder = 0;

    const measurements = new STSmartTextNode();
    measurements.navID = 1;
    measurements.parentID = -1;
    measurements.shortDescription = '-- MEASUREMENTS --';
    measurements.nodeText = '-- MEASUREMENTS --';
    measurements.displayOrder = 1;

    for (let index = 1; index < this.smartTextBundle?.smartTextPackage?.smartTextNodes.length + 2; index++) {
      if (!this.smartTextBundle.smartTextPackage.smartTextNodes.some((a) => a.navID === index)) {
        measurements.navID = index;
        break;
      }
    }

    if (this.smartTextBundle?.smartTextPackage?.smartTextNodes?.length > 0) {
      const parentId = this.smartTextBundle?.smartTextPackage?.smartTextNodes?.find(
        (a) => a.navID > 0 && a.parentID === -1);

      if (parentId) {
        const list: STSmartTextNode[] = _.cloneDeep(this.smartTextBundle?.smartTextPackage?.smartTextNodes)
          .filter((a) => a.parentID > 0 && a.nodeType !== STSmartTextType.SmartText
          && (a.styleID === STHeaderStyle.Header1 || a.styleID === STHeaderStyle.Header2
          || a.styleID === STHeaderStyle.Header3 || a.styleID === STHeaderStyle.Invisible));

        list.forEach((a) => {
          a.parentID = (a.parentID === parentId.navID) ? -1 : a.parentID;
          a.displayOrder += 1;
        });

        list.unshift(temp);
        list.unshift(measurements);
        this.headerList = list;
      } else {
        const list = _.cloneDeep(this.smartTextBundle?.smartTextPackage?.smartTextNodes);
        list.forEach((a) => {
          a.displayOrder += 1;

          return a;
        });

        this.headerList = list.concat([temp, measurements]);
      }
    } else {
      this.headerList = [temp, measurements];
    }
  }

  getExpandedRowKeys(): number[] {
    if (this.smartTextChildren && this.smartTextChildren.length > 0) {
      const parent = this.smartTextChildren.findIndex((a) => a.parentID === -1);

      return (parent > -1) ? [this.smartTextChildren[parent].navID] : [];
    }

    return [];
  }

  nodeListSelectionChanged(e: any): void {
    const selectedNode: STSmartTextNode = e?.row?.data;
    const nodeIndex = this.smartTextBundle?.smartTextPackage?.smartTextNodes
      ? this.headerList.findIndex((a) => a.navID === selectedNode.navID) : -1;
    const node = nodeIndex > -1 ? this.headerList[nodeIndex] : undefined;

    if (node && node.navID > 0 && node.nodeText !== '-- TEMPLATES --' && node.nodeText !== '-- MEASUREMENTS --') {
      const parentId: number = selectedNode.navID;
      let children: STSmartTextNode[] = _.cloneDeep(this.smartTextBundle?.smartTextPackage?.smartTextNodes
        .filter((a) => a.parentID === parentId));

      children.forEach((element) => {
        element.parentID = -1;
      });

      // recursively get all children
      let getChildrenFor = _.cloneDeep(children);
      children = [];
      let add = [];

      if (getChildrenFor && getChildrenFor.length > 0) {
        while (getChildrenFor.length > 0) {
          for (let index = 0; index < getChildrenFor.length; index++) {
            const n = getChildrenFor[index];
            const childrenOfNode = _.cloneDeep(this.smartTextBundle?.smartTextPackage?.smartTextNodes
              .filter((a) => a.parentID === n.navID));
            add = add.concat(childrenOfNode);
          }

          children = children.concat(getChildrenFor);
          getChildrenFor = _.cloneDeep(add);
          add = [];
        }
      }

      this.smartTextChildren = children;
      this.expandedRowKeys = this.getExpandedRowKeys();
      this.showTemplates = false;
      this.showMeasurements = false;
    } else if (node && node.navID === 0 && node.nodeText === '-- TEMPLATES --') {
      this.showTemplates = true;
      this.showMeasurements = false;
    } else if (node && node.nodeText === '-- MEASUREMENTS --') {
      this.showMeasurements = true;
    }
  }

  getReportContent(): string {
    if (this.richEdit.hasContent() === true) {
      return this.richEdit.getRtf();
    }
    return '';
  }

  onMeasurementSelected(e: any): void {
    const measurement = e.data as STMeasurement;

    if (measurement?.result) {
      if (measurement?.units?.trim().length > 0) {
        this.richEdit.addSmartText(measurement.result + measurement.units, true);
      } else {
        this.richEdit.addSmartText(measurement.result, true);
      }
    } else {
      this.richEdit.addSmartText('UNKNOWN', true);
    }
  }

  onTemplateSelected(e: any): void {
    this.reportContent = this.getReportContent();

    if (this.reportContent && this.reportContent.trim().length > 0) {
      const dialog = custom({
        title: 'Load Smart Text Template',
        messageHtml: 'The report editor already contains existing text - please choose what to do with this new'
          + ' report template:<br><br>APPEND - Adds your new template to the end of the editor. The smart text '
          + 'header tracking system will be disabled.<br><br>CLEAR and REPLACE - Clears ALL existing report text'
          + ' and replaces it with your new template.',
        buttons: [{ text: 'Append', onClick: () => 'Append' },
          { text: 'Clear and Replace', onClick: () => 'Clear and Replace' },
          { text: 'Cancel', onClick: () => 'Cancel' }],
      });

      dialog.show().then((result: any) => {
        if (result === 'Append') { // append to end
          if (e?.node?.data?.templateId > 0) {
            this.richEdit.focus();
            this.richEdit.moveCursorToEnd();
            this.richEdit.insertTemplateContent(e.node.data.fullText);
            this.richEdit.moveCursorToEnd();
          }
        } else if (result === 'Clear and Replace') {
          if (e?.node?.data?.templateId > 0) {
            this.reportContent = undefined;
            this.richEdit.clearText();
            this.richEdit.clearFields();
            this.richEdit.focus();
            this.richEdit.moveCursorToEnd();
            this.richEdit.insertTemplateContent(e.node.data.fullText);
            this.richEdit.moveCursorToEnd();
          }
        }
      });
    } else if (e?.node?.data?.templateId > 0) {
      this.reportContent = undefined;
      this.richEdit.focus();
      this.richEdit.moveCursorToEnd();
      this.richEdit.insertTemplateContent(e.node.data.fullText);
      this.richEdit.moveCursorToEnd();
    }

    this.reportContent = this.getReportContent();
  }

  onSmartTextSelected(e: any): void {
    const node = (e?.data) ? e.data as STSmartTextNode : undefined;

    if (node?.nodeType && node?.nodeText) {
      if (e.node.data.nodeType === STSmartTextType.SmartText) {
        this.addSmartTextToHeader(node.navID);
      } else {
        //  this.goToHeaderOrAddNew({ data: node });
      }
    }

    this.richEdit.focus();
  }

  goToHeaderOrAddNew(e: any): void {
    const node = e?.data as STSmartTextNode;

    if (node) {
      if ((node.navID > 0 && node.nodeText !== '-- TEMPLATES --' && node.nodeText !== '-- MEASUREMENTS --')) {
        if (node.trackingDisabled === true) {
          this.richEdit.addUntrackedHeader(node);
        } else {
          this.richEdit.goToHeaderOrAddNew(node);
        }
      } else if (node.navID === 0 && node.nodeText === '-- TEMPLATES --') {
        this.showTemplates = true;
        this.showMeasurements = false;
      } else if (node.nodeText === '-- MEASUREMENTS --') {
        this.showMeasurements = true;
      }
    }

    this.richEdit.focus();
  }

  toggleShowSmartText = () => {
    this.showSmartText = !this.showSmartText;
    this.showSmartTextToggled.emit(this.showSmartText);
  }

  toggleShowReportBeside = () => {
    this.showReportBeside = !this.showReportBeside;
    this.showReportBesideToggled.emit({
      showReportBeside: this.showReportBeside,
      reportContent: this.getReportContent(),
    });
  }

  refreshSmartTextClicked = () => {
    this.refreshSmartText.emit();
  }

  openConfigScreenClicked = () => {
    this.openConfigScreen.emit();
  }

  getActiveHeader(node: STSmartTextNode): STSmartTextNode {
    const parentNode = this.smartTextBundle?.smartTextPackage?.smartTextNodes.find((pr) => pr.navID === node.parentID);

    if (parentNode) {
      if ((parentNode.nodeType !== STSmartTextType.SmartText) && (parentNode.styleID !== STHeaderStyle.Normal)) {
        return parentNode;
      }
      return this.getActiveHeader(parentNode);
    }

    return undefined;
  }

  addSmartTextToHeader(smartTextNodeId: number): void {
    const idx = this.smartTextBundle?.smartTextPackage?.smartTextNodes.findIndex((a) => a.navID === smartTextNodeId);

    if (idx > -1) {
      const disabledPunctuation = this.toDisablePunctuation(
        this.smartTextBundle?.smartTextPackage?.smartTextNodes[idx]);
      const activeHeaderNode = this.getActiveHeader(this.smartTextBundle?.smartTextPackage?.smartTextNodes[idx]);
      if (activeHeaderNode) {
        if (!activeHeaderNode.trackingDisabled) {
          this.richEdit.goToHeaderOrAddNew(activeHeaderNode);
        }
      }

      this.richEdit.insertSmartTextNode(this.smartTextBundle?.smartTextPackage?.smartTextNodes[idx],
        true, disabledPunctuation, true);
    }
  }

  toDisablePunctuation(node: STSmartTextNode) : boolean {
    let value = false;
    let parentNode = this.smartTextBundle?.smartTextPackage?.smartTextNodes.find((pr) => pr.navID === node.parentID);

    while (parentNode) {
      const parentID = parentNode?.parentID;

      if (parentNode.disablePunctuation) {
        value = true;
        break;
      }

      parentNode = this.smartTextBundle?.smartTextPackage?.smartTextNodes.find((pr) => pr.navID === parentID);
    }

    return value;
  }

  fetchLetterTagValues(tags: string[]) {
    this.fetchHMSLetterTagValues.emit(tags);
  }
}
