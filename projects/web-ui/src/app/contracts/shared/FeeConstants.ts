export class FeeConstants {
  public static feeCategories: FeeCategory[] = [
    {'ID': 'P',
      'Name': 'ProcCase',
      'Description': 'Procedure / Case'
    }, {
      'ID': 'A',
      'Name': 'Accomm',
      'Description': 'Accommodation'
    }, {
        'ID': 'T',
        'Name': 'Theatre',
        'Description': 'Theatre'
    }];

  public static effectiveFromOptions: EffectiveFromOption[] =
    [{ 'Name': 'Admission Date', 'ID': 'A'},
    { 'Name': 'Discharge Date', 'ID': 'D'},
    { 'Name': 'Procedure Date', 'ID': 'P'}];

  public static stayTypes: StayType[] =
    [
      { 'Name': 'Same Day', 'ID': 'SD'},
      { 'Name': 'Over Night', 'ID': 'ON'},
      { 'Name': 'Multi Day', 'ID': 'MD'}
    ];
  }
export class FeeCategory {
  ID: string;
  Name: string;
  Description: string;
}

export class StayType {
  ID: string;
  Name: string;
}

export class EffectiveFromOption {
  ID: string;
  Name: string;
}
