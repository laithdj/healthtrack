import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import addDays from 'date-fns/addDays';
import { Subscription } from 'rxjs/internal/Subscription';
import {
  PatientConnectFilterDO,
  InternalDoctorInfo,
  LocationInfo,
  LocationClient,
  InternalDoctorsClient,
  GetAllInternalDoctorsParams,
  APIResponseOfGetAllInternalDoctorsResult,
  GetAllLocationParams,
  APIResponseOfGetAllLocationResult,
  PcAction,
  BatchFilterDO,
  PatientConnectBatchDO,
  ProgramListItemDO,
} from '../../../../../../../Generated/CoreAPIClient';
import { PatientConnectService } from '../../patientconnect.service';
import { PracticeWideService } from '../../practicewide.service';

@Component({
  selector: 'app-practicewide-filter',
  templateUrl: './practicewide-filter.component.html',
  styleUrls: ['./practicewide-filter.component.css'],
})
export class PracticewideFilterComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  selectedBatchId = [];
  filter: PatientConnectFilterDO;
  enabledPrograms: ProgramListItemDO[];
  locations: LocationInfo[];
  doctors: InternalDoctorInfo[];
  users: string[];
  selectedProgramName = 'All';
  selectedMOName = 'All';
  selectedLocation = 'All';
  selectBatch = false;
  batchFilter: BatchFilterDO;
  filteredBatches: PatientConnectBatchDO[];
  selectedBatch: PatientConnectBatchDO;
  lettersAction = false;
  isLoading = true;
  radioGroupItems = [
    { text: 'Pause (User Action)', action: PcAction.PauseUserAction },
    { text: 'Pause (User Action) Without Errors', action: PcAction.PauseUserActionWithOutError },
    { text: 'Letters', action: PcAction.LetterToPatient },
    { text: 'SMS/Email', action: PcAction.Sms },
    { text: 'All', action: PcAction.All },
  ];

  constructor(private locationService: LocationClient,
    private patientConnectService: PatientConnectService,
    private practiceWideService: PracticeWideService,
    private docService: InternalDoctorsClient) {
    this.filter = new PatientConnectFilterDO();
    this.patientConnectService.getProgramsList();
    this.filter.dueTo = new Date();
    this.subscription = this.practiceWideService.fromDate.subscribe((d) => {
      this.filter.dueFrom = d;
      return d;
    });
  }

  ngOnInit() {
    this.filter.action = PcAction.PauseUserAction;
    this.filter.programId = 0;
    this.filter.attendingMOId = 0;
    this.filter.locationId = 0;

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
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onDateTo(days: number) {
    this.filter.dueTo = addDays(new Date(), days);
    this.onRefresh();
  }

  onRefresh() {
    this.isLoading = true;
    this.practiceWideService.updateFilter(this.filter);
    this.lettersAction = (this.filter.action === PcAction.LetterToPatient);
  }

  onFilterChanged(e: any) {
    if (this.enabledPrograms && e.dataField === 'programId') {
      this.selectedProgramName = this.enabledPrograms.find((p) => p.id === e.value).reason;
    }

    if (this.doctors && e.dataField === 'attendingMOId') {
      this.selectedMOName = this.doctors.find((d) => d.doctorId === e.value).displayname;
    }

    if (this.locations && e.dataField === 'locationId') {
      this.selectedLocation = this.locations.find((l) => l.locationId === e.value).name;
    }

    this.onRefresh();
  }

  cancelPopUp() {
    this.selectBatch = false;
  }

  onSelectBatch() {
    this.subscription = this.practiceWideService.getUserLists().subscribe((response: string[]) => {
      this.users = response;
      this.users.unshift('All');
    });

    this.batchFilter = new BatchFilterDO();
    this.batchFilter.toDate = new Date();
    this.batchFilter.fromDate = new Date();
    this.batchFilter.fromDate.setDate(new Date().getDate() - 300);
    this.batchFilter.user = 'All';
    this.batchFilter.selectedBatch = new PatientConnectBatchDO();

    this.onBatchRefresh();
  }

  onBatchRefresh() {
    this.subscription = this.practiceWideService.getBatches(this.batchFilter).subscribe(
      (response: PatientConnectBatchDO[]) => {
        this.filteredBatches = response;
        if (this.filteredBatches?.length > 0) {
          this.selectedBatchId = [this.filteredBatches[this.filteredBatches.length - 1].id];
          this.batchFilter.selectedBatch = this.filteredBatches[this.filteredBatches.length - 1];
        }
      });

    this.selectBatch = true;
  }

  onBatchSelectionChanged(e: any) {
    this.selectedBatch = e.selectedRowsData[0] as PatientConnectBatchDO;
    this.batchFilter.selectedBatch = this.selectedBatch;
  }

  onLoadBatch() {
    this.selectBatch = false;
    this.practiceWideService.loadBatch(this.selectedBatch.id);
  }
}
