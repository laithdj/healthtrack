import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { confirm } from 'devextreme/ui/dialog';
import * as _ from 'lodash';
import { STClinicalRecordDefinition } from '../models/clinical-record-definition.model';
import { STDoctor } from '../models/doctor.model';
import { STHeaderStyle } from '../models/enums/header-style.enum';
import { STSmartTextType } from '../models/enums/smart-text-type.enum';
import { STReferenceID } from '../models/reference-id.model';
import { STSmartTextNode } from '../models/smart-text-node.model';
import { STSmartTextStyleProperty } from '../models/smart-text-style-property.model';
import { STSmartTextTemplate } from '../models/smart-text-template.model';
import { SmartTextDetailsComponent } from './smart-text-details/smart-text-details.component';
import { TemplateDetailsComponent } from './template-details/template-details.component';

@Component({
  selector: 'lib-smart-text-configuration',
  templateUrl: './smart-text-configuration.component.html',
  styleUrls: ['./smart-text-configuration.component.css'],
})
export class SmartTextConfigurationComponent implements OnInit {
  private _smartTextTemplateList: STSmartTextTemplate[] = [];
  private _smartTextNodeList: STSmartTextNode[] = [];

  @ViewChild(TemplateDetailsComponent) templateDetails: TemplateDetailsComponent;
  @ViewChild(SmartTextDetailsComponent) smartTextDetails: SmartTextDetailsComponent;

  @Input() doctor: STDoctor;
  @Input() definition: STClinicalRecordDefinition;
  @Input()
  get smartTextNodeList(): STSmartTextNode[] { return this._smartTextNodeList; }
  set smartTextNodeList(nodeList: STSmartTextNode[]) {
    this.showLoading = false;
    if (nodeList) {
      this._smartTextNodeList = _.cloneDeep(nodeList);
      const parentIdx = this._smartTextNodeList.findIndex((a) => a.parentID === -1);
      this.expandedRowKeys = (parentIdx > -1) ? [this._smartTextNodeList[parentIdx].navID] : [];
      this.selectDefaultSmartText();
      this.getHeaderList();
    } else {
      this._smartTextNodeList = [];
    }
  }
  @Input()
  get smartTextTemplateList(): STSmartTextTemplate[] { return this._smartTextTemplateList; }
  set smartTextTemplateList(list: STSmartTextTemplate[]) {
    this.showLoading = false;
    if (list) {
      this._smartTextTemplateList = _.cloneDeep(list);
      this.selectDefaultTemplate();
    } else {
      this._smartTextTemplateList = [];
    }
  }
  @Input() smartTextStyleProperties: STSmartTextStyleProperty[];
  @Input() referenceIdList: STReferenceID[];
  @Input() selectedTemplate: STSmartTextTemplate;
  @Input() userName: string;

  @Output() errorMessage = new EventEmitter<string>();
  @Output() reloadClicked = new EventEmitter<boolean>();
  @Output() saveTemplateClicked = new EventEmitter<STSmartTextTemplate>();
  @Output() deleteTemplateClicked = new EventEmitter<number>();
  @Output() saveTemplateList = new EventEmitter<STSmartTextTemplate[]>();
  @Output() deleteSmartTextClicked = new EventEmitter<{ navID: number, list: STSmartTextNode[] }>();
  @Output() saveSmartTextPackageClicked = new EventEmitter<STSmartTextNode[]>();

  smartTextHeaderNodeList: STSmartTextNode[];
  editMode = false;
  showTemplates = true;
  expandedRowKeys: number[] = [];
  selectList: any[] = [{
    id: 1, sortOrder: 1, displayValue: '-- TEMPLATES --', parentId: 0,
  },
  {
    id: 2, sortOrder: 2, displayValue: '-- SMART TEXT --', parentId: 0,
  }];
  selectedNavId: number[];
  selectedTemplateId: number;
  nodeType = STSmartTextType;
  selectedSmartTextListItem: STSmartTextNode;
  smartTextChildren: STSmartTextNode[];
  childrenExpandedRowKeys: number[];
  unsavedSmartTextChanges = false;
  showLoading = false;

