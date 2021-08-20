import { Injectable } from '@angular/core';
import {
  EquipmentTransactionDO,
  PAPManagementSearchDO,
} from '../../../../../Generated/CoreAPIClient';
import { PAPDropDownValue } from '../shared/models/Pap-System/PAPDropdownValue.model';

@Injectable({
  providedIn: 'root',
})
export class PapSystemService {
  dependencyOptions: PAPDropDownValue[] = [
    { displayValue: 'Low', value: 1 },
    { displayValue: 'Medium', value: 2 },
    { displayValue: 'High', value: 3 }];
  editAssignT = false;
  transactionSession: EquipmentTransactionDO = new EquipmentTransactionDO();
  changeAsset = false;
  actionStart = false;
  assignActionStart = false;
  trackingSearch: PAPManagementSearchDO;
  currentPast:string;
  assignSearch: PAPManagementSearchDO;
  transactionHistory = false;

  constructor() {}
}
