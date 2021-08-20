import { EquipmentRosterDO } from '../../../../../../Generated/CoreAPIClient';

export class EquipmentRosteringPopup {
  showPopup: boolean;
  equipmentRoster: EquipmentRosterDO;

  constructor(show: boolean, equipmentRoster: EquipmentRosterDO) {
    this.showPopup = show;
    this.equipmentRoster = equipmentRoster;
  }
}
