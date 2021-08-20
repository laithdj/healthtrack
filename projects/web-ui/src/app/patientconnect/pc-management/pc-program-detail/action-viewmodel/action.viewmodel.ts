import * as _ from 'lodash';
import { ActionDO, ListItemDefinition, PcAction } from '../../../../../../../../Generated/CoreAPIClient';

export class ActionVM extends ActionDO {
  actionBefore?: number;
  when: string;
  absActionDays?: number;
  portalScreenList: ListItemDefinition[];
  portalDocumentList: ListItemDefinition[];

  constructor(action: ActionDO, portalMessagesList: ListItemDefinition[],
    portalDocumentList: ListItemDefinition[], portalScreenList: ListItemDefinition[]) {
    super(action);

    if (this.actionBefore === undefined) {
      this.actionBefore = (this.actionDays < 0) ? -1 : 1;
    }

    if (this.absActionDays === undefined) {
      this.absActionDays = Math.abs(this.actionDays);
    }

    this.actionDays = (this.absActionDays !== 0) ? this.actionBefore * this.absActionDays : 0;

    const dayStr = this.absActionDays === 1 ? ' Day' : ' Days';
    this.absActionDays = this.absActionDays ? this.absActionDays : 0;

    if (this.absActionDays === 0) {
      this.when = 'On Reference Date';
    } else {
      this.when = this.absActionDays + dayStr + (this.actionBefore < 0 ? ' Before' : ' After');
    }

    if (action.action === PcAction.Portal) {
      if (action?.portalConfiguration) {
        if (portalMessagesList?.length > 0 && action.portalConfiguration.messageList_ID
          && action.portalConfiguration.messageList_ID > 0) {
          const idx = portalMessagesList.findIndex((a) => a.list_ID === action.portalConfiguration.messageList_ID);

          if (idx > -1) {
            this.description = portalMessagesList[idx].itemValue;
          }
        }

        if (portalDocumentList?.length > 0 && action.portalConfiguration.documentsList?.length > 0) {
          this.portalDocumentList = [];

          for (let index = 0; index < action.portalConfiguration.documentsList.length; index++) {
            const listId = action.portalConfiguration.documentsList[index];
            const idx = portalDocumentList.findIndex((a) => a.list_ID === listId);

            if (idx > -1) {
              this.portalDocumentList.push(_.cloneDeep(portalDocumentList[idx]));
            }
          }
        }

        if (portalScreenList?.length > 0 && action.portalConfiguration.screensList?.length > 0) {
          this.portalScreenList = [];

          for (let index = 0; index < action.portalConfiguration.screensList.length; index++) {
            const listId = action.portalConfiguration.screensList[index].list_ID;
            const idx = portalScreenList.findIndex((a) => a.list_ID === listId);

            if (idx > -1) {
              const listItem = _.cloneDeep(portalScreenList[idx]);
              listItem.displayOrder = action.portalConfiguration.screensList[index].displayOrder;
              this.portalScreenList.push(listItem);
            }
          }
        }
      }
    }
  }
}
