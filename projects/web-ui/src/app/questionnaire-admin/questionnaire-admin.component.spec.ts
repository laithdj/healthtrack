import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireAdminComponent } from './questionnaire-admin.component';

describe('QuestionnaireAdminComponent', () => {
  let component: QuestionnaireAdminComponent;
  let fixture: ComponentFixture<QuestionnaireAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionnaireAdminComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
