import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentTimesComponent } from './appointment-times.component';

describe('AppointmentTimesComponent', () => {
  let component: AppointmentTimesComponent;
  let fixture: ComponentFixture<AppointmentTimesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppointmentTimesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentTimesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