  constructor() { }

  ngOnInit() { }

  // show a generic unsaved changes warning when exiting window if there are unsaved changes.
  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler() {
    if (this.unsavedSmartTextChanges) {
      return false;
    }
    return true;
  }

  handleErrorMessage(message: string) {
    this.errorMessage.emit(message);
  }

  getHeaderList() {
    const headers = _.cloneDeep(this.smartTextNodeList.filter((a) => a.nodeType !== STSmartTextType.SmartText
      && (a.styleID === STHeaderStyle.Header1 || a.styleID === STHeaderStyle.Header2
        || a.styleID === STHeaderStyle.Header3)));

    headers.forEach((node) => {
      if (node.styleID === STHeaderStyle.Header1) {
        node.parentID = -1;
      }
    });

    this.smartTextHeaderNodeList = headers;
  }

  onReloadClicked() {
    if (this.unsavedSmartTextChanges === true) {
      const result = confirm('You have unsaved Smart Text changes.<br><br>Do you wish to save?', 'Attention');
      result.then((dialogResult: boolean) => {
        if (dialogResult) {
          this.saveAllSmartText();
          this.showLoading = true;
        } else {
    this.reloadClicked.emit(this.showTemplates);
          this.unsavedSmartTextChanges = false;
  }
      });
    } else {
      this.reloadClicked.emit(this.showTemplates);
    }
  }

  selectionChanged(e: any) {
    if (e && e.row && e.row.data && e.row.data.id === 2) {
      this.showTemplates = false;
      this.selectDefaultSmartText();
    } else {
      this.showTemplates = true;
      this.selectDefaultTemplate();
    }
  }

  selectDefaultSmartText() {
    if (this.smartTextNodeList && this.smartTextNodeList.length > 0) {
      if (this.selectedNavId && this.selectedNavId.length < 0) {
        this.selectedNavId = [this.smartTextNodeList[0].navID];
      }
      this.onSmartTextSelected({ selectedRowsData: [this.smartTextNodeList[0]] });
    } else {
      this.selectedNavId = [];
    }
  }

  selectDefaultTemplate() {
    if (this.smartTextTemplateList.length > 0) {
      let lowestDisplayOrder = 9999;
      let lowestTemplateId = 0;

      this.smartTextTemplateList.forEach((template) => {
        if (template.displayOrder < lowestDisplayOrder) {
          lowestDisplayOrder = template.displayOrder;
          lowestTemplateId = template.templateId;
        }
      });

      this.selectedTemplateId = (lowestTemplateId && lowestTemplateId > 0) ? lowestTemplateId
        : this.smartTextTemplateList[0].templateId;
      this.getSelectedTemplateFromId();
    }
  }

  getSelectedTemplateFromId() {
    if (this.smartTextTemplateList.length > 0 && this.selectedTemplateId && this.selectedTemplateId > 0) {
      const idx = this.smartTextTemplateList.findIndex((a) => a.templateId === this.selectedTemplateId);
      if (idx > 0) {
        this.onTemplateSelected({ row: { data: this.smartTextTemplateList[idx] } });
      }
    }
  }

  onSmartTextSelected(e: any) {
    if (e && e.row && e.row.data) {
      this.selectedSmartTextListItem = _.cloneDeep(e.row.data);
    }
  }

  onTemplateSelected(e: any) {
    if (e && e.row && e.row.data) {
      this.selectedTemplateId = _.cloneDeep(e.row.data.templateId);
      const idx = this.smartTextTemplateList.findIndex((a) => a.templateId === this.selectedTemplateId);
      this.selectedTemplate = this.smartTextTemplateList[idx] as STSmartTextTemplate;
    }
  }

  contentReady() {
    const idx = this.smartTextTemplateList.findIndex((a) => a.templateId === this.selectedTemplateId);
    this.selectedTemplate = this.smartTextTemplateList[idx] as STSmartTextTemplate;
  }

