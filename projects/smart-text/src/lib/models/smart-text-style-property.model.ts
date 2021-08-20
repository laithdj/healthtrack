import { STHeaderStyle } from './enums/header-style.enum';

export class STSmartTextStyleProperty {
  headerStyle?: STHeaderStyle;
  fontSize?: number;
  fontBoldItalicsUnderline?: string | undefined;
  indent?: number;
  textAlignment?: string | undefined;

  constructor() { }
}
