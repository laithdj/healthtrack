import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RosterTemplatePopupComponent } from './roster-template-popup.component';

describe('RosterPopupComponent', () => {
  let component: RosterTemplatePopupComponent;
  let fixture: ComponentFixture<RosterTemplatePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RosterTemplatePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RosterTemplatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
