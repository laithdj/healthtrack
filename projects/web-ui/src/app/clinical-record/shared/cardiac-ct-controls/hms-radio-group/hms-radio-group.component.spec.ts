import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HmsRadioGroupComponent } from './hms-radio-group.component';

describe('HmsRadioGroupComponent', () => {
  let component: HmsRadioGroupComponent;
  let fixture: ComponentFixture<HmsRadioGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HmsRadioGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HmsRadioGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
