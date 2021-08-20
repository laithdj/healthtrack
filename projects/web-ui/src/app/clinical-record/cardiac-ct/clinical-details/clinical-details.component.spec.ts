import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicalDetailsComponent } from './clinical-details.component';

describe('ClinicalDetailsComponent', () => {
  let component: ClinicalDetailsComponent;
  let fixture: ComponentFixture<ClinicalDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClinicalDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClinicalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
