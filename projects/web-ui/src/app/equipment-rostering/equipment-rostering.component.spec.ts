import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentRosteringComponent } from './equipment-rostering.component';

describe('EquipmentRosteringComponent', () => {
  let component: EquipmentRosteringComponent;
  let fixture: ComponentFixture<EquipmentRosteringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EquipmentRosteringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EquipmentRosteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
