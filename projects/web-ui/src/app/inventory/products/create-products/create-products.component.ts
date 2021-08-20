import { Component, OnInit, ViewChild } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import { confirm } from 'devextreme/ui/dialog';
import { DxTreeViewComponent, DxSelectBoxComponent, DxValidatorComponent } from 'devextreme-angular';
import { HttpClient } from '@angular/common/http';
import { InventoryService } from '../../inventory.service';
import { InventoryCategoryDO, InventoryCompanyDO, InventoryProductDO } from '../../../../../../../Generated/CoreAPIClient';
import { ActivatedRoute, Router } from '@angular/router';
import notify from 'devextreme/ui/notify';
import { alert} from 'devextreme/ui/dialog';
import { take } from 'rxjs/operators';
import { selectUserName } from '../../../app-store/app-ui.selectors';
import { AppState } from '../../../app-store/reducers';
import { select, Store } from '@ngrx/store';
import { Title } from '@angular/platform-browser';
import { StompService } from '../../../../../src/app/shared/stomp/stomp.service';

export class Tree {
  ID?: any;
  categoryId?: any;
  name?: any;
  expanded?: any;
  price?: any;
}
export class Status {
  name?: any;
  value?: any;

}
@Component({
  selector: 'app-create-products',
  templateUrl: './create-products.component.html',
  styleUrls: ['./create-products.component.css']
})
export class CreateProductsComponent implements OnInit {
  @ViewChild(DxTreeViewComponent) treeView: DxTreeViewComponent;
  @ViewChild('categories_list') categories_list: DxTreeViewComponent;
  @ViewChild('manufacturer') manufacturer: DxSelectBoxComponent;
  @ViewChild('primary') primary: DxSelectBoxComponent;
  @ViewChild(DxValidatorComponent) validator: DxValidatorComponent;

  treeBoxValue: string[];
  categoryNumber: number[] = new Array();
  validation = false;
  special = false;
  companies_ready = false;
  flag = 1;
  primary_validator = false;
  manufacturer_validator = false;
  namePattern: any = /[^a-zA-Z0-9\-\/]/;
  category: InventoryCategoryDO = new InventoryCategoryDO();
  categories: InventoryCategoryDO[] = new Array();
  companies: InventoryCompanyDO[] = new Array();
  product = new InventoryProductDO();
  userName: string;
  status: Status[] = [{ name: 'Current', value: 1 }, { name: 'Disabled', value: 2 }, { name: 'Pending', value: 3 }];
  create = false;

