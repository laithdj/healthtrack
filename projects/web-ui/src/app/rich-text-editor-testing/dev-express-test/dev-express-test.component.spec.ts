import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevExpressTestComponent } from './dev-express-test.component';

describe('DevExpressTestComponent', () => {
  let component: DevExpressTestComponent;
  let fixture: ComponentFixture<DevExpressTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevExpressTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevExpressTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
