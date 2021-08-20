import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HMSButtonSetComponent } from './hms-button-set.component';

describe('HMSButtonSetComponent', () => {
  let component: HMSButtonSetComponent;
  let fixture: ComponentFixture<HMSButtonSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HMSButtonSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HMSButtonSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
