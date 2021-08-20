import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoronariesComponent } from './coronaries.component';

describe('CoronariesComponent', () => {
  let component: CoronariesComponent;
  let fixture: ComponentFixture<CoronariesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoronariesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoronariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
