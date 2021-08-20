import { STSmartTextPackage } from './smart-text-package.model';
import { STSmartTextStyleProperty } from './smart-text-style-property.model';
import { STSmartTextTemplate } from './smart-text-template.model';

export class STSmartTextBundle {
  smartTextPackage?: STSmartTextPackage | undefined;
  templates?: STSmartTextTemplate[] | undefined;
  styleProperties?: STSmartTextStyleProperty[] | undefined;

  constructor() { }
}