  onDragChange() {
    // Causing errors on drag for some reason~ commented out for now.
    // const visibleRows = e.component.getVisibleRows();
    // const sourceNode = e.component.getNodeByKey(e.itemData.navId);
    // let targetNode = visibleRows[e.toIndex].node;

    // while (targetNode && targetNode.data) {
    //   if (targetNode.data.navId === sourceNode.data.navId) {
    //     e.cancel = true;
    //     break;
    //   }
    //   targetNode = targetNode.parent;
    // }
  }

  changeParent = (newParentNavId: number, oldParentNavId: number, navId: number,
    oldPosition: number, newPosition: number) => {
    const newSiblings: number[] = this.smartTextNodeList.filter((a) => a.parentID === newParentNavId)
      .map((b) => b.navID);
    const updatedSmartTextItems: STSmartTextNode[] = [];

    // update position of new siblings
    newSiblings.forEach((id) => {
      const idx = this.smartTextNodeList.findIndex((a) => a.navID === id);
      const sibling = _.cloneDeep(this.smartTextNodeList[idx]);

      if (newPosition === 1 || sibling.displayOrder >= newPosition) {
        sibling.displayOrder += 1;
        updatedSmartTextItems.push(sibling);
      }
    });

    // update the item being moved
    const movedIndex = this.smartTextNodeList.findIndex((a) => a.navID === navId);
    const moved = _.cloneDeep(this.smartTextNodeList[movedIndex]);
    moved.displayOrder = newPosition;
    moved.parentID = newParentNavId;
    updatedSmartTextItems.push(moved);

    // update the old siblings
    const oldSiblings: number[] = this.smartTextNodeList.filter((a) => a.parentID === oldParentNavId)
      .map((b) => b.navID);

    oldSiblings.forEach((nav) => {
      const index = this.smartTextNodeList.findIndex((a) => a.navID === nav);

      if (this.smartTextNodeList[index].displayOrder > oldPosition) {
        const item = _.cloneDeep(this.smartTextNodeList[index]);
        item.displayOrder -= 1;
        updatedSmartTextItems.push(item);
      }
    });

    const listCopy = _.cloneDeep(this.smartTextNodeList);
    updatedSmartTextItems.forEach((node) => {
      const index = listCopy.findIndex((a) => a.navID === node.navID);
      if (index > -1) {
        listCopy[index].displayOrder = node.displayOrder;
        listCopy[index].parentID = node.parentID;
  }
    });

    this.smartTextNodeList = listCopy;
    this.unsavedSmartTextChanges = true;
  }

  reorderSiblings = (parentId: number, navId: number, oldPosition: number, newPosition: number) => {
    if (oldPosition === newPosition) {
      return; // do nothing as it didn't move
    }

    const siblings: STSmartTextNode[] = _.cloneDeep(this.smartTextNodeList.filter((a) => a.parentID === parentId));

    siblings.forEach((st) => {
      if (navId === st.navID) {
        st.displayOrder = newPosition;
      } else {
        if (oldPosition < newPosition) {
          if (st.displayOrder >= oldPosition && st.displayOrder <= newPosition) {
            st.displayOrder -= 1;
          }
        }
        if (oldPosition > newPosition) {
          if (st.displayOrder <= oldPosition && st.displayOrder >= newPosition) {
            st.displayOrder += 1;
          }
        }
      }
    });

    const listCopy = _.cloneDeep(this.smartTextNodeList);
    siblings.forEach((node) => {
      const index = listCopy.findIndex((a) => a.navID === node.navID);
      if (index > -1) {
        listCopy[index].displayOrder = node.displayOrder;
  }
    });

    this.smartTextNodeList = listCopy;
    this.unsavedSmartTextChanges = true;
  }

