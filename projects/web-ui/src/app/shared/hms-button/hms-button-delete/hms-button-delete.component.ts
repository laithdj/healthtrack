import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-button-delete',
  templateUrl: './hms-button-delete.component.html'
})
export class HMSButtonDeleteComponent {
  @Input() disabled = false;
  @Input() isLast = true;

  @Output() deleteClicked: EventEmitter<void> = new EventEmitter();

  constructor() { }

  onButtonClicked() {
    this.deleteClicked.emit();
  }
}
