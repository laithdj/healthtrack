
import { TasksWidgetComponent } from './tasks-widget.component';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';

describe('TasksWidgetComponent', () => {
  let component: TasksWidgetComponent;
  let fixture: ComponentFixture<TasksWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TasksWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TasksWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
