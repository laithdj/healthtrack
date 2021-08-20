import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'hms-button-cancel',
  templateUrl: './hms-button-cancel.component.html'
})
export class HMSButtonCancelComponent {
  @Input() isLast = true;
  @Input() disabled = false;
  @Input() text = 'Cancel';


  @Output() cancelClicked: EventEmitter<void> = new EventEmitter();

  constructor() { }

  onCancelClicked() {
    this.cancelClicked.emit();
  }
}
