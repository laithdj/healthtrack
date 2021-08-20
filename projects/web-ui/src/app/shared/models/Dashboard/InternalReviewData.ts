export class InternalReviewData {
  distribution: number;
  peerReview: number;

  constructor(data: number[]) {
    if (data && data.length === 2) {
      this.distribution = data[0];
      this.peerReview = data[1];
    }
  }
}
