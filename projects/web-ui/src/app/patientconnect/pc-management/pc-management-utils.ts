import { SelectedBookingTypeDO } from '../../../../../../Generated/CoreAPIClient';
import { ActionVM } from './pc-program-detail/action-viewmodel/action.viewmodel';

export function bookingTypeSort(a: SelectedBookingTypeDO, b: SelectedBookingTypeDO) {
  if (a.longName.toLowerCase() < b.longName.toLowerCase()) { return -1; }
  if (a.longName.toLowerCase() > b.longName.toLowerCase()) { return 1; }
  return 0;
}

export function reorderActions(selectedActions: ActionVM[]): ActionVM[] {
  let i = 1;
  return selectedActions.sort((a, b) => a.actionDays - b.actionDays).map((a) => {
    a.step = i++;
    return a;
  });
}
