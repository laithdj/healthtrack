import { Component, OnInit, Renderer2, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { ContractState } from '../store/contracts.reducers';
import { ContractService } from '../contract.service';
import { CompaniesService } from '../contract-type/companies.service';
import { ListsService, FeeCategory, StayType, EffectiveFromOption } from '../shared/ListsService';
import { FeeConstants } from '../shared/FeeConstants';
import { UpdateContract, UpdateProc1, SaveContract, updateCompany, updateContractName, updateValidityStart, updateValidityEnd, updateContractEffectiveFrom, updateProc2, updateProc3, updateProc4, updatedRGVersion, updatedMedicalService } from '../store/contracts.actions';
import { ContractDO, CompanyDO, GroupDO, FeeItemNumber } from '../../../../../../Generated/CoreAPIClient';
import * as _ from 'lodash';

@Component({
  selector: 'app-contract-detail',
  templateUrl: './contract-detail.component.html',
  styleUrls: ['./contract-detail.component.css'],
  providers: []
})
export class ContractDetailComponent implements OnInit {
  isNewContract: boolean;
  contract: ContractDO;
  companies: CompanyDO[];
  feeCategories: FeeCategory[];
  stayTypes: StayType[];
  billingGroups: GroupDO[];
  effectiveFromOptions: EffectiveFromOption[];
  procItemNums: FeeItemNumber[];
  accommItemNums: FeeItemNumber[];
  theatreItemNums: FeeItemNumber[];
  editingMode: boolean;

  @Output() openFees = new EventEmitter<any>();

  constructor(private activatedRoute: ActivatedRoute,
    private renderer: Renderer2,
    private contractService: ContractService,
    private store: Store<ContractState>,
    private companyService: CompaniesService,
    private listsService: ListsService) {
    this.feeCategories = FeeConstants.feeCategories;
    this.stayTypes = FeeConstants.stayTypes;
    this.effectiveFromOptions = FeeConstants.effectiveFromOptions;
    listsService.getItemNumbers('P').subscribe((itemNums: FeeItemNumber[]) => {
      this.procItemNums = itemNums;
    });
    listsService.getItemNumbers('A').subscribe((itemNums: FeeItemNumber[]) => {
      this.accommItemNums = itemNums;
    });
    listsService.getItemNumbers('T').subscribe((itemNums: FeeItemNumber[]) => {
      this.theatreItemNums = itemNums;
    });
    listsService.getBillGroups().subscribe((billGroups: GroupDO[]) => {
      this.billingGroups = billGroups;
    });
  }

  ngOnInit() {
    this.contract = new ContractDO();
    this.contractService.selectedContract.subscribe((contract: ContractDO) => {
      this.contract = contract ? _.cloneDeep(contract) : new ContractDO();
      console.log('contract set from selectedContract');
    });

    this.companyService.companies.subscribe((companies: CompanyDO[]) => {
      this.companies = companies.sort((leftSide, rightSide): number => {
        if (leftSide.companyName < rightSide.companyName) { return -1; }
        if (leftSide.companyName > rightSide.companyName) { return 1; }
        return 0;
      });
    });

    this.contractService.editModeState.subscribe((editMode: boolean) => this.editingMode = editMode);
  }

  onNewContract() {
    this.isNewContract = true;
    this.contractService.setEditMode(true);
    this.contract = new ContractDO();
    this.contract.contractFees = [];
    this.contract.validityStart = new Date();
    this.contract.validityEnd = new Date();
    if (this.companyService.currentCompany && this.companyService.currentCompany.company_ID !== 0) {
      this.contract.company = this.companyService.currentCompany;
      this.contract.companyId = this.companyService.currentCompany.company_ID;
    }
    this.contractService.selectContract(this.contract);
  }

  onNewProcedure(event) {
    if (!this.contract.contractFees) { this.contract.contractFees = []; }
    event.data.categoryDesc = 'ProcCase';
    event.data.category = 'P';
    event.data.accomIncluded = false;
    event.data.theatreIncluded = false;
  }

  onSavingProcedure(event) {
    if (this.contract.contractFees.length === 0) {
      this.contract.contractFees.push(event.data);
    }
  }

  onNewAccom(event) {
    event.data.categoryDesc = 'Accom';
    event.data.category = 'A';
  }

  onNewTheatre(event) {
    event.data.categoryDesc = 'Theatre';
    event.data.category = 'T';
  }
  onCancelClicked() {
    if (this.contract.contractId) {
      this.contractService.getContract(this.contract.contractId).subscribe((contract: ContractDO) => {
        this.contract = contract;
        //  this.store.dispatch(new UpdateContract(contract));
      });
    }
    this.contractService.toggleEditMode();
    if (!this.contractService.editMode && this.contract.contractId) {
      const contractId = this.contract.contractId;
    }
  }

  onFocusIn(e: any) {
    e.element.querySelector('input.dx-texteditor-input').select();
  }

  onSaveContract() {
    this.store.dispatch(new SaveContract(this.contract));
    //   this.contractService.saveContract(this.contract);
    this.contractService.setEditMode(false);
    this.isNewContract = false;
  }

  onDeleteContract() {
    this.contractService.deleteContract(this.contract);
    const blankContract = new ContractDO();
    blankContract.contractFees = [];
    this.contractService.selectContract(blankContract);
    this.contractService.setEditMode(false);
  }
  onOpenFees() {
    this.openFees.emit();
  }
  updateProc1(e: any) {
    this.store.dispatch(new UpdateProc1(e.value));
  }
  updateCompany(e: any) {
    this.store.dispatch(new updateCompany(e.value));
  }
  updateContractName(e: any) {
    this.store.dispatch(new updateContractName(e.value));
  }
  updateValidityStart(e: any) {
    if (e.value) {
      e.value.setHours(14, 0, 0, 0);
      this.store.dispatch(new updateValidityStart(e.value));
    }
  }
  updateValidityEnd(e: any) {
    if (e.value) {
      e.value.setHours(14, 0, 0, 0);
      this.store.dispatch(new updateValidityEnd(e.value));
    }
  }
  updateContractEffectiveFrom(e: any) {
    console.log(e);
    this.store.dispatch(new updateContractEffectiveFrom(e.value));
  }
  updateProc2(e: any) {
    this.store.dispatch(new updateProc2(e.value));
  }
  updateProc3(e: any) {
    this.store.dispatch(new updateProc3(e.value));
  }
  updateProc4(e: any) {
    this.store.dispatch(new updateProc4(e.value));
  }
  updatedRGVersion(e: any) {
    this.store.dispatch(new updatedRGVersion(e.value));
  }
  updatedMedicalService(e: any) {
    this.store.dispatch(new updatedMedicalService(e.value));
  }
}
