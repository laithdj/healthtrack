import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { isAuthenticated, selectRequestedUrl, selectLoading } from '../app-store/app-ui.selectors';
import { AppState } from '../app-store/reducers';
import { SetLog } from '../app-store/app-ui-state.actions';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit, OnDestroy {
  isAuthenticated$ = this.store.pipe(select(isAuthenticated));
  isLoading: boolean;
  requestedUrl: string;
  log = '';
  private _destroyed$ = new Subject<void>();

  constructor(private store: Store<AppState>,
    private router: Router) {
    this.store.dispatch(new SetLog(`${new Date()}: Start Landing Constructor`));
    this.store.pipe(takeUntil(this._destroyed$), select(selectRequestedUrl))
      .subscribe((url: string) => { this.requestedUrl = url; });
    this.store.pipe(takeUntil(this._destroyed$), select(selectLoading))
      .subscribe((loading: boolean) => { this.isLoading = loading; });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  ngOnInit() {
    this.isAuthenticated$.pipe(takeUntil(this._destroyed$)).subscribe((auth: boolean) => {
      // console.log('isAuthenticated ' + auth);
      if (auth) {
        // share params through app.service observable
        // const UrlArr = this.requestedUrl.split('/');
        // const patientID = UrlArr.indexOf('pc-patient') >= 0 ? UrlArr[UrlArr.indexOf('pc-patient') + 1] : null;
        // console.log(UrlArr.includes('patientconnect'));
        // if (patientID && (UrlArr.includes('patientconnect') ||
        // UrlArr.includes('referral') || UrlArr.includes('booking'))) {
        //   this.appService.shareReferralParams(of({
        //     patientID: patientID,
        //     patientConnectID: UrlArr.indexOf('patientconnect') >= 0 ?
        // parseInt(UrlArr[UrlArr.indexOf('patientconnect') + 1], 10) : null,
        //     referralID: UrlArr.indexOf('referral') >= 0 ?
        // parseInt(UrlArr[UrlArr.indexOf('referral') + 1], 10) : null,
        //     bookingID: UrlArr.indexOf('booking') >= 0 ? parseInt(UrlArr[UrlArr.indexOf('booking') + 1], 10) : null,
        //     bookingDate: UrlArr.indexOf('bookingDate') >= 0 ? UrlArr[UrlArr.indexOf('bookingDate') + 1] : null,
        //   }));
        //   this.router.navigate(['/' + `pc-patient/${UrlArr[UrlArr.indexOf('pc-patient') + 1]}`]);
        // } else {
        // console.log('router.navigate ' + this.requestedUrl);
        console.log('REQUESTED URL', this.requestedUrl);
        this.store.dispatch(new SetLog(`${`${new Date()}: `}Authenticated`));
        this.router.navigate([`/${this.requestedUrl}`]);
        // }
      } else if (!this.isLoading) {
        this.router.navigate(['access-denied']);
      }
    });
  }
}
