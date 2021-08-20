import { RosterTemplateDO } from '../../../../../../Generated/CoreAPIClient';

export class RosterPopup {
  showPopup: boolean;
  rosterTemplate?: RosterTemplateDO;

  constructor(show: boolean, template?: RosterTemplateDO) {
    this.showPopup = show;
    this.rosterTemplate = template;
  }
}
