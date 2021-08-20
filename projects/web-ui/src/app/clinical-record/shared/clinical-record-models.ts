export class ConfigScreen {
  showConfigScreen: boolean;
  configScreenType: ConfigScreenType;
}

export enum ConfigScreenType {
  SmartTextTemplateEditor = 1,
  SmartTextEditor = 2
}

export class ClinicalRecordDefinition {
  formDisplay: string;
  recordSubCategory: number;
}
