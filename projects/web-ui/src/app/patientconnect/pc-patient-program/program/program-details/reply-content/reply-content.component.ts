import { Component, Input } from '@angular/core';
import { ReplyContentDO, Patient, PatientProgram, ActionDO } from '../../../../../../../../../Generated/CoreAPIClient';

@Component({
  selector: 'app-reply-content',
  templateUrl: './reply-content.component.html',
  styleUrls: ['./reply-content.component.css']
})
export class ReplyContentComponent {
  @Input() graphSeries: string[] = [];
  @Input() editMode: boolean;
  @Input() username: string;
  @Input() patient: Patient;
  @Input() selectedProgram: PatientProgram;

  dataViews = ['Graph', 'Data'];
  currentDataView = 'Data';
  newReplyContent = new ReplyContentDO();
  showReplyPopup = false;

  constructor() { }

  onDataViewChanged(e: any) {
    this.currentDataView = e.value;
  }

  onSaveReplyClicked = function(newReplyContent: ReplyContentDO) {
    if (!this.selectedProgram.replyContent) {
      this.selectedProgram.replyContent = [];
    }
    this.selectedProgram.replyContent.push(newReplyContent);
    this.showReplyPopup = false;
  };

  onAddReplyClicked() {
    this.newReplyContent = new ReplyContentDO();
    this.newReplyContent.patientConnectId = this.selectedProgram.id,
    this.newReplyContent.patientId = this.selectedProgram.patientId,
    this.newReplyContent.patientName = this.patient.surname + ', ' + this.patient.firstName,
    this.newReplyContent.mobile = this.patient.mobile,
    this.newReplyContent.dateReceived = new Date();
    this.newReplyContent.validContent = true;
    this.newReplyContent.userCreated = this.username;
    this.newReplyContent.userLastModified = this.username;
    this.showReplyPopup = true;

    // find the action that has reply content (there should be only one)
    const actionWithReplyContent = this.selectedProgram.definition && this.selectedProgram.definition.actions.length > 0 ?
      this.selectedProgram.definition.actions.filter((a: ActionDO) => a.content === true) : null;
    if (actionWithReplyContent.length === 1) {
      this.newReplyContent.contentField = actionWithReplyContent[0].contentField,
      this.newReplyContent.contentRangeType = actionWithReplyContent[0].contentRangeType,
      this.newReplyContent.contentRangeType = actionWithReplyContent[0].contentRangeType;
    } else {
      // actionWithReplyContent.length > 1 ?
        // console.error('more than one action on the selected program has reply content') :
        // console.error('no action on the selected program has reply content');
    }
  }
}
