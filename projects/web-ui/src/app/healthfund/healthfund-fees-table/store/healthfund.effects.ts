import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map } from 'rxjs/operators';
import { BillWorksheetClient, APIResponseOfFeeTableBillItems } from '../../../../../../../Generated/CoreAPIClient';
import { SetError } from '../../../app-store/app-ui-state.actions';
import { FetchServices, HealthFundActionTypes, FetchServicesSuccess } from './healthfund.actions';

@Injectable()
export class HealthFundEffects {
  constructor(private actions$: Actions,
    private billingClient: BillWorksheetClient) { }

    @Effect()
    ServicesFetch$ = this.actions$.pipe(ofType<FetchServices>(HealthFundActionTypes.FetchServices),
    switchMap(action =>
        this.billingClient.getServicesList(null).pipe(map((response: APIResponseOfFeeTableBillItems) => {
          if (response.errorMessage && response.errorMessage.trim().length > 0) {
            return new SetError({ errorMessages: [response.errorMessage] });
          } else {
            return new FetchServicesSuccess(response.data);
          }
        }))
      ));
}
