import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditInfoPopupComponent } from './audit-info-popup.component';

describe('AuditInfoPopupComponent', () => {
  let component: AuditInfoPopupComponent;
  let fixture: ComponentFixture<AuditInfoPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AuditInfoPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuditInfoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
