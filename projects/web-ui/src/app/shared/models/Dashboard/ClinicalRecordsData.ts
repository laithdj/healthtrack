export class ClinicalRecordsData {
  urgent: number;
  normal: number;

  constructor(data: number[]) {
    if (data && data.length === 2) {
      this.urgent = data[0];
      this.normal = data[1];
    }
  }
}
