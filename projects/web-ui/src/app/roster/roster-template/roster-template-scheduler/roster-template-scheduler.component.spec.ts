import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RosterTemplateSchedulerComponent } from './roster-template-scheduler.component';


describe('RosterTemplateSchedulerComponent', () => {
  let component: RosterTemplateSchedulerComponent;
  let fixture: ComponentFixture<RosterTemplateSchedulerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RosterTemplateSchedulerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RosterTemplateSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
