import {
  Component,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';

@Component({
  selector: 'hms-confirm',
  templateUrl: './hms-confirm.component.html',
})
export class HMSConfirmComponent {
  @Input() title = 'Attention';
  @Input() content = 'Please Confirm';
  @Input() confirmationButtonText = 'OK';
  @Input() cancelButtonText = 'Cancel';
  @Input() showPopup = false;

  @Output() confirmClicked: EventEmitter<void> = new EventEmitter();
  @Output() cancelClicked: EventEmitter<void> = new EventEmitter();
  @Output() popupClosed: EventEmitter<void> = new EventEmitter();

  constructor() { }

  onCancelClicked() {
    this.cancelClicked.emit();
  }

  onConfirmClicked() {
    this.confirmClicked.emit();
  }

  onCloseClicked() {
    this.popupClosed.emit();
    this.showPopup = false;
  }
}
