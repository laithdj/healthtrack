import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CardiacCTComponent } from './cardiac-ct.component';

describe('CardiacCTComponent', () => {
  let component: CardiacCTComponent;
  let fixture: ComponentFixture<CardiacCTComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CardiacCTComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardiacCTComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
