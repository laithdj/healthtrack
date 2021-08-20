export class IncomingRSDData {
  RSD: number;

  constructor(data: number[]) {
    if (data && data.length === 1) {
      this.RSD = data[0];
    }
  }
}
