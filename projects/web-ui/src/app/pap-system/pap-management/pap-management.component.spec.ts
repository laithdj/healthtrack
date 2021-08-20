import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PapManagementComponent } from './pap-management.component';

describe('PapManagementComponent', () => {
  let component: PapManagementComponent;
  let fixture: ComponentFixture<PapManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PapManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PapManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
