import { Component, Input } from '@angular/core';
import { StompService } from '../../../shared/stomp/stomp.service';

@Component({
  selector: 'app-messenger-widget',
  templateUrl: './messenger-widget.component.html',
  styleUrls: ['./messenger-widget.component.css']
})
export class MessengerWidgetComponent {
  @Input() inactive: boolean;

  constructor(
    private stompService: StompService,
  ) { }

  openWindow() {
    this.stompService.goToMessengerSelectTargetUsers();
  }
}
