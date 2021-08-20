import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppUiState } from '../app-store/app-ui-state.reducer';
import { isAuthenticated } from '../app-store/app-ui.selectors';
import { Observable } from 'rxjs';
import { AppState } from '../app-store/reducers';
import { take, filter } from 'rxjs/operators';

/*** Prevent unauthorized activating and loading of routes ***/
@Injectable()
export class AuthenticatedGuard implements CanActivate {

  constructor(private store: Store<AppState>, public router: Router) {}

  // true when user is authenticated
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

    // redirect to access-denied page if user is not authenticated
    const isAuthenticated$ = this.store.pipe(select(isAuthenticated));

    isAuthenticated$.pipe(filter((auth: boolean) => auth === false), take(1))
      .subscribe(_ => this.router.navigate(['access-denied']));

    return isAuthenticated$;
  }
}
