import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewRequestWidgetComponent } from './new-request-widget.component';

describe('NewRequestWidgetComponent', () => {
  let component: NewRequestWidgetComponent;
  let fixture: ComponentFixture<NewRequestWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewRequestWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewRequestWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
