import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPatientConnectComponent } from './new-patient-connect.component';

describe('NewPatientConnectComponent', () => {
  let component: NewPatientConnectComponent;
  let fixture: ComponentFixture<NewPatientConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPatientConnectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPatientConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
