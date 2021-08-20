import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetBlurbComponent } from './widget-blurb.component';

describe('WidgetBlurbComponent', () => {
  let component: WidgetBlurbComponent;
  let fixture: ComponentFixture<WidgetBlurbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WidgetBlurbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WidgetBlurbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
