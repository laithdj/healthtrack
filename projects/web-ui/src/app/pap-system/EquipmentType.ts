import { EquipmentPurpose } from "../../../../../Generated/CoreAPIClient";

export class EquipmentPurposeClass {
  displayType: string;
  value: EquipmentPurpose;
}

export class EquipmentPurposeDictionary {
  purposeValues: EquipmentPurposeClass[] = [ { displayType: 'Loanable', value: EquipmentPurpose.Loanable },
  { displayType: 'Fixed', value: EquipmentPurpose.Fixed },
  { displayType: 'Mobile', value: EquipmentPurpose.Mobile } ];

}
