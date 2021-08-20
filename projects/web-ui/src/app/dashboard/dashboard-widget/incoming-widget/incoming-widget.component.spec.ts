import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingWidgetComponent } from './incoming-widget.component';

describe('IncomingWidgetComponent', () => {
  let component: IncomingWidgetComponent;
  let fixture: ComponentFixture<IncomingWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomingWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
