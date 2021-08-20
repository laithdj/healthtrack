import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplyContentComponent } from './reply-content.component';

describe('ReplyContentComponent', () => {
  let component: ReplyContentComponent;
  let fixture: ComponentFixture<ReplyContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplyContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplyContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
