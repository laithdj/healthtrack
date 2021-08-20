import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EchoSpreadsheetComponent } from './echo-spreadsheet.component';

describe('EchoSpreadsheetComponent', () => {
  let component: EchoSpreadsheetComponent;
  let fixture: ComponentFixture<EchoSpreadsheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EchoSpreadsheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EchoSpreadsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
