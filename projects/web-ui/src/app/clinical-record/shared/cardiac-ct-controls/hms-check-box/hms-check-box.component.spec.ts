import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HmsCheckBoxComponent } from './hms-check-box.component';

describe('HmsCheckBoxComponent', () => {
  let component: HmsCheckBoxComponent;
  let fixture: ComponentFixture<HmsCheckBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HmsCheckBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HmsCheckBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
