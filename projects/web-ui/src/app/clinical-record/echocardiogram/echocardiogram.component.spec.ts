import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EchocardiogramComponent } from './echocardiogram.component';

describe('EchocardiogramComponent', () => {
  let component: EchocardiogramComponent;
  let fixture: ComponentFixture<EchocardiogramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EchocardiogramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EchocardiogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
