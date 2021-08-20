import { PAPEquipmentStatus, AssetLastLoanedPatient } from '../../../../../Generated/CoreAPIClient';

export class EquipmentStatus {
  displayStatus: string;
  value: PAPEquipmentStatus;
}

export class EquipmentStatusDictionary {
  statusValues: EquipmentStatus[] = [ { displayStatus: 'In Stock', value: PAPEquipmentStatus.InStock },
    { displayStatus: 'Issued', value: PAPEquipmentStatus.Issued },
    { displayStatus: 'Retired', value: PAPEquipmentStatus.Retired },
    { displayStatus: 'In Maintenance', value: PAPEquipmentStatus.InMaintenance },
    { displayStatus: 'Current', value: PAPEquipmentStatus.CurrentAssets }, ];


  GetDisplayStatus(value: number): string {
    if (this.statusValues.find(x => x.value === value)) {
      return this.statusValues.find(x => x.value === value).displayStatus
    } else {
      return '';
    }
  }

  GetCurrentPatient(patient: AssetLastLoanedPatient){
    let response: string = '';
    if (patient === null) return response;
    response += patient.fullName;
    if (patient.patient_MRN != null && patient.patient_MRN != '') response += ' (' + patient.patient_MRN + ')';
    else if (patient.patient_ID != null && patient.patient_ID != 0) response += ' (' + patient.patient_ID + ')';

    return response;
  }

  GetPAPEquipmentStatus(value: string): PAPEquipmentStatus {
    const index = this.statusValues.findIndex(s => s.displayStatus === value);
    // if (index >= 0) return this.statusValues[index].value;
    // else return null;

    return (index >= 0) ? this.statusValues[index].value : null ;
  }

  GetDictionaryForDisplay(value: PAPEquipmentStatus): EquipmentStatus {
    return this.statusValues.find(s => s.value === value);
  }
}
