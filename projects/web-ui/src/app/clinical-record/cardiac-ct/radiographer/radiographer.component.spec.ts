import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiographerComponent } from './radiographer.component';

describe('RadiographerComponent', () => {
  let component: RadiographerComponent;
  let fixture: ComponentFixture<RadiographerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadiographerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiographerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