  onReorder = (e: any) => {
    // the rows currently rendered in the tree list
    const visibleRows = e.component.getVisibleRows();
    // the original data
    const sourceData: STSmartTextNode = e.itemData;
    // the node it dragged to or the node below of dragged into a space
    const targetData: STSmartTextNode = visibleRows[e.toIndex].data;
    const oldParentId = sourceData.parentID;
    const newParentId = (e.dropInsideItem) ? targetData.navID : targetData.parentID;
    const oldPosition = sourceData.displayOrder;
    const newPosition = (e.dropInsideItem) ? 1 : targetData.displayOrder;

    if (oldParentId === newParentId) {
      this.reorderSiblings(newParentId, sourceData.navID, oldPosition, newPosition);
    } else {
      this.changeParent(newParentId, oldParentId, sourceData.navID, oldPosition, newPosition);
    }

    e.component.refresh();
  }

  onTemplateReorder = (e: any) => {
    const sourceData: STSmartTextTemplate = e.itemData;
    const oldPosition: number = e.fromIndex + 1;
    const newPosition: number = e.toIndex + 1;

    if (oldPosition === newPosition) {
      return; // do nothing as it didn't move
    }

    this.smartTextTemplateList.forEach((template) => {
      if (template.templateId === sourceData.templateId) {
        template.displayOrder = newPosition;
      } else {
        // it moved down
        // eslint-disable-next-line no-lonely-if
        if (oldPosition < newPosition) {
          if (template.displayOrder >= (oldPosition) && template.displayOrder <= (newPosition)) {
            template.displayOrder -= 1;
          }
        } else if (template.displayOrder <= oldPosition && template.displayOrder >= newPosition) {
          template.displayOrder += 1;
        }
      }

      if (template.displayOrder === 0) {
        template.displayOrder = 1;
      }
    });

    this.saveTemplateList.emit(this.smartTextTemplateList);
    e.component.refresh();
  }

  addNewTemplate(duplicate: boolean) {
    this.editMode = true;
    this.templateDetails.newTemplate(duplicate);
  }

  addNewSmartText(nodeType: STSmartTextType) {
    this.editMode = true;
    this.smartTextDetails.addNewSmartText(nodeType);
  }

  cancelEditTemplate() {
    this.templateDetails.undoChanges();
    this.editMode = false;
  }

  cancelEditSmartText() {
    const index = this.smartTextNodeList.findIndex((a) => a.navID === this.selectedSmartTextListItem.navID);

    // required to force rich text editor to refresh content
    this.selectedSmartTextListItem.nodeText = undefined;
    setTimeout(() => {
      this.selectedSmartTextListItem = _.cloneDeep(this.smartTextNodeList[index]);
    }, 10);

    this.editMode = false;
  }

  deleteTemplate() {
    const result = confirm('Please confirm you wish to permanently delete this Template.<br><b>Deleted '
      + 'Templates cannot be recovered.</b>', 'Attention');
    result.then((dialogResult: boolean) => {
      if (dialogResult && this.selectedTemplate?.templateId && this.selectedTemplate.templateId > 0) {
        this.deleteTemplateClicked.emit(this.selectedTemplate.templateId);
        this.editMode = false;
      }
    });
  }

