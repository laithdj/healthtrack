import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HmsTextAreaComponent } from './hms-text-area.component';

describe('HmsTextAreaComponent', () => {
  let component: HmsTextAreaComponent;
  let fixture: ComponentFixture<HmsTextAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HmsTextAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HmsTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
