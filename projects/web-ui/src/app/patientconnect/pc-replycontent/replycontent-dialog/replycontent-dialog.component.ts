import { Component, Input, EventEmitter, Output } from '@angular/core';
import { ReplyContentDO } from '../../../../../../../Generated/CoreAPIClient';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app-store/reducers';
import { SetError } from '../../../app-store/app-ui-state.actions';

@Component({
  selector: 'app-replycontent-dialog',
  templateUrl: './replycontent-dialog.component.html',
  styleUrls: ['./replycontent-dialog.component.css']
})

export class ReplycontentDialogComponent {
  @Input() reply: ReplyContentDO;
  @Input() dateReceivedDisabled: boolean;
  @Output() onConfirmFunction = new EventEmitter();
  @Output() onCancelFunction = new EventEmitter();

  valueValidation = {
    isValid: true,
    message: '',
  };

  constructor(private store: Store<AppState>) {}

  preventValidationTooltip(e) {
    if (e.element && e.element.children && e.element.children[2]) { e.element.children[2].classList = []; }
  }

  onCancel = () => {
    this.onCancelFunction.emit();
    this.valueValidation.isValid = true;
  }

  validationFail(formValidation) {
    if (formValidation.brokenRules.find(item => item.type === 'required')) {
      this.valueValidation.message = 'Value cannot be empty';
      this.valueValidation.isValid = false;
    }
  }

  onOK = (e) => {
    const formValidation = e.validationGroup.validate();
    if (formValidation.isValid === true) {
      this.onConfirmFunction.emit(this.reply);
      this.valueValidation.isValid = true;
    } else {
      this.validationFail(formValidation);
    }
  }
  save(){
    if(this.reply){
      if(this.reply.contentValue){
        this.onConfirmFunction.emit(this.reply);
      }else{
        this.store.dispatch(new SetError({ errorMessages: ['Value can not be empty.'] }));
      }
    }
  }
}
