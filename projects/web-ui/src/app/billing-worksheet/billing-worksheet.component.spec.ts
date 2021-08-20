import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingWorksheetComponent } from './billing-worksheet.component';

describe('BillingWorksheetComponent', () => {
  let component: BillingWorksheetComponent;
  let fixture: ComponentFixture<BillingWorksheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BillingWorksheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingWorksheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
