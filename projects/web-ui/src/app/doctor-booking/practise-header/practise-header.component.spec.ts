import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PractiseHeaderComponent } from './practise-header.component';

describe('PractiseHeaderComponent', () => {
  let component: PractiseHeaderComponent;
  let fixture: ComponentFixture<PractiseHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PractiseHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PractiseHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
