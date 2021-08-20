import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitRosterComponent } from './split-roster.component';

describe('SplitRosterComponent', () => {
  let component: SplitRosterComponent;
  let fixture: ComponentFixture<SplitRosterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitRosterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitRosterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
