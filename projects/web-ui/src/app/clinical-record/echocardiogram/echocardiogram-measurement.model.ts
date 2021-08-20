export class EchocardiogramMeasurement {
  measurementName: string;
  measurementValue: number;
  measurementUnit: string;
  range?: string;
  indexValue?: number;
  indexUnit?: string;
  heightValue?: number;
  heightUnit?: string;
}

export class SimpleMeasurement {
  measurementType: MeasurementType;
  measurementValue: number;
}

export enum MeasurementType {
  LVDiastole = 1,
  LVSystole = 2
}

export enum MMode2DMeasurementType {
  LVDiastole = 1,
  LVSystole = 2
}

export class EchocardiogramClinicalRecordData {
  lVDiastole: number;
  lVSystole: number;
}

export enum MeasurementUnit {
  mm = 'mm',
  cm = 'cm',
  cmm2 = 'cm/m<sup>2</sup>',
  percentage = '%',
  g = 'g',
  kg = 'kg'
}

// export enum ClinicalRecordSection {
//   ClinicalDetail = 1,
//   MMode2D = 2,
//   Doppler = 3,
//   LVRVFunctionWallMotion = 4,
//   Valve = 5,
//   PericardiumShuntsMasses = 6,
//   Congenital = 7
// }

// export enum MMode2DSection {

// }
