export class LocationDiaryData {
    booked: number;
    arrived: number;
    closed: number;
    locationId: number;

    constructor(data: number[]) {
      if (data && data.length === 4) {
        this.booked = data[0];
        this.arrived = data[1];
        this.closed = data[2];
        this.locationId = data[3];
      }
    }
  }
