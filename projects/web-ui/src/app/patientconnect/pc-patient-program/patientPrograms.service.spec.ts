import { TestBed } from '@angular/core/testing';
import { PatientProgramsService } from './patientPrograms.service';
import { HttpClientTestingModule,
         HttpTestingController } from '@angular/common/http/testing';
import { PatientClient,
    PatientProgramsClient,
    PCProgramsClient,
    PCActionClient,
    InternalDoctorsClient,
    LocationClient,
    ProgramDO
} from '../../../../Generated/CoreAPIClient';
import { PatientConnectService } from '../patientconnect.service';

describe('PatientProgramsService', () => {
  let httpTestingController: HttpTestingController;
  let service: PatientProgramsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
        providers: [
            PatientProgramsService,
            PatientClient,
            PatientProgramsClient,
            PatientConnectService,
            PCProgramsClient,
            PCActionClient,
            InternalDoctorsClient,
            LocationClient
        ],
        imports: [HttpClientTestingModule]
        });

        httpTestingController = TestBed.get(HttpTestingController);
        service = TestBed.get(PatientProgramsService);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('service should be created', () => {
        expect(service).toBeTruthy();
    });

    it('patientProgramsService.calcReferenceDate: should add a year', () => {
        expect(service.calcReferenceDate(new Date(Date.UTC(2019, 3, 23, 9, 23, 23)), 'Y', 1, 1))
            .toEqual(new Date(Date.UTC(2020, 3, 23, 9, 23, 23)));
    });

    it('patientProgramsService.calcReferenceDate: should add a month', () => {
        expect(service.calcReferenceDate(new Date(Date.UTC(2019, 3, 23, 9, 23, 23)), 'M', 1, 1))
            .toEqual(new Date(Date.UTC(2019, 4, 23, 9, 23, 23)));
    });

    it('patientProgramsService.calcReferenceDate: should rollover year - add a month', () => {
        expect(service.calcReferenceDate(new Date(Date.UTC(2019, 11, 23, 9, 23, 23)), 'M', 1, 1))
            .toEqual(new Date(Date.UTC(2020, 0, 23, 9, 23, 23)));
    });

    it('patientProgramsService.calcReferenceDate: should rollover month - add a day', () => {
        expect(service.calcReferenceDate(new Date(Date.UTC(2019, 3, 30, 9, 23, 23)), 'D', 1, 1))
            .toEqual(new Date(Date.UTC(2019, 4, 1, 9, 23, 23)));
    });

    it('patientProgramsService.calcReferenceDate: should add a day', () => {
        expect(service.calcReferenceDate(new Date(Date.UTC(2019, 3, 23, 9, 23, 23)), 'D', 1, 1))
            .toEqual(new Date(Date.UTC(2019, 3, 24, 9, 23, 23)));
    });

    it('patientProgramsService.calcReferenceDate: should handle a leap year - add a day', () => {
        expect(service.calcReferenceDate(new Date(Date.UTC(2020, 1, 29, 9, 23, 23)), 'D', 1, 1))
            .toEqual(new Date(Date.UTC(2020, 2, 1, 9, 23, 23)));
    });

    it('patientProgramsService.calcReferenceDate: should handle a leap year - add a month', () => {
        expect(service.calcReferenceDate(new Date(Date.UTC(2020, 1, 29, 9, 23, 23)), 'M', 1, 1))
            .toEqual(new Date(Date.UTC(2020, 2, 29, 9, 23, 23)));
    });

    it('patientProgramsService.calcNextConnectDue: should add a day', () => {
        expect(service.calcNextConnectDue(new Date(Date.UTC(2020, 1, 29, 9, 23, 23)), 1))
            .toEqual(new Date(Date.UTC(2020, 1, 30, 9, 23, 23)));
    });

    it('patientProgramsService.calcNextConnectDue: should subtract a day', () => {
        expect(service.calcNextConnectDue(new Date(Date.UTC(2020, 1, 29, 9, 23, 23)), -1))
            .toEqual(new Date(Date.UTC(2020, 1, 28, 9, 23, 23)));
    });

    it('patientProgramsService.calcNextConnectDue: should handle leap year - add 2 days', () => {
        expect(service.calcNextConnectDue(new Date(Date.UTC(2020, 1, 27, 9, 23, 23)), 2))
            .toEqual(new Date(Date.UTC(2020, 1, 29, 9, 23, 23)));
    });

    it('patientProgramsService.calcNextConnectDue: should handle leap year - add 3 days and rollover month', () => {
        expect(service.calcNextConnectDue(new Date(Date.UTC(2020, 1, 27, 9, 23, 23)), 3))
            .toEqual(new Date(Date.UTC(2020, 2, 1, 9, 23, 23)));
    });

    it('returned Observable should match the right data', () => {
        const newProgram = service.createNewPatientProgram(1019, new ProgramDO().toJSON(), 1, 1);

        service.savePatientProgram(newProgram, 'tracey')
          .subscribe(program => {
            expect(program.data.id).toEqual(1);
          });

        const req = httpTestingController.expectOne(`/api/patientconnect/PatientPrograms/save?userId=tracey`);
        expect(req.request.method).toEqual('POST');
        // req.flush(newProgram);
        // req.event(new HttpResponse<boolean>({body: true}));
      });
});
