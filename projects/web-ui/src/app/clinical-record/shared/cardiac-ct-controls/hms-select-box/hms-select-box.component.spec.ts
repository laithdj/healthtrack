import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HmsSelectBoxComponent } from './hms-select-box.component';

describe('HmsSelectBoxComponent', () => {
  let component: HmsSelectBoxComponent;
  let fixture: ComponentFixture<HmsSelectBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HmsSelectBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HmsSelectBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
