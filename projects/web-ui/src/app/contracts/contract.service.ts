import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ContractState } from './store/contracts.reducers';
import { UpdateContract, AddContract, DeleteContract } from './store/contracts.actions';
import { ContractsClient, APIResponseOfIEnumerableOfContractDO, ContractDO, ContractFeeDO,
   ContractsSearch, APIResponseOfContractDO } from '../../../../../Generated/CoreAPIClient';
import * as _ from 'lodash';


@Injectable()

export class ContractService {
  contractApiUri: string;
  public selectedContract = new Subject<ContractDO>();
  private workingContract: ContractDO;
  editModeState: Subject<boolean>;
  private _editMode: boolean;

  constructor(private contractsClient: ContractsClient,
    private store: Store<ContractState>) {
    this.selectedContract.subscribe((contract: ContractDO) => this.workingContract = contract);
    this._editMode = false;
    this.editModeState = new Subject();
  }

  toggleEditMode() {
    this.setEditMode(!this._editMode);
  }

  public get editMode(): boolean {
    return this._editMode;
  }

  setEditMode(state: boolean) {
    this._editMode = state;
    this.editModeState.next(state);
  }

  selectContract(contract: ContractDO) {
    this.selectedContract.next(contract);
  }

  public getContract(contractId: number): Observable<ContractDO> {
    if (!contractId) {
      return;
    }
    return this.contractsClient.getContract(contractId).pipe(map((response: APIResponseOfContractDO) => response.data ));
  }

  getCompanyContracts(companyId: number): Observable<ContractDO[]> {
    const contractsSearch = new ContractsSearch();
    contractsSearch.companyId = companyId;
    return this.contractsClient.getContracts(contractsSearch).pipe(map((response: APIResponseOfIEnumerableOfContractDO) => {
      return response.data;
    }));
  }

  public getValidContracts(): Observable<ContractDO[]> {
    const contractsSearch = new ContractsSearch();
    contractsSearch.validContractsOnly = true;
    return this.contractsClient.getContracts(contractsSearch).pipe(map((response: APIResponseOfIEnumerableOfContractDO) => {
      return response.data;
    }, err => console.log(err)));
}
  saveContract(contract: ContractDO) {
    const contractCopy = _.cloneDeep(contract);
    contractCopy.contractFees = _.cloneDeep(contract.contractFees.map((object) => new ContractFeeDO(object)));
    contract = contractCopy;
    contract.contractFees = contract.contractFees.map((object) => new ContractFeeDO(object));
    this.contractsClient.saveContract(contract).subscribe((response: APIResponseOfContractDO) => {
      if (contract.contractId) {
        this.store.dispatch(new UpdateContract(response.data));
      } else {
        this.store.dispatch(new AddContract(response.data));
      }
    });
  }

  updateFee(fee: ContractFeeDO, isNew: boolean) {
    if (isNew) {
      fee.contractId = this.workingContract.contractId;
      this.workingContract.contractFees.push(fee);
      this.selectedContract.next(this.workingContract);
    } else {
      const feeEntry = this.workingContract.contractFees.find(f => f.contractDetailsId === fee.contractDetailsId);
      this.updateFeeValues(feeEntry, fee);
    }
  }
  removeFee(fee: ContractFeeDO) {
    const feeEntryIndex = this.workingContract.contractFees.findIndex(f => f.contractDetailsId === fee.contractDetailsId);
    this.workingContract.contractFees.splice(feeEntryIndex, 1);
    this.selectedContract.next(this.workingContract);
  }

  deleteContract(contract: ContractDO) {
    return this.contractsClient.deleteContract(contract.contractId).subscribe(() => this.store.dispatch(new DeleteContract(contract)));
  }

  private updateFeeValues(feeEntry, updatedFee: ContractFeeDO) {
    feeEntry.AccomIncluded = updatedFee.accomIncluded;
    feeEntry.Category = updatedFee.category;
    feeEntry.CategoryDesc = updatedFee.categoryDesc;
    feeEntry.StayType = updatedFee.stayType;
    feeEntry.ItemNumber = updatedFee.itemNumber;
    feeEntry.FundCode = updatedFee.fundCode;
    feeEntry.FeeFull = updatedFee.feeFull;
    feeEntry.FeeOne = updatedFee.feeOne;
    feeEntry.FeeTwo = updatedFee.feeTwo;
    feeEntry.FeeThreePlus = updatedFee.feeThreePlus;
    feeEntry.AccomIncluded = updatedFee.accomIncluded;
    feeEntry.TheatreIncluded = updatedFee.theatreIncluded;
    feeEntry.BillingGroup = updatedFee.billingGroup;
    feeEntry.CaseFee = updatedFee.caseFee;
    feeEntry.ProcFee = updatedFee.procFee;
    }
}
