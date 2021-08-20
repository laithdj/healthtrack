import { Pipe, PipeTransform } from '@angular/core';
import { DateTimeDO } from '../../../../../../Generated/CoreAPIClient';

@Pipe({
  name: 'dateTimeDO',
})
export class DateTimeDOPipe implements PipeTransform {
  transform(value: DateTimeDO): Date {
    if (value?.year && value?.month && value?.day && value?.hours && value?.minutes) {
      return new Date(value.year, (value.month - 1), value.day, value.hours, value.minutes);
    }

    return undefined;
  }
}
