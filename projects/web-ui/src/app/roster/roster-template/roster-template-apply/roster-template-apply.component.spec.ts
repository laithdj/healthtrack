import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RosterTemplateApplyComponent } from './roster-template-apply.component';

describe('RosterTemplateApplyComponent', () => {
  let component: RosterTemplateApplyComponent;
  let fixture: ComponentFixture<RosterTemplateApplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RosterTemplateApplyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RosterTemplateApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
