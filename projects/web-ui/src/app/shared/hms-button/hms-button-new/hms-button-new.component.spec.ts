import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HMSButtonNewComponent } from './hms-button-new.component';

describe('HMSButtonNewComponent', () => {
  let component: HMSButtonNewComponent;
  let fixture: ComponentFixture<HMSButtonNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HMSButtonNewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HMSButtonNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
