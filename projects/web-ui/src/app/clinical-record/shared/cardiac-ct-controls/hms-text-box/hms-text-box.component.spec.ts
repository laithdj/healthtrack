import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HmsTextBoxComponent } from './hms-text-box.component';

describe('HmsTextBoxComponent', () => {
  let component: HmsTextBoxComponent;
  let fixture: ComponentFixture<HmsTextBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HmsTextBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HmsTextBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
