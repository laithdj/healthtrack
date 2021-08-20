import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HmsLabelTextComponent } from './hms-label-text.component';

describe('HmsLabelTextComponent', () => {
  let component: HmsLabelTextComponent;
  let fixture: ComponentFixture<HmsLabelTextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HmsLabelTextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HmsLabelTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
