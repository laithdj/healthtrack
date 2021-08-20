import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalReviewWidgetComponent } from './internal-review-widget.component';

describe('InternalReviewWidgetComponent', () => {
  let component: InternalReviewWidgetComponent;
  let fixture: ComponentFixture<InternalReviewWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternalReviewWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InternalReviewWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
