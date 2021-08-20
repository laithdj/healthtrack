import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreAdmissionComponent } from './pre-admission.component';

describe('PreAdmissionComponent', () => {
  let component: PreAdmissionComponent;
  let fixture: ComponentFixture<PreAdmissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreAdmissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreAdmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
