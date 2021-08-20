import { Component, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { create, createOptions, RichEdit } from 'devexpress-richedit';

@Component({
  selector: 'app-rich-edit',
  templateUrl: './rich-edit.component.html',
  styleUrls: ['./rich-edit.component.css']
})
export class RichEditComponent implements AfterViewInit, OnDestroy {
  private rich: RichEdit;

  constructor(private element: ElementRef) { }

  ngAfterViewInit(): void {
    const options = createOptions();
    options.width = '900px';
    options.height = 'calc(100vh - 53px)';
    this.rich = create(this.element.nativeElement.firstElementChild, options);
  }

  ngOnDestroy() {
    if (this.rich) {
      this.rich.dispose();
      this.rich = null;
    }
  }
}