  constructor(http: HttpClient, protected inventoryService: InventoryService,
    private route: ActivatedRoute, private router: Router, private store: Store<AppState>,
    private titleService: Title,
    private stompService: StompService, ) {
    this.product.primarySupplier = new InventoryCompanyDO();
    this.companies[0] = new InventoryCompanyDO();
    this.product.secondarySupplier = new InventoryCompanyDO();
    this.product.manufacturerCompany = new InventoryCompanyDO();
    this.companies[0].companyName = '';
    this.create = this.inventoryService.create;
    this.product.categories = new Array();

    this.route.params.subscribe(params => {
      // unary operator + parse string from url param to number
      const productId = +params['productId'];

      if (productId) {
        this.getProduct(productId);
      }
    });
    if (this.store) {
      this.store.pipe(take(1), select(selectUserName)).subscribe((uName: string) => this.userName = uName);
    }
    if (this.create) {
      this.titleService.setTitle('Equipment Management - Create Product');
    }
    if (!this.create) {
      this.titleService.setTitle('Equipment Management - Edit Product');
    }
  }
  ngOnInit() {
    this.getAllCategories();
    this.getAllCompanies();

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
              this.flag = 2;
          }
          }
        });
  }
  getAllCompanies() {
    this.inventoryService.getCompanies()
      .subscribe(
        response => {
          if (response.data) {
            this.companies = response.data;
            this.companies.sort(function (a, b) {
              const textA = a.companyName.toUpperCase();
              const textB = b.companyName.toUpperCase();
              return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            this.companies_ready = true;
          }
        });
  }
  getCategory(id: number) {
    this.inventoryService.getCategory(id)
      .subscribe(
        response => {
          this.category = response.data;
          if (this.category.parentCategory === this.category.categoryId) {
            this.category.parentCategory = 0;
          }
          // this.product.categories[index] = this.category;
        });
    return this.category;

  }
  getProduct(id: number) {
    this.getAllCompanies();
    this.inventoryService.getProduct(id)
      .subscribe(
        response => {
          if (response.data) {
            this.product = response.data;
            if (this.product.categories[0].categoryName === '') {
              this.categoryNumber = new Array();
            } else {
              this.categoryNumber[0] = this.product.categories[0].categoryId;
            let i = 0;
            this.product.categories.forEach(d => {
              this.categoryNumber[i] = d.categoryId;
              i++;
            });
          }
        }
         this.categories_list.instance.repaint();
         if (this.companies_ready) {
         const supplier_finder = this.companies.find(x => x.companyName === this.product.primarySupplier.companyName);
          if (!supplier_finder) {
            this.product.primarySupplier = new InventoryCompanyDO();
           this.product.primarySupplier.company_ID = 0;
         }
         const manufacturer_finder = this.companies.find(x => x.companyName === this.product.manufacturerCompany.companyName);
         if (!manufacturer_finder) {
           this.product.manufacturerCompany = new InventoryCompanyDO();
           this.product.manufacturerCompany.company_ID = 0;
         }
         }
        });
  }

///////////////////////////////////////////////////////////////

///////////////////////////////////////////////////

  createProduct(product: InventoryProductDO) {
    let errorString = '';
    this.product.categories = new Array();
    let catTemp: InventoryCategoryDO = new InventoryCategoryDO();
    let i = 0;
    this.validation = false;
    this.special = false;

    let flag = 1;
    this.categoryNumber.forEach(d => {
      flag = 2;
      catTemp = this.categories.find(x => x.categoryId === d);
      product.categories[i] = catTemp;
      i++;
    });
    const splChars = '*|,\":<>[]{}`\';()@&$#%';

    if ((product.model !== null)
      && (product.categories !== undefined) && (product.description != null)
      && (product.primarySupplier.company_ID != null) && (product.manufacturerCompany.company_ID != null)
      && (flag === 2)
      && (this.special === false)) {
      this.validation = true;
    }


    product.productId = 1;
    product.createdOn = new Date();
    product.lastModifiedOn = new Date();
    if (this.validation === true) {
      for (let a = 0; a < product.model.length; a++) {
        if (splChars.indexOf(product.model.charAt(a)) !== -1) {
          this.special = true;
      }
      }
       if (this.special === true) {
        errorString = 'model must be alphanumeric. ';
      }
      if (errorString.trim().length > 0) {
        // this.store.dispatch(new SetError(errorString));
        alert(errorString, 'Data Validation Error');

      } else {
      this.inventoryService.createProduct(product, this.userName)
        .subscribe(
          response => {
            if (response.errorMessage === '') {
              this.router.navigate(['inventory/products']);
              notify('Product' + ' was ' + 'added' + ' successfully', 'success', 3000);
            } else if (response.errorMessage === 'multiple categories error') {
              alert('You can not select more than one category in the \'Respiratory\' group.', 'Data Validation Error');
            } else if (response.errorMessage === 'parent category error') {
              alert('You can not select another category group with \'Respiratory\' group.', 'Data Validation Error');
            }
          });
    }
  }
  }


  updateProduct(product: InventoryProductDO) {
    this.product.categories = new Array();
    this.validation = false;
    this.special = false;
    let catTemp: InventoryCategoryDO = new InventoryCategoryDO();
    let i = 0;
    let flag = 1;
    let errorString = '';

    if (this.categoryNumber) {
    this.categoryNumber.forEach(d => {
      flag = 2;
      catTemp = this.categories.find(x => x.categoryId === d);
      product.categories[i] = catTemp;
      i++;
    });
  }
    const splChars = '*|,\":<>[]{}`\';()@&$#%';
    if (product.categories[0] === undefined) {
      product.categories = new Array();
    }
    if ((product.model !== ''
      && (product.description !== '' && (product.categories[0] !== undefined)
      && (product.manufacturerCompany.company_ID !== 0) && (product.manufacturerCompany.company_ID !== null)
      && (product.primarySupplier.company_ID !== 0) && (product.primarySupplier.company_ID != null)
      && (flag === 2)))) {
      this.validation = true;
    }
    console.log(this.validation);
    if ((product.primarySupplier.company_ID === 0) || (product.primarySupplier.company_ID == null)) {
      this.primary.instance.reset();
      // this.validator.instance.reset();
    }

    if ((product.manufacturerCompany.company_ID === 0) || (product.manufacturerCompany.company_ID === null)) {
      this.manufacturer.instance.reset();
      // this.validator.instance.reset();
    }

    if (this.validation === true) {
      for (let a = 0; a < product.model.length; a++) {
        if (splChars.indexOf(product.model.charAt(a)) !== -1) {
          this.special = true;
      }
      }
       if (this.special === true) {
        errorString = 'model must be alphanumeric. ';
      }

      if (errorString.trim().length > 0) {
       // this.store.dispatch(new SetError(errorString));
       alert(errorString, 'Data Validation Error');
      } else {
        this.inventoryService.updateProduct(product, this.userName)
          .subscribe(
            response => {
              if (response.errorMessage === '') {
                this.router.navigate(['inventory/products']);
                notify('Asset' + ' was ' + 'updated' + ' successfully', 'success', 3000);
              } else if (response.errorMessage === 'multiple categories error') {
                alert('There are too many allowed child categories', 'Response Error');
              } else if (response.errorMessage === 'parent category error') {
                alert('There are too many parent categories', 'Response Error');
              }
            });
      }
    }
      this.special = false;
      this.validation = false;

    }


  modelAsyncDataSource(http, jsonFile) {
    return new CustomStore({
      loadMode: 'raw',
      key: 'ID',
      load: function () {
        return http.get('https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/data/' + jsonFile)
          .toPromise();
      }
    });
  }

  syncTreeViewSelection(e?) {
      const component = (e && e.component) || (this.treeView && this.treeView.instance);
      if (!component) { return; }

      if (!this.categoryNumber) {
        component.unselectAll();
      }
      if (this.flag === 2) {
      if (this.categoryNumber) {
        this.categoryNumber.forEach((function (value) {
          component.selectItem(value);
        }).bind(this));
      }
      }
    }

      deleteProduct(id:number, spc:any) {
        let result = confirm("<span style='text-align:center'><p>This will <b>Delete Product</b> " + spc + ". <br><br> Do you wish to continue?</p></span>", "Confirm changes");
        result.then((dialogResult: boolean) => {
          if (dialogResult) {
        this.inventoryService.deleteProduct(id , this.userName)
          .subscribe(
            response => {
              if (response.errorMessage === '') {
                this.router.navigate(['inventory/products']);

                notify('Asset' + ' was ' + 'deleted' + ' successfully', 'success', 3000);
                
              }else{
                alert(response.errorMessage, 'Response Error');
              }
            });
          }
        });
      }
    
  

  getSelectedItemsKeys(items) {
    let result = [];
    const that = this;

    items.forEach(function (item) {
      if (item.selected) {
        result.push(item.key);
      }
      if (item.items.length) {
        result = result.concat(that.getSelectedItemsKeys(item.items));
      }
    });
    return result;
  }

  treeView_itemSelectionChanged(e) {
    const nodes = e.component.getNodes();
    this.categoryNumber = this.getSelectedItemsKeys(nodes);
  }
  cancel() {
    this.router.navigate(['inventory/products']);
  }
  EditCompanies() {
    this.stompService.goToCompanyManager();
  }
}
