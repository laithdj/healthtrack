import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import {
  DxTextAreaComponent,
  DxDataGridComponent,
  DxNumberBoxComponent,
} from 'devextreme-angular';
import { STReferenceID } from '../../../models/reference-id.model';

@Component({
  selector: 'lib-smart-text-insert-tag',
  templateUrl: './smart-text-insert-tag.component.html',
  styleUrls: ['./smart-text-insert-tag.component.css'],
})
export class SmartTextInsertTagComponent {
  @ViewChild('inputRequestTextArea') inputRequestTextArea: DxTextAreaComponent;
  @ViewChild('selectionOptionsGrid') selectionOptionsGrid: DxDataGridComponent;
  @ViewChild('measurementDataNumberBox') measurementDataNumberBox: DxNumberBoxComponent;

  @Input() editMode = false;
  @Input() referenceIdList: STReferenceID[];

  @Output() inputRequestClicked = new EventEmitter<string>();
  @Output() selectionOptionsClicked = new EventEmitter<string>();
  @Output() measurementDataClicked = new EventEmitter<{ referenceId: number, option: string }>();
  @Output() enterClicked = new EventEmitter<void>();
  @Output() errorMessage = new EventEmitter<string>();

  showInputRequestPopup = false;
  inputRequest = '';
  showSelectionOptionsPopup = false;
  selectionOptions: { selectionOption: string }[] = [];
  selectionOptionsMultiselect = false;
  multiselectOption = 'And';
  showMeasurementData = false;
  referenceId: number;
  referenceIdOptions = ['Value only', 'Value with units'];
  // referenceIdOptions = [ 'Value only', 'Value lookup from HMS-Lists', 'Value with units' ];
  referenceIdOption = this.referenceIdOptions[0];

  constructor() { }

  inputRequestShown() {
    const that = this;
    if (!this.showMeasurementData && that?.inputRequestTextArea?.instance) {
      that.inputRequestTextArea.instance.focus();
    } else if (this.showMeasurementData && that?.measurementDataNumberBox?.instance) {
      that.measurementDataNumberBox.instance.focus();
    }
  }

  onInputRequestClicked() {
    this.inputRequest = '';
    this.referenceId = undefined;
    // eslint-disable-next-line prefer-destructuring
    this.referenceIdOption = this.referenceIdOptions[0];
    this.showMeasurementData = false;
    this.showInputRequestPopup = true;
  }

  addInputRequestClicked() {
    if (!this.showMeasurementData && this.inputRequest.trim().length > 0) {
      this.inputRequestClicked.emit(this.inputRequest.trim());
      this.showInputRequestPopup = false;
    } else if (this.showMeasurementData) {
      if (!this.referenceId || this.referenceIdList.some((a) => a.referenceId === this.referenceId)) {
        this.measurementDataClicked.emit({ referenceId: this.referenceId, option: this.referenceIdOption });
        this.showInputRequestPopup = false;
      } else {
        this.errorMessage.emit(`Reference ID: ${this.referenceId} could not be found.`);
      }
    }
  }

  onSelectionOptionsClicked() {
    this.selectionOptions = [];
    this.selectionOptionsMultiselect = false;
    this.showSelectionOptionsPopup = true;
  }

  addSelectionOption() {
    this.selectionOptionsGrid.instance.addRow();
  }

  addSelectionOptionsClicked() {
    this.selectionOptionsGrid.instance.saveEditData();

    if (this.selectionOptions.length > 0) {
      let options = '[';

      if (this.selectionOptionsMultiselect === true) {
        if (this.multiselectOption === 'And') {
          options += '[+and+]';
        } else if (this.multiselectOption === 'Or') {
          options += '[+or+]';
        }
      }

      this.selectionOptions.forEach((option) => {
        if (option.selectionOption && option.selectionOption.length > 0) {
          options = `${options}[${option.selectionOption}]`;
        }
      });

      options += ']';
      this.selectionOptionsClicked.emit(options);
      this.showSelectionOptionsPopup = false;
    }
  }

  onMeasurementDataClicked() {
    this.inputRequest = 'INPUT REQUIRED';
    this.referenceId = undefined;
    // eslint-disable-next-line prefer-destructuring
    this.referenceIdOption = this.referenceIdOptions[0];
    this.showMeasurementData = true;
    this.showInputRequestPopup = true;
  }

  onEnterClicked() {
    this.enterClicked.emit();
  }
}
