import { Action } from '@ngrx/store';
import { ContractDO, CompanyDO } from '../../../../../../Generated/CoreAPIClient';

export const ADD_CONTRACT = 'ADD_CONTRACT';
export const DELETE_CONTRACT = 'DELETE_CONTRACT';
export const ADD_CONTRACTS = 'ADD_CONTRACTS';
export const UPDATE_CONTRACT = 'UPDATE_CONTRACT';
export const UPDATE_CONTRACT_SUCCESS = 'UPDATE_CONTRACT_SUCCESS';
export const UPDATE_PROC1 = 'UPDATE_PROC1';
export const UPDATE_COMPANY = 'UPDATE_COMPANY';
export const UPDATE_CONTRACT_NAME = 'UPDATE_CONTRACT_NAME';
export const UPDATE_VALIDITY_START = 'UPDATE_VALIDITY_START';
export const UPDATE_VALIDITY_END = 'UPDATE_VALIDITY_END';
export const UPDATE_CONTRACT_EFFECTIVE_DATE = 'UPDATE_CONTRACT_EFFECTIVE_DATE';
export const UPDATE_PROC2 = 'UPDATE_PROC2';
export const UPDATE_PROC3 = 'UPDATE_PROC3';
export const UPDATE_PROC4 = 'UPDATE_PROC4';
export const SAVE_CONTRACT = 'SAVE_CONTRACT';
export const UPDATE_RGV_VERSION = 'UPDATE_RGV_VERSION';
export const UPDATE_MEDICAL_SERVICE = 'UPDATE_MEDICAL_SERVICE';
export const REPLACE_CONTRACTS = 'REPLACE_CONTRACTS';

export class AddContract implements Action {
  readonly type = ADD_CONTRACT;
  payload: ContractDO;
  constructor(public contract: ContractDO) {
    this.payload = contract;
  }
}

export class UpdateContract implements Action {
  payload: ContractDO;
  readonly type = UPDATE_CONTRACT;
  constructor(public contract: ContractDO) {
    this.payload = contract;
  }
}
export class UpdateContractSuccess implements Action {
  payload: ContractDO;
  readonly type = UPDATE_CONTRACT_SUCCESS;
  constructor(public contract: ContractDO) {
    this.payload = contract;
  }
}
export class UpdateProc1 implements Action {
  readonly type = UPDATE_PROC1;
  constructor(public payload: number) {}
}
export class updateCompany implements Action {
  readonly type = UPDATE_COMPANY;
  constructor(public payload: number) {}
}
export class updateContractName implements Action {
  readonly type = UPDATE_CONTRACT_NAME;
  constructor(public payload: string) {}
}
export class updateValidityStart implements Action {
  readonly type = UPDATE_VALIDITY_START;
  constructor(public payload: Date) {}
}
export class updateValidityEnd implements Action {
  readonly type = UPDATE_VALIDITY_END;
  constructor(public payload: Date) {}
}
export class updateContractEffectiveFrom implements Action {
  readonly type = UPDATE_CONTRACT_EFFECTIVE_DATE;
  constructor(public payload: string) {}
}
export class updateProc2 implements Action {
  readonly type = UPDATE_PROC2;
  constructor(public payload: number) {}
}
export class updatedRGVersion implements Action {
  readonly type = UPDATE_RGV_VERSION;
  constructor(public payload: number) {}
}
export class updatedMedicalService implements Action {
  readonly type = UPDATE_MEDICAL_SERVICE;
  constructor(public payload: number) {}
}

export class updateProc4 implements Action {
  readonly type = UPDATE_PROC4;
  constructor(public payload: number) {}
}
export class updateProc3 implements Action {
  readonly type = UPDATE_PROC3;
  constructor(public payload: number) {}
}

export class SaveContract implements Action {
  readonly type = SAVE_CONTRACT;
  constructor(public payload : ContractDO ) {}
}

export class AddContracts implements Action {
  readonly type = ADD_CONTRACTS;
  payload: ContractDO[];
  constructor(public contracts: ContractDO[]) {
    this.payload = contracts;
  }
}

export class ReplaceContracts implements Action {
  readonly type = REPLACE_CONTRACTS;
  payload: ContractDO[];
  constructor(public contracts: ContractDO[]) {
    this.payload = contracts;
  }
}

export class DeleteContract implements Action {
  readonly type = DELETE_CONTRACT;
  payload: ContractDO;
  constructor(public contract: ContractDO) {
    this.payload = contract;
  }
}

export type ContractsActions = AddContract | AddContracts |  DeleteContract | ReplaceContracts | UpdateContract | UpdateProc1 | UpdateContractSuccess
| SaveContract | updateCompany | updateContractName | updateValidityStart | updateValidityEnd | updateContractEffectiveFrom | updateProc2 |
updateProc3| updateProc4 | updatedRGVersion | updatedMedicalService;
