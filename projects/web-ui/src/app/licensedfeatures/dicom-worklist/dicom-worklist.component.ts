import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dicom-worklist',
  templateUrl: './dicom-worklist.component.html',
  styleUrls: ['./dicom-worklist.component.css'],
})
export class DicomWorklistComponent {
  @Input() editMode: boolean;

  constructor() { }
}
