import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HMSButtonDeleteComponent } from './hms-button-delete.component';

describe('HMSButtonDeleteComponent', () => {
  let component: HMSButtonDeleteComponent;
  let fixture: ComponentFixture<HMSButtonDeleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HMSButtonDeleteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HMSButtonDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
