
export enum Fields {
    AllergiesToMedication = 0,
    DyeAllergy = 0,
    AllergyLatex = 0,
    DiabetesAllergy = 0,
    CardiacSurgeryDetails = 0,
    AdversEventDetails = 0,
    LeftVentricleSize = 0,
    AorticValveMorphology = 0,
    AortaSize = 0,
    LeftAtriumSize,
    AtrialSeptalDefect = 0,
    NonCardiacFindings = 0,
    CoronaryAnomaly = 0,
    PericardialEffusion = 0,
    AbdominalPathology = 0
}

export class FieldsList {
    hiddenField: number[] = [Fields.AllergiesToMedication, Fields.DyeAllergy, Fields.AllergyLatex,
        Fields.DiabetesAllergy, Fields.CardiacSurgeryDetails, Fields.AdversEventDetails,
        Fields.LeftVentricleSize , Fields.AorticValveMorphology , Fields.AortaSize, Fields.LeftAtriumSize,
        Fields.AtrialSeptalDefect , Fields.NonCardiacFindings, Fields.CoronaryAnomaly , Fields.PericardialEffusion,
        Fields.AbdominalPathology
    ];
}
