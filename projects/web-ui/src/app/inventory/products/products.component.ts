import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../inventory.service';
import { confirm } from 'devextreme/ui/dialog';
import { InventoryProductDO, InventoryProductFilterDO, InventoryCompanyDO, InventoryCategoryDO } from '../../../../../../Generated/CoreAPIClient';
import notify from 'devextreme/ui/notify';
import { selectUserPkId, selectUserName } from '../../app-store/app-ui.selectors';
import { AppState } from '../../app-store/reducers';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { DxDataGridComponent } from 'devextreme-angular';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  @ViewChild('product_grid') product_grid: DxDataGridComponent;
  products: InventoryProductDO[] = new Array();
  filter_cat: InventoryProductDO[];
  companies: InventoryCompanyDO[] = new Array();
  userName: string;
  state: any;
  categories: InventoryCategoryDO[] = new Array();
  searchTerm: InventoryProductFilterDO;
  constructor(private router: Router, protected inventoryService: InventoryService, private store: Store<AppState>,
    private titleService: Title, ) {
    if (this.store) {
      this.store.pipe(take(1), select(selectUserName)).subscribe((uName: string) => this.userName = uName);
      this.titleService.setTitle('Equipment Management - Products');
      this.searchTerm = new InventoryProductFilterDO({ searchTerm: '' });
    }
  }

  ngOnInit() {
    this.getAllCompanies();
    this.getAllCategories();
    if (this.inventoryService.action_start) {
      this.state = JSON.parse(localStorage.getItem('storage'));
      if (this.state != null) {
        if (this.inventoryService.shared_searchTerm) {
          this.filterProducts(this.inventoryService.shared_searchTerm);
          this.searchTerm.searchTerm = this.inventoryService.shared_searchTerm.searchTerm;
        } else {
          this.getAllProducts();
        }
        this.inventoryService.action_start = false;
      }
    } else {
      localStorage.clear();
      if (this.inventoryService.shared_searchTerm) {
        this.filterProducts(this.inventoryService.shared_searchTerm);
        this.searchTerm.searchTerm = this.inventoryService.shared_searchTerm.searchTerm;
      } else {
        this.getAllProducts();
      }
    }
  }
  getAllProducts() {
    this.inventoryService.shared_searchTerm.searchTerm = '';
    let finder;
    this.inventoryService.getAllProducts()
      .subscribe(
        response => {
          if (response.data) {
            this.products = response.data;
            this.products.sort(function (a, b) {
              const textA = a.model.toUpperCase();
              const textB = b.model.toUpperCase();
              return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
          }
          this.products.forEach(d => {
            finder = this.companies.find(x => x.company_ID === d.primarySupplier.company_ID);
            if (!finder) {
              d.primarySupplier.companyName = '';
            }
          });
        });
  }
  getAllCompanies() {
    this.inventoryService.getCompanies()
      .subscribe(
        response => {
          if (response.data) {
            this.companies = response.data;

          }
        });
  }
  filterProducts(searchTerm: InventoryProductFilterDO) {
    this.inventoryService.shared_searchTerm = searchTerm;
    let finder;

    console.log(searchTerm);
    this.inventoryService.searchProducts(searchTerm)
      .subscribe(
        response => {
          if (response.data) {
            this.products = response.data;
            this.products.sort(function (a, b) {
              const textA = a.model.toUpperCase();
              const textB = b.model.toUpperCase();
              return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
          }
          this.products.forEach(d => {
            finder = this.companies.find(x => x.company_ID === d.primarySupplier.company_ID);
            if (!finder) {
              d.primarySupplier.companyName = '';
            }
          });
        }
      );
  }
  getAllCategories() {
    this.inventoryService.getAllCategories()
      .subscribe(
        response => {
          if (response.data) {
            this.categories = response.data;
            this.categories.sort(function (a, b) {
              const textA = a.categoryName.toUpperCase();
              const textB = b.categoryName.toUpperCase();
              return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            if (response.data) {
              // this.flag = 2;
            }
          }
        });
  }
  addProduct() {
    this.inventoryService.create = true;

    this.router.navigate(['inventory/create-product']);
  }

  deleteProduct(id: number) {
    const result = confirm('<span style=\'text-align:center\'><p>This will <b>Delete Product</b> ' +
      this.products.find(x => x.productId === id).model + '. <br><br> Do you wish to continue?</p></span>', 'Confirm Deletion');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.inventoryService.deleteProduct(id, this.userName)
          .subscribe(
            response => {
              if (response.errorMessage === '') {
                if (this.inventoryService.shared_searchTerm) {
                  this.filterProducts(this.inventoryService.shared_searchTerm);
                } else {
                  this.getAllProducts();
                  this.inventoryService.shared_searchTerm.searchTerm = '';
                  this.searchTerm.searchTerm = '';
                }
                notify('Asset' + ' was ' + 'deleted' + ' successfully', 'success', 3000);
              } else {
                notify(response.errorMessage, 'error', 3000);
              }
            });
      }
    });
  }

  doubleClickRow(e: any) {
    const component = e.component;
    const prevClickTime = component.lastClickTime;
    component.lastClickTime = new Date();

    if (prevClickTime && (component.lastClickTime - prevClickTime < 300)) {
      this.editProduct(e.data.productId);
    }
  }

  editProduct(id: number) {
    this.state = this.product_grid.instance.state();
    localStorage.setItem('storage', JSON.stringify(this.state));
    this.inventoryService.action_start = true;
    this.inventoryService.create = false;
    this.router.navigate(['inventory/create-product/' + id]);
  }
  comibineEquipmentTypes(equipmentTypes: InventoryCategoryDO[]): string {
    let combinedTypes = '';
    if (equipmentTypes.length > 0) {
      combinedTypes += equipmentTypes[0].categoryName;
    }
    for (let _i = 1; _i < equipmentTypes.length; _i++) {
      combinedTypes += ', ' + equipmentTypes[_i].categoryName;
    }
    return combinedTypes;
  }
}
