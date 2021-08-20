import { Injectable } from '@angular/core';
import { APIResponseOfListOfInventoryCategoryClosureDO, APIResponseOfListOfInventoryCompanyDO,
  APIResponseOfInventoryCategoryDO, APIResponseOfInventoryProductDO, APIResponseOfListOfInventoryCategoryDO,
  APIResponseOfListOfInventoryProductDO, AssetManagementInventoryClient, InventoryProductDO,
  InventoryCategoryDO, APIResponseOfListOfInventoryProductCategoryDO, InventoryProductFilterDO,
  InventoryCategoryFilterDO, InventoryCompanyDO } from '../../../../../Generated/CoreAPIClient';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../app-store/reducers';
import { SetError } from '../app-store/app-ui-state.actions';


@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  action_start = false;
  create = false;
  createCategorybool = false;
  categoriesService: InventoryCategoryDO[] = new Array();
  shared_searchTerm: InventoryProductFilterDO = new InventoryProductFilterDO();
  companies: InventoryCompanyDO[] = new Array();

  constructor(private inventoryClient: AssetManagementInventoryClient,
    private store: Store<AppState>) { }

  getCategoryClosures() {
    return this.inventoryClient.getAllInventoryCategoryClosures().pipe(
      map((response: APIResponseOfListOfInventoryCategoryClosureDO) => {
      return response;
      }, err => this.store.dispatch(new SetError({ errorMessages: [
        'Unable to process query, please check your network connection.' ] }))));
  }

  getCompanies() {
    return this.inventoryClient.getAllInventoryCompanies().pipe(
      map((response: APIResponseOfListOfInventoryCompanyDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  getCategory(categoryId: number) {
    return this.inventoryClient.getInventoryCategory(categoryId).pipe(
      map((response: APIResponseOfInventoryCategoryDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  getProduct(productId: number) {
    return this.inventoryClient.getInventoryProduct(productId).pipe(
      map((response: APIResponseOfInventoryProductDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  getAllCategories() {
    return this.inventoryClient.getAllInventoryCategory().pipe(
      map((response: APIResponseOfListOfInventoryCategoryDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  getAllProducts() {
    return this.inventoryClient.getAllInventoryProduct().pipe(
      map((response: APIResponseOfListOfInventoryProductDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  getCategoriesForProduct(product: InventoryProductDO) {
    return this.inventoryClient.getInventoryProductCategory(product).pipe(
      map((response: APIResponseOfListOfInventoryProductCategoryDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  deleteCategory(category: InventoryCategoryDO, user: string) {
    return this.inventoryClient.deleteInventoryCategory(category, user).pipe(
      map((response: APIResponseOfInventoryCategoryDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  deleteProduct(productId: number, user: string) {
    return this.inventoryClient.deleteInventoryProduct(productId, user).pipe(
      map((response: APIResponseOfInventoryProductDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  createCategory(category: InventoryCategoryDO, user: string) {
    return this.inventoryClient.createInventoryCategory(category, user).pipe(
      map((response: APIResponseOfInventoryCategoryDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  createProduct(product: InventoryProductDO, user: string) {
    return this.inventoryClient.createInventoryProduct(product, user).pipe(
      map((response: APIResponseOfInventoryProductDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  updateCategory(category: InventoryCategoryDO, user: string) {
    return this.inventoryClient.updateInventoryCategory(category, user).pipe(
      map((response: APIResponseOfInventoryCategoryDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  updateProduct(product: InventoryProductDO, user: string) {
    return this.inventoryClient.updateInventoryProduct(product, user).pipe(
      map((response: APIResponseOfInventoryProductDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  getAllCompanies() {
    return this.inventoryClient.getAllInventoryCompanies().pipe(
      map((response: APIResponseOfListOfInventoryCompanyDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  searchProducts(searchTerm: InventoryProductFilterDO) {
    return this.inventoryClient.searchInventoryProduct(searchTerm).pipe(
      map((response: APIResponseOfListOfInventoryProductDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }

  searchCategories(searchTerm: InventoryCategoryFilterDO) {
    return this.inventoryClient.searchInventoryCategories(searchTerm).pipe(
      map((response: APIResponseOfListOfInventoryCategoryDO) => {
      return response;
    }, err => this.store.dispatch(new SetError({ errorMessages: [
      'Unable to process query, please check your network connection.' ] }))));
  }
}
