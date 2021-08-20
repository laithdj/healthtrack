import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-button-set',
  templateUrl: './hms-button-set.component.html'
})
export class HMSButtonSetComponent {
  @Input() editMode = false;
  @Input() addNew = false;

  @Output() addNewClicked: EventEmitter<void> = new EventEmitter();
  @Output() saveClicked: EventEmitter<void> = new EventEmitter();
  @Output() editClicked: EventEmitter<void> = new EventEmitter();
  @Output() cancelClicked: EventEmitter<void> = new EventEmitter();
  @Output() deleteClicked: EventEmitter<void> = new EventEmitter();
  @Output() closeClicked: EventEmitter<void> = new EventEmitter();

  constructor() { }

  onAddNewClicked() {
    this.addNewClicked.emit();
  }

  onSaveClicked() {
    this.saveClicked.emit();
  }

  onCancelClicked() {
    this.cancelClicked.emit();
  }

  onEditClicked() {
    this.editClicked.emit();
  }

  onDeleteClicked() {
    this.deleteClicked.emit();
  }

  onCloseClicked() {
    this.closeClicked.emit();
  }
}
