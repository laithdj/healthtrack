import { STSmartTextNode } from './smart-text-node.model';

export class STSmartTextPackage {
  formDisplay?: string | undefined;
  recordSubCategory?: number;
  buttonNumber?: number;
  dateExported?: Date | undefined;
  fullTreeIncluded?: boolean;
  smartTextNodes?: STSmartTextNode[] | undefined;

  constructor() { }
}
