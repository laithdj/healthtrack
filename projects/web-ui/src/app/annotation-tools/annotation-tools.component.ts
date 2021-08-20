import { Component, ViewChild } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ActivatedRoute, Params } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import { Title } from '@angular/platform-browser';
import { AnnotationToolDO } from '../../../../../Generated/CoreAPIClient';
import * as AnnotationToolsActions from './store/annotation-tools.actions';
import { selectAnnotationTools } from './store/annotation-tools.selectors';
import { AnnotationToolsState } from './store/annotation-tools.reducers';
// eslint-disable-next-line import/order
import * as _ from 'lodash';

@Component({
  selector: 'app-annotation-tools',
  templateUrl: './annotation-tools.component.html',
  styleUrls: ['./annotation-tools.component.css'],
})

export class AnnotationToolsComponent {
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;

  annotationTools: AnnotationToolDO[] = [];
  annotationTools$ = this.store.pipe(select(selectAnnotationTools));
  formDisplay: string;
  recordSubCategory: number;
  dataTypes: any[] = [
    { text: 'Whole Number', value: 'int' },
    { text: 'Decimal Number', value: 'float' },
    { text: 'Text', value: 'string' }];

  constructor(private route: ActivatedRoute,
    private store: Store<AnnotationToolsState>,
    private titleService: Title) {
    this.titleService.setTitle('Manage Annotation Tools');

    this.route.params.subscribe((params: Params) => {
      this.formDisplay = params.formDisplay;
      this.recordSubCategory = params.recordSubCategory;
      this.store.dispatch(new AnnotationToolsActions.FetchAnnotationTools({
        formDisplay: this.formDisplay,
        recordSubCategory: this.recordSubCategory,
      }));
    });

    this.annotationTools$.subscribe((tools) => {
      this.annotationTools = _.cloneDeep(tools);
    });
  }

  onAddNewTool() {
    this.dataGrid.instance.addRow();
  }

  onSaveChanges() {
    const tools = this.dataGrid.dataSource as AnnotationToolDO[];

    tools.forEach((t) => {
      if (typeof t.id !== 'number') {
        t.id = 0;
      }
    });

    this.store.dispatch(new AnnotationToolsActions.SaveAnnotationTools({
      annotationTools: tools,
      formDisplay: this.formDisplay,
      recordSubCategory: this.recordSubCategory,
    }));
  }

  onCancelChanges() {
    this.store.dispatch(new AnnotationToolsActions.FetchAnnotationTools({
      formDisplay: this.formDisplay,
      recordSubCategory: this.recordSubCategory,
    }));
  }
}
