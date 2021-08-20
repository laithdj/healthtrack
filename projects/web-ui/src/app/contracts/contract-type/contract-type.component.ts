import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ContractState } from '../store/contracts.reducers';
import { CompaniesService } from './companies.service';
import { ContractService } from '../contract.service';
import { ContractDO, CompanyDO } from '../../../../../../Generated/CoreAPIClient';
import { ReplaceContracts } from '../store/contracts.actions';
import { DxSelectBoxComponent, DxRadioGroupComponent } from 'devextreme-angular';

@Component({
  selector: 'app-contract-type',
  templateUrl: './contract-type.component.html',
  styleUrls: ['./contract-type.component.css'],
  providers: []
})
export class ContractTypeComponent implements OnInit {
  @ViewChild('companyIdInput') companyIdSelection: DxSelectBoxComponent;
  @ViewChild('filterSelection') filterSelection: DxRadioGroupComponent;

  allowSelection = true;
  usingSingleFund = false;
  companies: CompanyDO[];
  blankContract = new ContractDO();
  privateCompany = new CompanyDO();
  filters: any[];

  constructor(private companyService: CompaniesService, private contractService: ContractService,
    private store: Store<ContractState>) {
      this.filters = [{ name: 'Valid Contracts Only', value: 0 }, { name: 'Single Fund / Company:', value: 1 }];
    }

  ngOnInit() {
    this.blankContract.contractFees = [];
    this.usingSingleFund = false;
    this.privateCompany.company_ID = 0;
    this.privateCompany.companyName = 'Private Contracts';

    // Load company list
    this.companyService.companies.subscribe((companies) => {
      this.companies = companies.sort((leftSide, rightSide): number => {
        if (leftSide.companyName < rightSide.companyName) { return -1; }
        if (leftSide.companyName > rightSide.companyName) { return 1; }
        return 0;
      });

      this.companies.unshift(this.privateCompany);
      this.companyIdSelection.dataSource = companies;
      this.companyIdSelection.selectedItem = this.privateCompany;
    });

    this.contractService.editModeState.subscribe((state: boolean) => this.allowSelection = !state);
  }

  onRefresh() {
    if (this.usingSingleFund) {
      this.onCompanyChange(this.companyIdSelection);
    } else {
      this.usingSingleFund = false;
      this.companyService.selectCompany(null);
      this.contractService.getValidContracts().subscribe((contracts: ContractDO[]) => this.store.dispatch(new ReplaceContracts(contracts)));
      this.contractService.selectContract(this.blankContract);
    }
  }

  onFocusIn(e: any) {
    e.element.querySelector('input.dx-texteditor-input').select();
  }

  switchFilter() {
    if (this.filterSelection.value === 0) {
      this.contractService.selectContract(this.blankContract);
      this.companyService.selectCompany(null);
      this.usingSingleFund = false;
      this.contractService.getValidContracts().subscribe((contracts: ContractDO[]) => this.store.dispatch(new ReplaceContracts(contracts)));
      this.contractService.selectContract(this.blankContract);
    } else {
        this.usingSingleFund = true;

        if (this.companyIdSelection.selectedItem != null) {
          this.companyService.selectCompany(this.companyIdSelection.selectedItem);
          this.contractService.getCompanyContracts(this.companyIdSelection.selectedItem.company_ID)
            .subscribe((contracts: ContractDO[]) => this.store.dispatch(new ReplaceContracts(contracts)));
      }

      this.contractService.selectContract(this.blankContract);
    }
  }

  onCompanyChange(event) {
    if (this.companyIdSelection.disabled) {
      this.onRefresh();
      return;
    }

    this.contractService.getCompanyContracts(event.selectedItem.company_ID)
      .subscribe((contracts: ContractDO[]) => this.store.dispatch(new ReplaceContracts(contracts)));
    this.companyService.selectCompany(this.companyIdSelection.selectedItem);
    this.contractService.selectContract(this.blankContract);
  }

  onSelectSingleFund(event) {
    this.usingSingleFund = true;

    if (this.companyIdSelection.selectedItem != null) {
      this.contractService.getCompanyContracts(this.companyIdSelection.selectedItem.company_ID)
        .subscribe((contracts: ContractDO[]) => this.store.dispatch(new ReplaceContracts(contracts)));
      this.companyService.selectCompany(this.companyIdSelection.selectedItem);
      this.contractService.selectContract(this.blankContract);
    }
  }
}
