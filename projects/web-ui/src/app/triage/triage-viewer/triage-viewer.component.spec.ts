import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TriageViewerComponent } from './triage-viewer.component';

describe('TriageViewerComponent', () => {
  let component: TriageViewerComponent;
  let fixture: ComponentFixture<TriageViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TriageViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TriageViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
