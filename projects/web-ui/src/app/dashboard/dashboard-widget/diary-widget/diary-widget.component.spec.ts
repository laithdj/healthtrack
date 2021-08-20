import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaryWidgetComponent } from './diary-widget.component';

describe('DiaryWidgetComponent', () => {
  let component: DiaryWidgetComponent;
  let fixture: ComponentFixture<DiaryWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiaryWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiaryWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
