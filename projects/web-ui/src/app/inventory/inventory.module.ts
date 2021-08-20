import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { ProductsComponent } from './products/products.component';
import { CategoriesComponent } from './categories/categories.component';
import { CreateProductsComponent } from './products/create-products/create-products.component';
import { DxTextBoxModule, DxFormModule, DxCheckBoxModule, DxButtonModule, DxDataGridModule, DxRadioGroupModule,
  DxSelectBoxModule, DxPopupModule,
  DxDateBoxModule,
  DxValidatorModule,
  DxValidationSummaryModule,
  DxValidationGroupModule,
  DxDropDownBoxModule,
  DxTreeViewModule,
  DxTreeListModule,
  DxTextAreaModule} from 'devextreme-angular';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [ProductsComponent, CategoriesComponent, CreateProductsComponent],
  imports: [
    SharedModule,
    CommonModule,
    InventoryRoutingModule,
    DxTextBoxModule, 
    DxFormModule, 
    DxCheckBoxModule, 
    DxButtonModule, 
    DxDataGridModule, 
    DxRadioGroupModule,
    DxSelectBoxModule, 
    DxDateBoxModule,
    DxTreeListModule, 
    DxTextAreaModule,
    DxValidationGroupModule,
    DxPopupModule,
    DxDropDownBoxModule,
    DxTreeViewModule,
    DxValidatorModule,
    DxValidationSummaryModule
  ]
})
export class InventoryModule { }
