import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EchocardiogramClinicalDetailComponent } from './echocardiogram-clinical-detail.component';

describe('EchocardiogramClinicalDetailComponent', () => {
  let component: EchocardiogramClinicalDetailComponent;
  let fixture: ComponentFixture<EchocardiogramClinicalDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EchocardiogramClinicalDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EchocardiogramClinicalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
