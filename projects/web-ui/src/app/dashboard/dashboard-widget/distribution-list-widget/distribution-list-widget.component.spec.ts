import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionListWidgetComponent } from './distribution-list-widget.component';

describe('DistributionListWidgetComponent', () => {
  let component: DistributionListWidgetComponent;
  let fixture: ComponentFixture<DistributionListWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DistributionListWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DistributionListWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
