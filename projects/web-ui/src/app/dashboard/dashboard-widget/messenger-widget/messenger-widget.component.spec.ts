import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessengerWidgetComponent } from './messenger-widget.component';

describe('MessengerWidgetComponent', () => {
  let component: MessengerWidgetComponent;
  let fixture: ComponentFixture<MessengerWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessengerWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessengerWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
