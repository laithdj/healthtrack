import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClaimServicesComponent } from './edit-claim-services.component';

describe('EditClaimServicesComponent', () => {
  let component: EditClaimServicesComponent;
  let fixture: ComponentFixture<EditClaimServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditClaimServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditClaimServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
