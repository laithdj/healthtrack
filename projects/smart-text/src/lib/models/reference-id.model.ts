export class STReferenceID {
  referenceId!: number;
  description?: string | null;
  units?: string | null;
  minValue!: number;
  maxValue!: number;
  range?: string | null;

  constructor() { }
}
