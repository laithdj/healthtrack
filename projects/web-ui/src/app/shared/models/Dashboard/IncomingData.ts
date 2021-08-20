export class IncomingData {
  pathology: number;
  radiology: number;

  constructor(data: number[]) {
    if (data && data.length === 2) {
      this.pathology = data[0];
      this.radiology = data[1];
    }
  }
}
