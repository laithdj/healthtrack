import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEquipmentRosterPopupComponent } from './edit-equipment-roster-popup.component';

describe('EditEquipmentRosterPopupComponent', () => {
  let component: EditEquipmentRosterPopupComponent;
  let fixture: ComponentFixture<EditEquipmentRosterPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditEquipmentRosterPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEquipmentRosterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
