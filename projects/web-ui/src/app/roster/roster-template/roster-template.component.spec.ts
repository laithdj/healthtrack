import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RosterTemplateComponent } from './roster-template.component';

describe('RosterTemplateComponent', () => {
  let component: RosterTemplateComponent;
  let fixture: ComponentFixture<RosterTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RosterTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RosterTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
