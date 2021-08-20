import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectBookingTypesComponent } from './select-booking-types.component';

describe('SelectBookingTypesComponent', () => {
  let component: SelectBookingTypesComponent;
  let fixture: ComponentFixture<SelectBookingTypesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectBookingTypesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectBookingTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
