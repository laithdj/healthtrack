
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import {
  ContractsClient, APIResponseOfContractDO, ContractFeeDO
} from '../../../../../../Generated/CoreAPIClient';
import { UpdateContract, SaveContract, SAVE_CONTRACT } from './contracts.actions';
import { SetError } from '../../app-store/app-ui-state.actions';
import { ContractsAppState } from './contracts.reducers';
import { selectContractsState } from './contracts.selectors';
import * as _ from 'lodash';


@Injectable()
export class ContractsEffects {
  constructor(private actions$: Actions,
    private contractsClient: ContractsClient, private store: Store<ContractsAppState>) { }

  @Effect()
  SaveContracts$ = this.actions$.pipe(ofType<SaveContract>(SAVE_CONTRACT),
    withLatestFrom(this.store.pipe(select(selectContractsState))),
    switchMap(([action, state]) => {
      const contract = _.cloneDeep(action.payload);
      contract.proc1 = state.proc1;
      contract.companyId = state.companyId;
      contract.contractName = state.contractName;
      contract.validityStart = state.validityStart; /// date needs to be formatted
      contract.validityEnd = state.validityEnd; /// date needs to be formatted
      contract.contractEffectiveFrom = state.contractEffectiveDate; // saves string value instead of number value
      contract.contractFees = contract.contractFees.map((object) => new ContractFeeDO(object));
      contract.proc2 = state.proc2;
      contract.proc3 = state.proc3;
      contract.proc4plus = state.proc4;
      contract.drgVersion = state.rgvVersion;
      contract.includeMedicalServicesTB = state.medicalService;

      return this.contractsClient.saveContract(contract).pipe(map((response: APIResponseOfContractDO) => {
        if (response.errorMessage && response.errorMessage.trim().length > 0) {
          return new SetError({ errorMessages: [response.errorMessage] });
        } else {
          return new UpdateContract(response.data);
        }
      }));
    }
    ));
}
