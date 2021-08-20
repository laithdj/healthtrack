import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

export class PdfList {
  id: number;
  icon?: string;
  name: string;
  _url: string;
  parentId: number;
}
@Component({
  selector: 'app-triage-viewer',
  templateUrl: './triage-viewer.component.html',
  styleUrls: ['./triage-viewer.component.css']
})
export class TriageViewerComponent implements OnInit {
  some_pdf_url = 'http://www.africau.edu/images/default/sample.pdf';
  trustedUrl;

  array_of_pdf: PdfList[] = [{ id: 1, name: 'Referral one', _url: 'http://www.africau.edu/images/default/sample.pdf', parentId: 0 },
  { id: 2, name: 'Referral two', _url: 'http://startupwoman.org/files/pdf-sample(1).pdf', parentId: 0 },
  { id: 1, name: 'Referral three', _url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', parentId: 0 }];

  constructor(private sanitizer: DomSanitizer) {
    this.trustedUrl = sanitizer.bypassSecurityTrustResourceUrl(this.some_pdf_url);

  }
  ngOnInit() {
  }

  SelectPdf(e: any) {
    console.log(e.selectedItem._url);
    this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(e.selectedItem._url);
  }

}
