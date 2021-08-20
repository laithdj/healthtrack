import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationDiaryWidgetComponent } from './location-diary-widget.component';

describe('LocationDiaryWidgetComponent', () => {
  let component: LocationDiaryWidgetComponent;
  let fixture: ComponentFixture<LocationDiaryWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LocationDiaryWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationDiaryWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
