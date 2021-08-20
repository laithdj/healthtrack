import { ClinicalRecordAppState } from '../../store/clinical-record.reducers';
import { EchocardiogramMeasurement, SimpleMeasurement, MeasurementType,
  EchocardiogramClinicalRecordData } from '../echocardiogram-measurement.model';
import { EchocardiogramActions } from './echocardiogram.actions';

export interface EchocardiogramAppState extends ClinicalRecordAppState {
  'echocardiogramState': EchocardiogramState;
}

export interface EchocardiogramState {
  echocardiogramMeasurements: EchocardiogramMeasurement[];
  simpleMeasurements: SimpleMeasurement[];
  clinicalRecordData: EchocardiogramClinicalRecordData;
  lvDiastole: number;
  lvDiastoleIndex: number;
  lvDiastoleHeight: number;
  lvSystole: number;
  lvSystoleIndex: number;
  ivSeptum: number;
  inferolateralWall: number;
  rvDiastole: number;
  TAPSE: number;
  aorticRoot: number;
  ascAorta: number;
  leftAtrium: number;
  leftAtriumIndex: number;
  ejectionFraction: number;
  efCorrected: number;
  fractionalShortening: number;
  lvMass: number;
  RWT: number;
}

const initialState: EchocardiogramState = {
  echocardiogramMeasurements: [
    { measurementName: 'LV Diastole',
      measurementUnit: 'cm',
      measurementValue: 5.1,
      indexValue: 2,
      indexUnit: 'cm/m^2',
      heightValue: 4,
      heightUnit: 'cm/m^2',
      range: '4-5.5' },
    { measurementName: 'LV Systole',
      measurementUnit: 'cm',
      measurementValue: 3.2,
      indexValue: 2,
      indexUnit: 'cm/m^2',
      range: '2-3.8' },
    { measurementName: 'IV Septum',
      measurementUnit: 'cm',
      measurementValue: null,
      range: '0.7-1.1' },
    { measurementName: 'Inferolateral Wall',
      measurementUnit: 'cm',
      measurementValue: 3.2,
      range: '0.7-1.1' },
    { measurementName: 'RV Diastole',
      measurementUnit: 'cm',
      measurementValue: null,
      range: '<3' },
    { measurementName: 'TAPSE',
      measurementUnit: 'cm',
      measurementValue: 2.1,
      range: '>1.5' },
    { measurementName: 'Aortic Root',
      measurementUnit: 'cm',
      measurementValue: 3.2,
      range: '2.2-3.8' },
    { measurementName: 'Asc Aorta',
      measurementUnit: 'cm',
      measurementValue: null },
    { measurementName: 'Left Atrium',
      measurementUnit: 'cm',
      measurementValue: 3.8,
      indexValue: 3,
      range: '3-4' },
    { measurementName: 'Ejection Fraction',
      measurementUnit: '%',
      measurementValue: null,
      range: '>50' },
    { measurementName: 'EF Corrected',
      measurementUnit: '%',
      measurementValue: 3.2 },
    { measurementName: 'Fractional Shortening',
      measurementUnit: '%',
      measurementValue: null },
    { measurementName: 'LV Mass',
      measurementUnit: 'g',
      measurementValue: null }],
  simpleMeasurements: [
    { measurementType: MeasurementType.LVDiastole,
      measurementValue: null },
    { measurementType: MeasurementType.LVSystole,
      measurementValue: 3.7 } ],
  clinicalRecordData: { lVDiastole: 4.1, lVSystole: null },
  lvDiastole: 4.9,
  lvDiastoleIndex: null,
  lvDiastoleHeight: null,
  lvSystole: null,
  lvSystoleIndex: null,
  ivSeptum: 0.4,
  inferolateralWall: null,
  rvDiastole: null,
  TAPSE: null,
  aorticRoot: 5,
  ascAorta: null,
  leftAtrium: 4,
  leftAtriumIndex: null,
  ejectionFraction: null,
  efCorrected: 2,
  fractionalShortening: null,
  lvMass: 21,
  RWT: 4.1
};

export function echocardiogramReducers(state = initialState, action: EchocardiogramActions): EchocardiogramState {
  switch (action.type) {

    // case EchocardiogramActionTypes.LoadSmartTextSuccess: {
    //   return {
    //     ...state,
    //     smartText: action.payload.smartText
    //   };
    // }

    // case EchocardiogramActionTypes.LoadTemplateSuccess: {
    //   return {
    //     ...state,
    //     smartTextTemplate: action.payload.smartTextTemplate
    //   };
    // }

    // case EchocardiogramActionTypes.DeleteSmartTextSuccess: {
    //   const stlist = [...state.smartTextListItems];
    //   return {
    //     ...state,
    //     smartTextListItems: [...stlist]
    //   };
    // }

    // case EchocardiogramActionTypes.DeleteSmartTextTemplateSuccess: {
    //   const tlis = [...state.smartTextTemplateList];
    //   const idx = tlis.findIndex(wsi => wsi.templateId === action.payload);
    //   tlis.splice(idx, 1);

    //   return {
    //     ...state,
    //     smartTextTemplateList: [...tlis]
    //   };
    // }

    default:
      return state;
  }
}
