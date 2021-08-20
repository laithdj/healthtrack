import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import notify from 'devextreme/ui/notify';
import {
  SingleSignOnClient,
  RetrieveDataForToken,
  APIResponseOfRetrieveDataForTokenResult,
} from '../../../../../Generated/CoreAPIClient';
import {
  Authenticate, Authenticated, AppUiActionTypes, SetUser,
} from '../app-store/app-ui-state.actions';
import { StompService } from '../shared/stomp/stomp.service';
import { NotificationService } from '../shared/notification-service';
import { JobNotificationMessage, Status } from '../../../../../Generated/HMS.Interfaces';
import { selectToken } from '../app-store/app-ui.selectors';
import { AppState } from '../app-store/reducers';

@Injectable()
export class AuthEffects {
  constructor(private actions$: Actions,
    private store: Store<AppState>,
    private router: Router,
    private signOnService: SingleSignOnClient,
    private stomp: StompService,
    private notifications: NotificationService) { }

  @Effect()
  authenticate$ = this.actions$.pipe(
    ofType<Authenticate>(AppUiActionTypes.Authenticate),
    switchMap((action) => {
      const request = new RetrieveDataForToken();
      request.token = action.payload.token;
      // console.log('getDataForToken ' + request.token);
      return this.signOnService.getDataForToken(request);
    }),
    map((response) => {
      // console.log(response);
      if (response.errorMessage && response.errorMessage.length > 0) {
        // console.error('Error getting session token: ' + response.data.errorMessage);
        this.router.navigate(['access-denied']);
        return new Authenticated(false);
      }

      if (response.data) {
        // response.data.stompDetails.url = 'ws://tawney:15674/ws';
        // for pointing to tawney to connect to comms service
        this.store.dispatch(new SetUser(response.data));
        this.setupComms(response);
        return new Authenticated(true);
      }

      return new Authenticated(false);
    }),
  );

  setupComms(response: APIResponseOfRetrieveDataForTokenResult) {
    let token = '';
    this.store.pipe(take(1), select(selectToken)).subscribe((storeToken: string) => {
      token = storeToken;
    });

    this.stomp.setupWebSubscriptions(token, response.data);
    this.stomp.clientId = response.data.sessionQueueName;

    this.notifications.jobNotificationMessage.subscribe((message: JobNotificationMessage) => {
      let messageDisplay = 'success';
      let displayTime = 10000;

      if (message.jobStatus === Status.Failed) {
        messageDisplay = 'error';
        displayTime = 20000;
      }

      notify(message.message, messageDisplay, displayTime);
    });
  }
}
