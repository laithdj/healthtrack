import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import { ContractState } from './store/contracts.reducers';
import { ContractService } from './contract.service';
import { StompService } from '../shared/stomp/stomp.service';
import { AddContracts, ReplaceContracts } from './store/contracts.actions';
import { ContractDO } from '../../../../../Generated/CoreAPIClient';
import { KnownConfigurationScreen } from '../../../../../Generated/HMS.Interfaces';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css'],
})
export class ContractsComponent implements OnInit {
  contracts: ContractDO[];
  message: boolean;

  constructor(private contractService: ContractService,
    private stompService: StompService,
    private store: Store<ContractState>,
    private titleService: Title) {
    this.titleService.setTitle('Fee Contracts Manager');
  }

  ngOnInit(): void {
    this.contractService.getValidContracts().subscribe((contracts: ContractDO[]) => {
      this.store.dispatch(new AddContracts(contracts));
    });
  }

  onContractSelected(contract: ContractDO) {
    this.contractService.selectContract(contract);
  }

  changeCompany(companyId: number) {
    if (!companyId) {
      this.contractService.getValidContracts().subscribe((contracts: ContractDO[]) => {
        this.store.dispatch(new ReplaceContracts(contracts));
      });
    } else {
      this.contractService.getCompanyContracts(companyId).subscribe((contracts: ContractDO[]) => {
        this.store.dispatch(new ReplaceContracts(contracts));
      });
    }
  }
  toggleAuditTip() {
    this.message = !this.message;
  }
  onOpenFees() {
    this.stompService.openHealthTrackWindow(KnownConfigurationScreen.ItemFeesEditor);
  }
}
