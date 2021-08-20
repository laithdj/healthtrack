import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientWidgetComponent } from './patient-widget.component';

describe('PatientWidgetComponent', () => {
  let component: PatientWidgetComponent;
  let fixture: ComponentFixture<PatientWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
