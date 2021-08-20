import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicalRecordsWidgetComponent } from './clinical-records-widget.component';

describe('ClinicalRecordsWidgetComponent', () => {
  let component: ClinicalRecordsWidgetComponent;
  let fixture: ComponentFixture<ClinicalRecordsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClinicalRecordsWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClinicalRecordsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
