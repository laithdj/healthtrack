import { TestBed } from '@angular/core/testing';

import { QuestionnaireServiceService } from './questionnaire-service.service';

describe('QuestionnaireServiceService', () => {
  let service: QuestionnaireServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionnaireServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
