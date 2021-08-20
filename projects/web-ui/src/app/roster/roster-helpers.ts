import { Injectable } from '@angular/core';
import { isSameWeek, addWeeks } from 'date-fns';
import { SessionDO } from '../../../../../Generated/CoreAPIClient';

@Injectable()
export class RosterHelpers {

  constructor() { }

  getWeekNumber(date: Date): number {
    let weekFound = false;
    let checkDate = new Date(2019, 6, 1);
    let weekNo = 1;

    while (!weekFound) {
      if (isSameWeek(checkDate, date, { weekStartsOn: 1 })) {
        weekFound = true;
        return weekNo;
      } else {
        checkDate = addWeeks(checkDate, 1);
        weekNo += 1;
      }
    }
  }

  getCustomSession(): SessionDO {
    const customSession = new SessionDO();
    customSession.sessionId = 0;
    customSession.displayName = 'Custom';
    customSession.startHour = 9;
    customSession.startMinutes = 0;
    customSession.endHour = 17;
    customSession.endMinutes = 0;

    return customSession;
  }

  getDayOfWeek(day: number) {
    switch (day) {
      case 0: return 'Sunday';
      case 1: return 'Monday';
      case 2: return 'Tuesday';
      case 3: return 'Wednesday';
      case 4: return 'Thursday';
      case 5: return 'Friday';
      case 6: return 'Saturday';
    }
  }
}
