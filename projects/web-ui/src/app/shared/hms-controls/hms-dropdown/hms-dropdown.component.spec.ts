import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HmsDropdownComponent } from './hms-dropdown.component';

describe('HmsDropdownComponent', () => {
  let component: HmsDropdownComponent;
  let fixture: ComponentFixture<HmsDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HmsDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HmsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
