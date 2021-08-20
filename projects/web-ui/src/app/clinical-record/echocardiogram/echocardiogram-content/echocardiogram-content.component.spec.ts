import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EchocardiogramContentComponent } from './echocardiogram-content.component';

describe('EchocardiogramClinicalRecordComponent', () => {
  let component: EchocardiogramContentComponent;
  let fixture: ComponentFixture<EchocardiogramContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EchocardiogramContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EchocardiogramContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
