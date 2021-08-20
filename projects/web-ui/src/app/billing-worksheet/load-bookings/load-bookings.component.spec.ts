import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadBookingsComponent } from './load-bookings.component';

describe('LoadBookingsComponent', () => {
  let component: LoadBookingsComponent;
  let fixture: ComponentFixture<LoadBookingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadBookingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
