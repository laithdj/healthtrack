import { JobNotificationMessage } from '../../../../../Generated/HMS.Interfaces';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class NotificationService {
  jobNotificationMessage = new Subject<JobNotificationMessage>();

  broadcastJobNotificationMessage(message: JobNotificationMessage) {
    this.jobNotificationMessage.next(message);
  }

  broadcastJobNotificationJson(json: string) {
    const message = new JobNotificationMessage();
    message.init(JSON.parse(json));
    this.jobNotificationMessage.next(message);
  }
}