  deleteSmartText() {
    const children = this.smartTextNodeList.filter((a) => a.parentID === this.selectedSmartTextListItem.navID);

    const result = (children && children.length > 0) ? confirm('This Node has child Nodes.<br><b>Deleting this Node '
      + 'will also delete these child Nodes.</b><br><b>Deleted items cannot be restored.</b><br><br>Please confirm '
      + 'you wish to delete this Node and all child Nodes.', 'Attention')
      : confirm('Please confirm you wish to delete this Node.<br><br><b>Deleted items cannot be restored'
        + '.</b>', 'Attention');

    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        let siblings = _.cloneDeep(this.smartTextNodeList.filter(
          (a) => a.parentID === this.selectedSmartTextListItem.parentID));

        siblings.forEach((st) => {
          if (st.navID === this.selectedSmartTextListItem.navID) {
            // DO NOTHING
          } else if (st.displayOrder > this.selectedSmartTextListItem.displayOrder) {
            st.displayOrder -= 1;
          }
        });

        // remove the item to be deleted
        siblings = siblings.filter((a) => a.navID !== this.selectedSmartTextListItem.navID);
        this.deleteSmartTextClicked.emit({ navID: this.selectedSmartTextListItem.navID, list: siblings });
        this.editMode = false;
      }
    });
  }

  saveTemplate() {
    const template = this.templateDetails.selectedTemplate;
    this.saveTemplateClicked.emit(template);
    this.editMode = false;
  }

  undoTemplateChanges() {
    this.selectedTemplate = _.cloneDeep(this.selectedTemplate);
  }

  saveSmartText(node: STSmartTextNode) {
    const cloneList = _.cloneDeep(this.smartTextNodeList);
    const index = this.smartTextNodeList.findIndex((a) => a.navID === node.navID);

    if (index > -1) { // replace existing
      cloneList[index] = node;
    } else { // is new
      cloneList.push(node);
    }

    this.smartTextNodeList = cloneList;
    this.editMode = false;
    this.unsavedSmartTextChanges = true;
  }

  editTemplateClicked() {
    this.editMode = true;
  }

  nodeListSelectionChanged(e: any) {
    if (e && e.row && e.row.data) {
      const parentId: number = e.row.data.navID;
      let children: STSmartTextNode[];

      if (parentId === -1) {
        const rootIdx = this.smartTextNodeList.findIndex((a) => a.parentID === -1);

        if (rootIdx > -1) {
          const parent = this.smartTextNodeList[rootIdx];
          children = _.cloneDeep(this.smartTextNodeList.filter((a) => a.parentID === parent.navID));
        } else {
          children = [];
        }
      } else {
        children = _.cloneDeep(this.smartTextNodeList.filter((a) => a.parentID === parentId));
      }

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
            const node = getChildrenFor[index];
            const childrenOfNode = _.cloneDeep(this.smartTextNodeList.filter((a) => a.parentID === node.navID));
            add = add.concat(childrenOfNode);
          }

          children = children.concat(getChildrenFor);
          getChildrenFor = _.cloneDeep(add);
          add = [];
        }
      }

      this.smartTextChildren = children;
      const expand = [];

      children.forEach((node) => {
        if (node.parentID === -1) {
          expand.push(node.navID);
        }
      });

      this.childrenExpandedRowKeys = _.cloneDeep(expand);
    }
  }

  goToHeaderOrAddNew(e: any): void {
    const node = e?.data as STSmartTextNode;

    if (node) {
      // if ((node.navID > 0 && node.nodeText !== '-- TEMPLATES --' && node.nodeText !== '-- MEASUREMENTS --')) {
      if (node.trackingDisabled === true) {
        this.templateDetails.richEdit.addUntrackedHeader(node);
      } else {
        this.templateDetails.richEdit.goToHeaderOrAddNew(node);
      }
      // } else if (node.navID === 0 && node.nodeText === '-- TEMPLATES --') {
      //   this.showTemplates = true;
      //   this.templateDetails.show.showMeasurements = false;
      // } else if (node.nodeText === '-- MEASUREMENTS --') {
      //   this.templateDetails.showMeasurements = true;
      // }
    }

    this.templateDetails.richEdit.focus();
  }

  // getExpandedRowKeys(): number[] {
  //   if (this.smartTextChildren && this.smartTextChildren.length > 0) {
  //     const parent = this.smartTextChildren.findIndex(a => a.parentID === -1);
  //     return (parent > -1) ? [ this.smartTextChildren[parent].navID ] : [];
  //   } else {
  //     return [];
  //   }
  // }

  onSmartTextChildSelected(e: any) {
    if (e && e.node && e.node.data && e.node.data.nodeText) {
      if (e.node.data.nodeType === STSmartTextType.SmartText) {
        this.templateDetails.richEdit.addTrimmedSmartText(e.node.data.nodeText);
      }
    }
  }

  saveAllSmartText() {
    this.showLoading = true;
    this.saveSmartTextPackageClicked.emit(this.smartTextNodeList);
    this.unsavedSmartTextChanges = false;
}
}
