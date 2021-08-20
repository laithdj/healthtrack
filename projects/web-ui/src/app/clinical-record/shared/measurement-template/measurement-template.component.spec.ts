import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementTemplateComponent } from './measurement-template.component';

describe('MeasurementTemplateComponent', () => {
  let component: MeasurementTemplateComponent;
  let fixture: ComponentFixture<MeasurementTemplateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MeasurementTemplateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MeasurementTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
