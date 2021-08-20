import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-button-edit',
  templateUrl: './hms-button-edit.component.html'
})
export class HMSButtonEditComponent {
  @Input() editMode = false;
  @Input() isLast = true;
  @Input() disabled = false;

  @Output() cancelClicked: EventEmitter<void> = new EventEmitter();
  @Output() editClicked: EventEmitter<void> = new EventEmitter();

  constructor() { }

  onButtonClicked() {
    if (this.editMode) {
      this.cancelClicked.emit();
    } else {
      this.editClicked.emit();
    }
  }
}
