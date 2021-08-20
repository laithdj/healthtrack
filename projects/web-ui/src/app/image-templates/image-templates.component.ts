import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { Store, select } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import { take } from 'rxjs/operators';
import { ActivatedRoute } from '../../../../../node_modules/@angular/router';
import { AppState } from '../app-store/reducers';
import {
  ImageTemplatesClient,
  APIResponseOfIEnumerableOfImageTemplateDO,
  ImageTemplateDO,
  ImageTemplateFilesClient,
  APIResponseOfStringOf,
  APIResponseOfImageTemplateDOOf,
} from '../../../../../Generated/CoreAPIClient';
import { selectUserName } from '../app-store/app-ui.selectors';
import { SetError } from '../app-store/app-ui-state.actions';

@Component({
  selector: 'app-image-templates',
  templateUrl: './image-templates.component.html',
  styleUrls: ['./image-templates.component.css'],
})
export class ImageTemplatesComponent implements OnInit {
  formDisplay: string;
  recordSubCategory: string;
  maxDisplayOrder = 1;
  showPopup = false;
  showFilter = false;
  imageTemplates: ImageTemplateDO[];
  imageFileNames: string[];
  userName: string;

  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;

  constructor(private route: ActivatedRoute, private imageTemplatesClient: ImageTemplatesClient,
    private imageTemplateFilesClient: ImageTemplateFilesClient, private store: Store<AppState>,
    private titleService: Title) {
    this.route.params.subscribe((params) => {
      this.formDisplay = params.formDisplay;
      this.recordSubCategory = params.recordSubCategory;
    });

    this.titleService.setTitle('Manage Drawing Tool Image Templates');
    this.store.pipe(take(1), select(selectUserName)).subscribe(
      (userName: string) => { this.userName = userName; });
  }

  ngOnInit() {
    if (this.formDisplay && this.recordSubCategory) {
      this.imageTemplatesClient.getTemplates(this.formDisplay, +this.recordSubCategory)
        .subscribe((response: APIResponseOfIEnumerableOfImageTemplateDO) => {
          if (response.errorMessage && response.errorMessage.length > 0) {
            // show error
          } else if (response.data) {
            this.imageTemplates = [...response.data];
            this.showFilter = response.data.length > 1;
            this.setMaxDisplayOrder();
          }
        });

      this.imageTemplateFilesClient.get().subscribe((response: APIResponseOfStringOf) => {
        if (response.errorMessage && response.errorMessage.length > 0) {
          // show error
        } else if (response.data) {
          this.imageFileNames = response.data;
        }
      });
    }
  }

  setMaxDisplayOrder() {
    this.maxDisplayOrder = 0;
    this.imageTemplates?.forEach((template) => {
      if (template.displayOrder >= this.maxDisplayOrder) {
        this.maxDisplayOrder = template.displayOrder + 1;
      }
    });
  }

  onRowAdded(e: any) {
    e.data.displayOrder = this.maxDisplayOrder;
    this.maxDisplayOrder += 1;
  }

  onAddNewImage() {
    this.dataGrid.instance.addRow();
  }

  onCancelChanges() {
    this.dataGrid.instance.cancelEditData();
    this.setMaxDisplayOrder();
  }

  onImageUploaded(e: string[]) {
    this.imageFileNames = e;
  }

  // re-fetches templates after updating, otherwise any new templates will be duplicated
  // as they don't have an ID until they are saved in the DB
  onSaveImageTemplatesChanges() {
    this.setMaxDisplayOrder();
    this.dataGrid.instance.saveEditData();
    this.imageTemplatesClient.updateImageTemplates(this.imageTemplates, this.userName,
      this.formDisplay, +this.recordSubCategory).subscribe((result: APIResponseOfImageTemplateDOOf) => {
      if (result.errorMessage && result.errorMessage.trim().length > 0) {
        this.store.dispatch(new SetError({ errorMessages: [result.errorMessage] }));
      } else if (result.data) {
        this.imageTemplates = [...result.data];
      }
    });
  }
}
