import { Injectable } from '@angular/core';
import { DateTimeDO } from '../../../../../../Generated/CoreAPIClient';

@Injectable()
export class DateTimeHelperService {
  constructor() { }

  getStartDateTimeDO(date: Date): DateTimeDO {
    const dateTimeDo = new DateTimeDO();

    if (date) {
      date = new Date(date);
      dateTimeDo.year = date.getFullYear();
      dateTimeDo.month = date.getMonth() + 1;
      dateTimeDo.day = date.getDate();
      dateTimeDo.hours = 0;
      dateTimeDo.minutes = 0;
    }

    return dateTimeDo;
  }

  getEndDateTimeDO(date: Date): DateTimeDO {
    const dateTimeDo = new DateTimeDO();

    if (date) {
      date = new Date(date);
      dateTimeDo.year = date.getFullYear();
      dateTimeDo.month = date.getMonth() + 1;
      dateTimeDo.day = date.getDate();
      dateTimeDo.hours = 23;
      dateTimeDo.minutes = 59;
    }

    return dateTimeDo;
  }

  getDateTimeDO(date: Date): DateTimeDO {
    const dateTimeDo = new DateTimeDO();

    if (date) {
      date = new Date(date);
      dateTimeDo.year = date.getFullYear();
      dateTimeDo.month = date.getMonth() + 1;
      dateTimeDo.day = date.getDate();
      dateTimeDo.hours = date.getHours();
      dateTimeDo.minutes = date.getMinutes();
    }

    return dateTimeDo;
  }

  public getDate(dateTimeDo: DateTimeDO): Date {
    return new Date(dateTimeDo.year, dateTimeDo.month - 1, dateTimeDo.day, dateTimeDo.hours, dateTimeDo.minutes);
  }
}
