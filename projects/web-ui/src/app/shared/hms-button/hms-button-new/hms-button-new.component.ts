import { Component, Input, Output, EventEmitter } from '@angular/core';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-button-new',
  templateUrl: './hms-button-new.component.html'
})
export class HMSButtonNewComponent {
  @Input() editMode = false;
  @Input() isLast = true;

  @Output() addNewClicked: EventEmitter<void> = new EventEmitter();
  @Output() saveClicked: EventEmitter<void> = new EventEmitter();

  constructor() { }

  onButtonClicked() {
    if (this.editMode) {
      this.saveClicked.emit();
    } else {
      this.addNewClicked.emit();
    }
  }
}
