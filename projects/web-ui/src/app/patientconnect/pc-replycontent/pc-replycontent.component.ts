import { Component, OnInit, ViewChild } from '@angular/core';
import { LocationClient, InternalDoctorsClient, InternalDoctorInfo, APIResponseOfGetAllInternalDoctorsResult,
   GetAllInternalDoctorsParams, GetAllLocationParams, APIResponseOfGetAllLocationResult, LocationInfo,
   ReplyContentDO, ReplyContentFilterDO, ReplyContentClient, APIResponseOfIEnumerableOfReplyContentDO,
   APIResponseOfBoolean, ProgramListItemDO} from '../../../../../../Generated/CoreAPIClient';
import { confirm } from 'devextreme/ui/dialog';
import { PatientConnectService } from '../patientconnect.service';
import { Subscription, pipe } from 'rxjs';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { Title } from '@angular/platform-browser';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../app-store/reducers';
import { selectUserName } from '../../app-store/app-ui.selectors';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-pc-replycontent',
  templateUrl: './pc-replycontent.component.html',
  styleUrls: ['./pc-replycontent.component.css']
})
export class PcReplycontentComponent implements OnInit {

  private subscription: Subscription;
  @ViewChild(DxDataGridComponent) replyGridRef: DxDataGridComponent;
  enabledPrograms: ProgramListItemDO[];
  locations: LocationInfo[];
  doctors: InternalDoctorInfo[];
  editMode = false;
  filter: ReplyContentFilterDO;
  replies: ReplyContentDO[];
  reviewPopup = false;
  selectedReply: ReplyContentDO;
  username: string;
  applyFilterTypes: any;
  currentFilter: any;

  constructor(private locationService: LocationClient,
    private patientConnectService: PatientConnectService,
    private docService: InternalDoctorsClient,
    private replyContentService: ReplyContentClient,
    private titleService: Title,
    private appUiStore: Store<AppState>) {
      this.titleService.setTitle('Patient Connect SMS Replies for Review');
      this.filter = new ReplyContentFilterDO();
      this.replies = [];
      this.appUiStore.pipe(take(1), select(selectUserName)).subscribe((userName: string) => this.username = userName);
      this.patientConnectService.getProgramsList();
    }

  ngOnInit() {
    const programAll = new ProgramListItemDO();
    programAll.id = 0;
    programAll.reason = 'All';

    this.subscription = this.patientConnectService.programListChanged
      .subscribe((list: ProgramListItemDO[]) => {
        this.enabledPrograms = list;
        this.enabledPrograms.unshift(programAll);
     });

     const doctorAll = new InternalDoctorInfo();
     doctorAll.doctorId = 0;
     doctorAll.displayname = 'All';

     this.subscription = this.docService.getAllInternalDoctors(new GetAllInternalDoctorsParams())
      .subscribe((response: APIResponseOfGetAllInternalDoctorsResult) => {
      this.doctors = response.data.results;
      this.doctors.unshift(doctorAll);
    });

    const locationAll = new LocationInfo();
    locationAll.locationId = 0;
    locationAll.name = 'All';

    this.subscription = this.locationService.getAllLocations(new GetAllLocationParams())
      .subscribe((response: APIResponseOfGetAllLocationResult) => {
      this.locations = response.data.results;
      this.locations.unshift(locationAll);
    });

    this.filter.programId = 0;
    this.filter.attendingMOId = 0;
    this.filter.locationId = 0;

    this.onRefreshClick();
  }

  onRefreshClick() {
    this.replyContentService.getReplyContent(this.filter)
      .subscribe((response: APIResponseOfIEnumerableOfReplyContentDO) => this.replies = response.data);
  }

  onEditClicked() {
    if (this.editMode) { this.onRefreshClick(); }
    this.editMode = !this.editMode;

  }

  onSaveClicked() {
    this.editMode = false;
    this.replyContentService.updateReplyContent(this.replies, this.username)
      .subscribe((response: APIResponseOfBoolean) => this.onRefreshClick());
  }

  onEditReply(cell: any) {
    this.selectedReply = cell.data as ReplyContentDO;
    this.reviewPopup = true;
  }

  onDeleteReply(cell: any) {
    this.selectedReply = cell.data as ReplyContentDO;
    const component = this;
    const confirmMessage = 'Delete reply from '
      + this.selectedReply.patientName + ' on '
      + this.selectedReply.mobile + ' '
      + this.selectedReply.content + '?';
    const result = confirm(confirmMessage, 'Delete Reply?');

    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        const toDelete = this.replies.find(x => x.id === this.selectedReply.id);
        toDelete.deleted = true;
        const dataGrid = this.replyGridRef.instance;
        dataGrid.filter(['deleted', '=', false]);
        dataGrid.refresh();
      }
    });
  }
  onConfirmReviewClicked() {
    this.reviewPopup = false;
  }
}
