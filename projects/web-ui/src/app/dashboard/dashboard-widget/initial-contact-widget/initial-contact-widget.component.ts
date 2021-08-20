import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';
import { KnownConfigurationScreen } from '../../../../../../../Generated/HMS.Interfaces';

@Component({
  selector: 'app-initial-contact-widget',
  templateUrl: './initial-contact-widget.component.html',
  styleUrls: ['./initial-contact-widget.component.css']
})
export class InitialContactWidgetComponent {
  @Input() inactive: boolean;

  constructor(
    private stompService: StompService,
  ) { }

  openWindow() {
    this.stompService.openHealthTrackWindow(KnownConfigurationScreen.InitialContact);
  }
}
