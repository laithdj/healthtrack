import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialContactWidgetComponent } from './initial-contact-widget.component';

describe('InitialContactWidgetComponent', () => {
  let component: InitialContactWidgetComponent;
  let fixture: ComponentFixture<InitialContactWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitialContactWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitialContactWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
