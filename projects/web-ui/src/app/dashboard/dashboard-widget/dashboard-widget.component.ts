import { Component, Input, EventEmitter, Output } from '@angular/core';
import { WidgetConfiguration } from '../../../../../../Generated/CoreAPIClient';
import { DashboardWidget } from '../../../../../../Generated/HMS.Interfaces';

@Component({
  selector: 'app-dashboard-widget',
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.css']
})
export class DashboardWidgetComponent{
  widgetId: number;
  dashboardWidget = DashboardWidget;

  @Input() widget: DashboardWidget;
  @Input() editMode: boolean;
  @Input() rowNumber: number;
  @Input() columnNumber: number;
  @Input() noRelocateButtons: boolean;
  @Input() inactive: boolean;
  @Input() selectedLocationId: number;
  @Input() widgetConfigurations: WidgetConfiguration[];
  @Input() doctorId: number;
  @Input() systemDefault: boolean;
  @Input() locationIndex: number;

  @Output() widgetAdded: EventEmitter<{ row: number, column: number }> = new EventEmitter();
  @Output() widgetDeleted: EventEmitter<{ row: number, column: number, widget: DashboardWidget }> = new EventEmitter();
  @Output() widgetMoved: EventEmitter<{ row: number, column: number, widget: DashboardWidget }> = new EventEmitter();

  constructor() { }


  addWidgetClicked() {
      this.widgetAdded.emit({ row: this.rowNumber, column: this.columnNumber });
  }

  deleteWidgetClicked() {
    this.widgetDeleted.emit({ row: this.rowNumber, column: this.columnNumber, widget: this.widget });
  }

  moveWidgetClicked() {
    this.widgetMoved.emit({ row: this.rowNumber, column: this.columnNumber, widget: this.widget });
  }

  widgetOptionsFor(widget: DashboardWidget): boolean {
    if (this.widgetConfigurations) {
      const index = this.widgetConfigurations.findIndex(x => x.widget === widget);
      if (index !== -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  getWidgetIndex(widget: DashboardWidget): number {
    const index = this.widgetConfigurations.findIndex(x => x.widget === widget);
    return index;
  }
}
