import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-button-save',
  templateUrl: './hms-button-save.component.html'
})
export class HMSButtonSaveComponent {
  @Input() isLast = true;
  @Input() disabled = false;

  @Output() saveClicked: EventEmitter<void> = new EventEmitter();

  constructor() { }

  onSaveClicked() {
    this.saveClicked.emit();
  }
}
