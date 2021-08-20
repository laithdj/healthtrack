import { TestBed } from '@angular/core/testing';

import { HealthfundService } from './healthfund.service';

describe('HealthfundService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HealthfundService = TestBed.get(HealthfundService);
    expect(service).toBeTruthy();
  });
});
