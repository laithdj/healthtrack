import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HMSButtonCancelComponent } from './hms-button-cancel.component';

describe('HMSButtonCancelComponent', () => {
  let component: HMSButtonCancelComponent;
  let fixture: ComponentFixture<HMSButtonCancelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HMSButtonCancelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HMSButtonCancelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
