import { Component, OnDestroy } from '@angular/core';
import { locale } from 'devextreme/localization';
import { ActivatedRoute } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Authenticated, SetUser, Authenticate } from './app-store/app-ui-state.actions';
import { AppState } from './app-store/reducers';
import { environment } from '../environments/environment';
import { RetrieveDataForTokenResult } from '../../../../Generated/CoreAPIClient';
import { takeUntil } from 'rxjs/operators';
import { isAuthenticated } from './app-store/app-ui.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy {
  private _destroyed$ = new Subject<void>();

  constructor(private route: ActivatedRoute,
    private store: Store<AppState>) {
    locale('en-au');

    if (!environment.production) {
      console.error('Debug Authenticated');
      this.store.dispatch(new Authenticated(true));
      // remove comments (3 lines below) in debug to set user -
      // this is required when userLastModified is required for saving
      const user = new RetrieveDataForTokenResult();
      user.username = 'Leith';
      user.doctorId = 9;
      user.userPkId = '3DBEE2BC-12E8-4DE9-9864-3254F7D0E4C9';
      user.baseHealthTrackApiUrl = 'http://localhost:60671';
      this.store.dispatch(new SetUser(user));
    }

/*
   this.store.pipe(takeUntil(this._destroyed$), select(isAuthenticated)).subscribe((auth: boolean) => {
    if (!auth) {
    this.route.queryParams.subscribe(params => {
      const token = params['sessionToken'];
      const requestedUrl = params['url'];

        if (token) { this.store.dispatch(new Authenticate({ token, requestedUrl })); }
    });
    }
  });
*/
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
