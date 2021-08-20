import { STHeaderStyle } from './enums/header-style.enum';
import { STSegmentType } from './enums/segment-type.enum';
import { STSmartTextType } from './enums/smart-text-type.enum';

export class STSmartTextNode {
  navID?: number;
  parentID?: number;
  nodeText?: string | undefined;
  nodeSegment?: STSegmentType;
  nodeType?: STSmartTextType;
  displayOrder?: number;
  fastTag?: string | undefined;
  codedData?: string | undefined;
  shortDescription?: string | undefined;
  styleID?: STHeaderStyle;
  noNewLinesForHeaders?: boolean;
  restrictedToUsername?: string | undefined;
  trackingDisabled?: boolean;
  disablePunctuation?: boolean;
  synopsisOverride?: string | undefined;
  hasRTF?: boolean;

  constructor() { }
}
