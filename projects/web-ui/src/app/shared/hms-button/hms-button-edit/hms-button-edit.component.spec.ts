import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HMSButtonEditComponent } from './hms-button-edit.component';

describe('HMSButtonEditComponent', () => {
  let component: HMSButtonEditComponent;
  let fixture: ComponentFixture<HMSButtonEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HMSButtonEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HMSButtonEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
