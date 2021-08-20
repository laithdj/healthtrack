import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthfundFeesDetailsComponent } from './healthfund-fees-details.component';

describe('HealthfundFeesDetailsComponent', () => {
  let component: HealthfundFeesDetailsComponent;
  let fixture: ComponentFixture<HealthfundFeesDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthfundFeesDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthfundFeesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
