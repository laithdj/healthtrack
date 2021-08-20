import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PdfList } from '../../../triage/triage-viewer/triage-viewer.component';
import { alert } from 'devextreme/ui/dialog';
import { select, Store } from '@ngrx/store';
import { selectShowReportBeside } from '../../store/clinical-record.selectors';
import { ClinicalRecordAppState } from '../../store/clinical-record.reducers';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {
  some_pdf_url = 'http://www.africau.edu/images/default/sample.pdf';
  trustedUrl;
  showReportBeside$ = this.store.pipe(select(selectShowReportBeside));
  array_of_pdf: PdfList[] = [{ id: 1, name: 'Primary Distribution', _url: '', parentId: 0 },
    { id: 7, name: 'Embed In Report', _url: '', parentId: 0 },
    { id: 2, name: 'Attachments - Distribution', _url: '', parentId: 0 },
    { id: 3, name: 'Referral one', _url: 'http://www.africau.edu/images/default/sample.pdf', parentId: 2 },
    { id: 4, name: 'Attachments - Internal', _url: '', parentId: 0 },
    { id: 5, name: 'Referral three', _url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', parentId: 4 },
    { id: 6, name: 'Referral two', _url: 'http://startupwoman.org/files/pdf-sample(1).pdf', parentId: 4 }];
  pdfTitle = '';
  pages = null;
  updateNode = false;
  selectedNode: number;

  constructor(private sanitizer: DomSanitizer, private store: Store<ClinicalRecordAppState>) {
    this.trustedUrl = sanitizer.bypassSecurityTrustResourceUrl(this.some_pdf_url);
  }

  ngOnInit() { }

  onDragChange(e: any) {
    const visibleRows = e.component.getVisibleRows();
    const sourceNode = e.component.getNodeByKey(e.itemData.id);
    let targetNode = visibleRows[e.toIndex].node;

    while (targetNode && targetNode.data) {
      if (targetNode.data.id === sourceNode.data.id) {
        e.cancel = true;
        break;
      }

      targetNode = targetNode.parent;
    }
  }

  onReorder(e: any) {
    const visibleRows = e.component.getVisibleRows();
    const sourceData = e.itemData;
    const targetData = visibleRows[e.toIndex].data;

    if (e.itemData.parentId !== 0) {
      if (e.dropInsideItem) {
        if (targetData.parentId === 0) {
          e.itemData.parentId = targetData.id;
          e.component.refresh();
        }
      } else {
        const sourceIndex = this.array_of_pdf.indexOf(sourceData);
        let targetIndex = this.array_of_pdf.indexOf(targetData);
        if (sourceData.parentId !== targetData.parentId) {
          sourceData.parentId = targetData.parentId;
          if (e.toIndex > e.fromIndex) {
            targetIndex++;
          }
        }

        this.array_of_pdf.splice(sourceIndex, 1);
        this.array_of_pdf.splice(targetIndex, 0, sourceData);
      }
    }
  }

  renameNode(e: any) {
    if (e.data.parentId !== 0) {
      this.updateNode = true;
      this.pdfTitle = e.data.name;
    }
  }

  removeNode() {
    if (this.array_of_pdf[this.selectedNode].parentId !== 0) {
      this.array_of_pdf.splice(this.selectedNode, 1);
    } else {
      alert('Folder cannot be removed', 'Attention');
    }
  }

  selectPdf(e: any) {
    this.selectedNode = e.dataIndex;
    if (e.data.parentId !== 0) {
      this.pdfTitle = e.data.name;
      this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(e.data._url);
    }
  }
}
