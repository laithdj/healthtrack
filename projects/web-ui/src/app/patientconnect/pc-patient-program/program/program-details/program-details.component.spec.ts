import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { PCProgramsClient, PCActionClient, InternalDoctorsClient, LocationClient, PatientClient,
  PatientProgramsClient } from '../../../../../../Generated/CoreAPIClient';
import { PatientProgramsService } from '../../patientPrograms.service';
import { PatientConnectService } from '../../../patientconnect.service';
import { DxSelectBoxModule, DxDateBoxModule, DxTabPanelModule, DxPopupModule, DxButtonModule,
  DxFormModule, DxDataGridModule, DxTextBoxModule, DxListModule, DxRadioGroupModule, DxChartModule,
  DxCheckBoxModule, DxNumberBoxModule, DxValidatorModule, DxValidationGroupModule } from 'devextreme-angular';
import { StompService } from '../../../../shared/stomp/stomp.service';

import { ProgramDetailsComponent } from './program-details.component';
import { ReplycontentDialogComponent } from '../../../pc-replycontent/replycontent-dialog/replycontent-dialog.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { NotificationService } from '../../../../shared/notification-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProgramDetailsComponent', () => {
  let component: ProgramDetailsComponent;
  let fixture: ComponentFixture<ProgramDetailsComponent>;
  let bookingTypes = [];

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramDetailsComponent, ReplycontentDialogComponent ],
      imports: [
        DxSelectBoxModule,
        DxDateBoxModule,
        DxTabPanelModule,
        DxPopupModule,
        DxButtonModule,
        DxFormModule,
        DxDataGridModule,
        DxTextBoxModule,
        DxListModule,
        DxRadioGroupModule,
        DxChartModule,
        DxCheckBoxModule,
        DxNumberBoxModule,
        DxValidatorModule,
        DxValidationGroupModule,
      ],
      providers: [
        PatientProgramsService,
        PatientConnectService,
        InternalDoctorsClient,
        LocationClient,
        PatientClient,
        PatientProgramsClient,
        StompService,
        PCProgramsClient,
        PCActionClient,
        HttpClient,
        HttpHandler,
        HttpClientTestingModule,
        NotificationService,
    ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // tslint:disable-next-line:max-line-length
    bookingTypes = [{'$id': '2', 'bookingType': '.', 'longName': 'Hold', 'selected': false}, {'$id': '3', 'bookingType': '+/-6', 'longName': '+/-6', 'selected': false}, {'$id': '4', 'bookingType': 'AB', 'longName': 'Ablation', 'selected': false}, {'$id': '5', 'bookingType': 'AM', 'longName': 'AM Procedure', 'selected': false}, {'$id': '6', 'bookingType': 'AN', 'longName': 'Angiogram', 'selected': false}, {'$id': '7', 'bookingType': 'Any', 'longName': 'LINGUAL TONSIL OR LATERAL PHARYNGEAL BAN', 'selected': false}, {'$id': '8', 'bookingType': 'ASD', 'longName': 'ASD', 'selected': false}, {'$id': '9', 'bookingType': 'BA', 'longName': 'BPM attach', 'selected': false}, {'$id': '10', 'bookingType': 'BD', 'longName': 'BPM Detach', 'selected': false}, {'$id': '11', 'bookingType': 'BL', 'longName': 'Block-out', 'selected': false}, {'$id': '12', 'bookingType': 'BP', 'longName': 'blood pressure monitor', 'selected': false}, {'$id': '13', 'bookingType': 'BREAK', 'longName': 'Break', 'selected': false}, {'$id': '14', 'bookingType': 'CA', 'longName': 'Cath', 'selected': false}, {'$id': '15', 'bookingType': 'CDS', 'longName': 'Consult - Dietetic Standard test', 'selected': false}];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('createBookingTypeColumns: should create booking type column', () => {
  //   const sortedBookingTypes = Object.assign([], bookingTypes);
  //   const bookingTypeColumns = [{ columnData: bookingTypes.slice(0, 1) }];
  //   expect(fixture.componentInstance.createBookingTypeColumns(1, 1, sortedBookingTypes)).toEqual(bookingTypeColumns);
  // });

  // it('createBookingTypeColumns: should create booking type columns', () => {
  //   const sortedBookingTypes = Object.assign([], bookingTypes);
  //   const bookingTypeColumns = [{ columnData: bookingTypes.slice(0, 4) }];
  //   expect(fixture.componentInstance.createBookingTypeColumns(1, 4, sortedBookingTypes)).toEqual(bookingTypeColumns);
  // });

//   it('createBookingTypeColumns: should create two booking type columns', () => {
//     const sortedBookingTypes = Object.assign([], bookingTypes);
//     const bookingTypeColumns = [{ columnData: bookingTypes.slice(0, 10) }, { columnData: bookingTypes.slice(10, 14) }];
//     expect(fixture.componentInstance.createBookingTypeColumns(2, 10, sortedBookingTypes)).toEqual(bookingTypeColumns);
//   });

});
