import {FeeTableBillItems} from '../../../../../../../Generated/CoreAPIClient';
import { HealthFundActionTypes, HealthFundActions } from './healthfund.actions';
import { AppState } from '../../../../app/app-store/reducers';

export interface HealthFundAppState extends AppState {
  'healthFundState': HealthFundState;
}

export interface HealthFundState {
    billItems: FeeTableBillItems;
}

const initialState: HealthFundState = {
    billItems: new FeeTableBillItems()
};

export function healthFundReducers(state = initialState, action: HealthFundActions): HealthFundState {
  switch (action.type) {

    case HealthFundActionTypes.FetchServicesSuccess: {
      return {
        ...state,
        billItems: action.payload
      };
    }
    default:
        return state;
  }

}
