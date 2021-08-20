export class DistributionListData {
    totalDocuments: number;
  
    constructor(data: number[]) {
      if (data && data.length === 1) {
        this.totalDocuments = data[0];
      }
    }
  }