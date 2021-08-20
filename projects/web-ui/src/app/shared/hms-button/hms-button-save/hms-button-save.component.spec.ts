import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HMSButtonSaveComponent } from './hms-button-save.component';

describe('HMSButtonSaveComponent', () => {
  let component: HMSButtonSaveComponent;
  let fixture: ComponentFixture<HMSButtonSaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HMSButtonSaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HMSButtonSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
