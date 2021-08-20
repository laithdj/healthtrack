import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RosterTemplateSetComponent } from './roster-template-set.component';

describe('SetMenuComponent', () => {
  let component: RosterTemplateSetComponent;
  let fixture: ComponentFixture<RosterTemplateSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RosterTemplateSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RosterTemplateSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
