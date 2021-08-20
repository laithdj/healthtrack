export class DoctorDiaryData {
  booked: number;
  arrived: number;
  closed: number;

  constructor(data: number[]) {
    if (data && data.length === 3) {
      this.booked = data[0];
      this.arrived = data[1];
      this.closed = data[2];
    }
  }
}
