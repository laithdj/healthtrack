import * as ContractActions from './contracts.actions';
import { ContractDO, CompanyDO } from '../../../../../../Generated/CoreAPIClient';
import { AppState } from '../../app-store/reducers';
export interface ContractsAppState extends AppState {
  // eslint-disable-next-line no-use-before-define
  'contractState': ContractState;
}
export interface ContractState {
  contracts: ContractDO[];
  editedContract: ContractDO;
  editedId: number;
  proc1: number;
  proc2: number;
  proc3: number;
  proc4: number;
  rgvVersion: string;
  companyId: number;
  contractName: string;
  validityStart: Date;
  validityEnd: Date;
  contractEffectiveDate: string;
  medicalService: boolean;
}

const initialState: ContractState = {
  contracts: [],
  editedContract: null,
  editedId: 0,
  proc1: 0,
  proc2: 0,
  proc3: 0,
  proc4: 0,
  companyId: 0,
  contractName: '',
  validityStart: new Date(),
  validityEnd: new Date(),
  contractEffectiveDate: '',
  rgvVersion: '',
  medicalService: false
};

export function contractsReducers(state = initialState, action: ContractActions.ContractsActions) {
  switch (action.type) {
    case ContractActions.ADD_CONTRACT:
      return {
        ...state,
        contracts: [...state.contracts, action.payload],
      };

    case ContractActions.ADD_CONTRACTS:
      return {
        ...state,
        contracts: [...state.contracts, ...action.payload],
      };

    case ContractActions.REPLACE_CONTRACTS:
      return {
        ...state,
        contracts: [...action.payload],
      };
    case ContractActions.UPDATE_PROC1:
      return {
        ...state,
        proc1: action.payload,
      };
    case ContractActions.UPDATE_PROC2:
      return {
        ...state,
        proc2: action.payload,
      };
    case ContractActions.UPDATE_PROC3:
      return {
        ...state,
        proc3: action.payload,
      };
    case ContractActions.UPDATE_PROC4:
      return {
        ...state,
        proc4: action.payload,
      };
      case ContractActions.UPDATE_MEDICAL_SERVICE:
        return {
          ...state,
          medicalService: action.payload,
        };
    case ContractActions.UPDATE_RGV_VERSION:
      return {
        ...state,
        rgvVersion: action.payload,
      };
    case ContractActions.UPDATE_COMPANY:
      return {
        ...state,
        companyId: action.payload,
      };
    case ContractActions.UPDATE_CONTRACT_NAME:
      return {
        ...state,
        contractName: action.payload,
      };
    case ContractActions.UPDATE_VALIDITY_START:
      return {
        ...state,
        validityStart: action.payload,
      };
    case ContractActions.UPDATE_VALIDITY_END:
      return {
        ...state,
        validityEnd: action.payload,
      };
    case ContractActions.UPDATE_CONTRACT_EFFECTIVE_DATE:
      return {
        ...state,
        contractEffectiveDate: action.payload,
      };

    case ContractActions.UPDATE_CONTRACT: {
      const indexToUpdate = state.contracts.findIndex((c) => c.contractId === action.payload.contractId);
      const contractsToUpdate = [...state.contracts];
      contractsToUpdate.splice(indexToUpdate, 1, action.payload);

      return {
        ...state,
        contracts: contractsToUpdate,
        editedContract: null,
        editedId: null,
      };
    }

    case ContractActions.DELETE_CONTRACT: {
      const index = state.contracts.findIndex((c) => c.contractId === action.payload.contractId);
      const oldContracts = [...state.contracts];
      oldContracts.splice(index, 1);

      return {
        ...state,
        contracts: oldContracts,
        editedContract: null,
        editedId: null,
      };
    }

    default:
      return state;
  }
}
