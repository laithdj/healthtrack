import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorBookingComponent } from './doctor-booking.component';

describe('DoctorBookingComponent', () => {
  let component: DoctorBookingComponent;
  let fixture: ComponentFixture<DoctorBookingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorBookingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
