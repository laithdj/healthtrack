export class PAPTypeFilterDO {
  equipmentType: string;
  pumpType: string;
  displayExpression: string;

  public constructor(init?: Partial<PAPTypeFilterDO>) {
    Object.assign(this, init);
  }
}
