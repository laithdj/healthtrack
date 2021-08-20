import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WorksheetWidgetComponent } from './worksheet-widget.component';

describe('WorksheetWidgetComponent', () => {
  let component: WorksheetWidgetComponent;
  let fixture: ComponentFixture<WorksheetWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WorksheetWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorksheetWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
