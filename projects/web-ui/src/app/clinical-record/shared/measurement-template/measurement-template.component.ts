import { Component, OnInit, Input } from '@angular/core';
import { MeasurementUnit } from '../../echocardiogram/echocardiogram-measurement.model';

@Component({
  selector: 'app-measurement-template',
  templateUrl: './measurement-template.component.html',
  styleUrls: ['./measurement-template.component.css']
})
export class MeasurementTemplateComponent {
  @Input() measurement: number;
  @Input() measurementUnit: MeasurementUnit;
  @Input() rangeLow: number;
  @Input() rangeHigh: number;
  @Input() editMode: boolean;

  public mUnit: MeasurementUnit;

  constructor() { }
}
