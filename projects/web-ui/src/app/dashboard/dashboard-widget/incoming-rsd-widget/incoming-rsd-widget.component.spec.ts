import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomingRsdWidgetComponent } from './incoming-rsd-widget.component';

describe('IncomingRsdWidgetComponent', () => {
  let component: IncomingRsdWidgetComponent;
  let fixture: ComponentFixture<IncomingRsdWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncomingRsdWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncomingRsdWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
