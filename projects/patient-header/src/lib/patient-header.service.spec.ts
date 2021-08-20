import { TestBed } from '@angular/core/testing';

import { PatientHeaderService } from './patient-header.service';

describe('PatientHeaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PatientHeaderService = TestBed.get(PatientHeaderService);
    expect(service).toBeTruthy();
  });
});
