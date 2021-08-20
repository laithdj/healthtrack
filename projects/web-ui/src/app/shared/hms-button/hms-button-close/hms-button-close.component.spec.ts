import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HMSButtonCloseComponent } from './hms-button-close.component';

describe('HMSButtonCloseComponent', () => {
  let component: HMSButtonCloseComponent;
  let fixture: ComponentFixture<HMSButtonCloseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HMSButtonCloseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HMSButtonCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
