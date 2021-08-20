import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RichEditComponent } from './rich-edit.component';

describe('RichEditComponent', () => {
  let component: RichEditComponent;
  let fixture: ComponentFixture<RichEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RichEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RichEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
