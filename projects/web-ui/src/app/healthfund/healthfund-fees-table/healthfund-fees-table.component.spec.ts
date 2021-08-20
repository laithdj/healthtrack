import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HealthfundFeesTableComponent } from './healthfund-fees-table.component';

describe('HealthfundFeesTableComponent', () => {
  let component: HealthfundFeesTableComponent;
  let fixture: ComponentFixture<HealthfundFeesTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HealthfundFeesTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthfundFeesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
