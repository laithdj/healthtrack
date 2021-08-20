import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualMatchingWidgetComponent } from './manual-matching-widget.component';

describe('ManualMatchingWidgetComponent', () => {
  let component: ManualMatchingWidgetComponent;
  let fixture: ComponentFixture<ManualMatchingWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualMatchingWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualMatchingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
