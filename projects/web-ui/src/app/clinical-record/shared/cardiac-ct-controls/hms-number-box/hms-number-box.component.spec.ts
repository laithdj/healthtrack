import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HmsNumberBoxComponent } from './hms-number-box.component';

describe('HmsNumberBoxComponent', () => {
  let component: HmsNumberBoxComponent;
  let fixture: ComponentFixture<HmsNumberBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HmsNumberBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HmsNumberBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
