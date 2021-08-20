import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientConnectWidgetComponent } from './patient-connect-widget.component';

describe('PatientConnectWidgetComponent', () => {
  let component: PatientConnectWidgetComponent;
  let fixture: ComponentFixture<PatientConnectWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientConnectWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientConnectWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
