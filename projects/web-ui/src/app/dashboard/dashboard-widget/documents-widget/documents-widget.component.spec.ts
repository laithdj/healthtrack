import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsWidgetComponent } from './documents-widget.component';

describe('DocumentsWidgetComponent', () => {
  let component: DocumentsWidgetComponent;
  let fixture: ComponentFixture<DocumentsWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentsWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
