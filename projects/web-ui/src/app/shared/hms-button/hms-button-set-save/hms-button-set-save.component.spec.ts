import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HMSButtonSetSaveComponent } from './hms-button-set-save.component';

describe('HMSButtonsSaveAndCloseComponent', () => {
  let component: HMSButtonSetSaveComponent;
  let fixture: ComponentFixture<HMSButtonSetSaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HMSButtonSetSaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HMSButtonSetSaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
