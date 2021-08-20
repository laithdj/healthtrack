import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmartTextEditorComponent } from './smart-text-editor.component';

describe('SmartTextEditorComponent', () => {
  let component: SmartTextEditorComponent;
  let fixture: ComponentFixture<SmartTextEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmartTextEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartTextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
