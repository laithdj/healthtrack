import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EchocardiogramMMode2DComponent } from './echocardiogram-mmode2d.component';

describe('EchocardiogramMMode2DComponent', () => {
  let component: EchocardiogramMMode2DComponent;
  let fixture: ComponentFixture<EchocardiogramMMode2DComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EchocardiogramMMode2DComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EchocardiogramMMode2DComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
