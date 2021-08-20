import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingMatchingWidgetComponent } from './incoming-matching-widget.component';

describe('IncomingMatchingWidgetComponent', () => {
  let component: IncomingMatchingWidgetComponent;
  let fixture: ComponentFixture<IncomingMatchingWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomingMatchingWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomingMatchingWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
