import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignEquipmentComponent } from './assign-equipment.component';

describe('AssignEquipmentComponent', () => {
  let component: AssignEquipmentComponent;
  let fixture: ComponentFixture<AssignEquipmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignEquipmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignEquipmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
