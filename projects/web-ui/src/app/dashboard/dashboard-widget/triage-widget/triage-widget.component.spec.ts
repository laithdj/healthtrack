import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TriageWidgetComponent } from './triage-widget.component';

describe('TriageWidgetComponent', () => {
  let component: TriageWidgetComponent;
  let fixture: ComponentFixture<TriageWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TriageWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TriageWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
