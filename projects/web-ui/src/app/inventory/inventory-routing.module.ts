import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { CreateProductsComponent } from './products/create-products/create-products.component';
import { CategoriesComponent } from './categories/categories.component';

const routes: Routes = [
  {
    path: 'products',
    component: ProductsComponent,
    pathMatch: 'full'
  },
  {
    path: 'create-product',
    component: CreateProductsComponent,
    pathMatch: 'full'
  },
  {
    path: 'categories',
    component: CategoriesComponent,
    pathMatch: 'full'
  },
  {
    path: 'create-product/:productId',
    component: CreateProductsComponent,
    pathMatch: 'full'
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
