import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleDefaultDashboardComponent } from './role-default-dashboard.component';

describe('RoleDefaultDashboardComponent', () => {
  let component: RoleDefaultDashboardComponent;
  let fixture: ComponentFixture<RoleDefaultDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoleDefaultDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoleDefaultDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
