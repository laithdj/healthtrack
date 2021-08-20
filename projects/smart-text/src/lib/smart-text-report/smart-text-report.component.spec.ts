import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartTextReportComponent } from './smart-text-report.component';

describe('DevExpressTestComponent', () => {
  let component: SmartTextReportComponent;
  let fixture: ComponentFixture<SmartTextReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartTextReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartTextReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
