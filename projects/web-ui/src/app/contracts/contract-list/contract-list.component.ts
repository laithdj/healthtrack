import { Component, OnInit,  ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ContractState } from '../store/contracts.reducers';
import { Observable } from 'rxjs';
import { DxDataGridComponent } from 'devextreme-angular';
import { ContractService } from '../contract.service';
import { ContractDO } from '../../../../../../Generated/CoreAPIClient';

@Component({
  selector: 'app-contract-list',
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css']
})
export class ContractListComponent implements OnInit {
contractsState: Observable<ContractDO[]>;
@ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
allowSelection = true;

  constructor(private contractService: ContractService,
    private store: Store<ContractState> ) {
      this.contractsState = this.store.select('contracts');
    }

  ngOnInit() {
    this.contractService.selectedContract.subscribe((contract: ContractDO) => {
     if (!contract || contract.contractId === 0) {
        this.dataGrid.instance.clearSelection();
     }
    });
    this.contractService.editModeState.subscribe((state: boolean) => this.allowSelection = !state);
  }


  getSelectedRowsData () {
    return this.dataGrid.instance.getSelectedRowsData();
  }

  onSelectionChanged (e) {
      const selectedContracts = e.selectedRowsData;
      if (selectedContracts && selectedContracts.length === 1) {
        this.contractService.selectContract(selectedContracts[0]);
      }
    }
}
