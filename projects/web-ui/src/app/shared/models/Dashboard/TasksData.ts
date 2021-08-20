export class TasksData {
  urgent: number;
  overdue: number;
  dueNow: number;

  constructor(data: number[]) {
    if (data && data.length === 3) {
      this.urgent = data[0];
      this.overdue = data[1];
      this.dueNow = data[2];
    }
  }
}
