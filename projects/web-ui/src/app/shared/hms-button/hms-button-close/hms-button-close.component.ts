import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-button-close',
  templateUrl: './hms-button-close.component.html'
})
export class HMSButtonCloseComponent {
  @Input() isLast = true;

  @Output() closeClicked: EventEmitter<void> = new EventEmitter();

  constructor() { }

  onCloseClicked() {
    this.closeClicked.emit();
  }
}
