import {
  Component,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';

@Component({
  selector: 'hms-button-set-save',
  templateUrl: './hms-button-set-save.component.html',
})
export class HMSButtonSetSaveComponent {
  @Input() includeDeleteButton = true;
  @Input() disabled = false;
  @Input() EditText = 'Cancel';

  @Output() cancelClicked: EventEmitter<void> = new EventEmitter();
  @Output() deleteClicked: EventEmitter<void> = new EventEmitter();
  @Output() saveClicked: EventEmitter<void> = new EventEmitter();

  constructor() { }

  onCancelClicked() {
    this.cancelClicked.emit();
  }

  onDeleteClicked() {
    this.deleteClicked.emit();
  }

  onSaveClicked() {
    this.saveClicked.emit();
  }
}
