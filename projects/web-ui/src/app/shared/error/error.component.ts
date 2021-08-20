import { Component, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { alert } from 'devextreme/ui/dialog';
import { AlertPopup } from '../models/AlertPopup.model';
import { selectAlertPopup } from '../../app-store/app-ui.selectors';
import { CloseError } from '../../app-store/app-ui-state.actions';

@Component({
  selector: 'app-error',
  template: '',
})

export class ErrorComponent implements OnDestroy {
  private _destroyed$ = new Subject<void>();

  constructor(private store: Store<any>) {
    this.store.pipe(select(selectAlertPopup), takeUntil(this._destroyed$)).subscribe((ap: AlertPopup) => {
      if (ap && ap.errorMessages && ap.errorMessages.length > 0) {
        let errorString = '';
        if (ap.errorMessages.length === 1 && ap.errorMessages[0].trim().length > 0) {
          errorString = ap.errorMessages[0].trim();
        } else {
          ap.errorMessages.forEach((message) => {
            errorString = `${errorString} - ${message.trim()}.<br>`;
          });
        }
        if (ap.title && ap.title.trim().length > 0) {
          const error = alert(errorString, ap.title);
          error.then(() => {
            this.store.dispatch(new CloseError(true));
          });
        } else {
          const error = alert(errorString, 'Attention');
          error.then(() => {
            this.store.dispatch(new CloseError(true));
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
