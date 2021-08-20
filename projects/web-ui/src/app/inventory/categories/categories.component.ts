import {
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { confirm, alert } from 'devextreme/ui/dialog';
import notify from 'devextreme/ui/notify';
import { DxDataGridComponent, DxTreeViewComponent } from 'devextreme-angular';
import { Store, select } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { selectUserName } from '../../app-store/app-ui.selectors';
import { AppState } from '../../app-store/reducers';
import { InventoryCategoryDO, InventoryCategoryFilterDO } from '../../../../../../Generated/CoreAPIClient';
import { InventoryService } from '../inventory.service';
// import { Tree } from '../models/tree.model';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
})
export class CategoriesComponent implements OnInit {
  @ViewChild(DxDataGridComponent) dataGrid: DxDataGridComponent;
  @ViewChild(DxTreeViewComponent) treeView: DxTreeViewComponent;

  // treeDataSource: Tree[];
  categoryNumber: number[] = [];
  treeBoxValue: string;
  popupTitle = '';
  categories: InventoryCategoryDO[] = [];
  categoriesDropdown: InventoryCategoryDO[] = [];
  filterCat: InventoryCategoryDO[] = [];
  category: InventoryCategoryDO = new InventoryCategoryDO();
  addEditCategory = false;
  temp: InventoryCategoryDO[] = [];
  userName: string;
  createCategorybool = false;
  searchTerm: InventoryCategoryFilterDO;
  parentNumber = 0;

  constructor(protected inventoryService: InventoryService, private store: Store<AppState>,
    private titleService: Title) {
    if (this.store) {
      this.store.pipe(take(1), select(selectUserName)).subscribe((uName: string) => { this.userName = uName; });
      this.titleService.setTitle('Equipment Management - Product Categories');
    }

    this.categoryNumber = [1];

    if (this.createCategorybool === true) {
      this.categoryNumber = [];
    }

    this.searchTerm = new InventoryCategoryFilterDO({
      searchTerm: '',
    });
  }

  ngOnInit() {
    this.createCategorybool = this.inventoryService.createCategorybool;
    this.getAllCategoriesDropDown();
    this.getAllCategories();
  }

  filterCategory(searchTerm: InventoryCategoryFilterDO) {
    this.inventoryService.searchCategories(searchTerm).subscribe((response) => {
      this.categories = response.data;
    });
  }

  getAllCategories() {
    this.inventoryService.getAllCategories().subscribe((response) => {
      this.categories = response.data;

      this.categories.sort((a, b) => {
        const textA = a.categoryName.toUpperCase();
        const textB = b.categoryName.toUpperCase();

        if (textA < textB) {
          return -1;
        }

        return (textA > textB) ? 1 : 0;
      });
    });
  }

  getAllCategoriesDropDown() {
    this.inventoryService.getAllCategories().subscribe((response) => {
      this.categoriesDropdown = response.data;

      this.categoriesDropdown.sort((a, b) => {
        const textA = a.categoryName.toUpperCase();
        const textB = b.categoryName.toUpperCase();

        if (textA < textB) {
          return -1;
        }

        return (textA > textB) ? 1 : 0;
      });
    });
  }

  createCategory() {
    let errorString = '';
    // let flag = 1;
    // const splChars = '*|,":<>[]{}`\';()@&$#%';

    // for (let i = 0; i < this.category.categoryName.length; i++) {
    //   if (splChars.indexOf(this.category.categoryName.charAt(i)) !== -1) {
    //     flag = 2;
    //   }
    // }

    if (!this.category.categoryName.replace(/\s/g, '').length) {
      errorString += 'Category name can not be empty';
    } else if (!this.category.categoryName) {
      errorString += 'Category name can not be empty';
    }

    if (errorString.trim().length > 0) {
      alert(errorString, 'Data Validation Error');
    } else {
      this.inventoryService.createCategory(this.category, this.userName).subscribe((response) => {
        if (response.errorMessage === '') {
          if (this.searchTerm.searchTerm) {
            this.filterCategory(this.searchTerm);
          } else {
            this.getAllCategories();
          }
          this.addEditCategory = false;
          notify('Category was added successfully', 'success', 3000);
        } else {
          alert(response.errorMessage, 'Response Error');
        }
      });
    }
  }

  selectStatus(data) {
    if (data.value === 'All') {
      this.dataGrid.instance.clearFilter();
    } else {
      this.dataGrid.instance.filter(['Task_Status', '=', data.value]);
    }
  }

  updateCategory(category: InventoryCategoryDO) {
    let errorString = '';
    // let flag = 1;
    // const splChars = '*|,\":<>[]{}`\';()@&$#%';

    // for (let i = 0; i < this.category.categoryName.length; i++) {
    //   if (splChars.indexOf(this.category.categoryName.charAt(i)) !== -1) {
    //     flag = 2;
    //   }
    // }

    if (!this.category.categoryName.replace(/\s/g, '').length) {
      errorString += 'Category name can not be empty';
    } else if (!this.category.categoryName) {
      errorString += 'Category name can not be empty';
    }

    if (errorString.trim().length > 0) {
      alert(errorString, 'Data Validation Error');
    } else {
      this.inventoryService.updateCategory(category, this.userName).subscribe(() => {
        if (this.searchTerm.searchTerm) {
          this.filterCategory(this.searchTerm);
        } else {
          this.getAllCategories();
        }
        this.addEditCategory = false;
      });
    }
  }

  deleteCategory(category: InventoryCategoryDO) {
    let errorString = '';

    let flag = false;
    this.categories.forEach((d) => {
      if ((d.parentCategory === category.categoryId) || (d.parentCategory === 0)) {
        flag = true;
      }
    });

    const result = confirm(`<span style='text-align:center'><p>This will <b>Delete Category</b> ${category.categoryName
    }. <br><br> Do you wish to continue?</p></span>`, 'Confirm Deletion');
    result.then((dialogResult: boolean) => {
      if (dialogResult) {
        this.inventoryService.deleteCategory(category, this.userName)
          .subscribe(
            (response) => {
              if (response.errorMessage === '') {
                this.addEditCategory = false;
                if (this.searchTerm.searchTerm) {
                  this.filterCategory(this.searchTerm);
                } else {
                  this.getAllCategories();
                }
                notify('Category was deleted successfully', 'success', 3000);
              } else if (flag === true) {
                errorString = 'Can not delete as it has child categories.';
                if (errorString.trim().length > 0) {
                  alert(errorString, 'Response Error');
                }
              } else {
                alert(response.errorMessage, 'Response Error');
              }
            });
      }
    });
  }

  getCategory(id: number) {
    this.inventoryService.getCategory(id)
      .subscribe(
        (response) => {
          this.category = response.data;
        });
  }

  addCategory() {
    this.popupTitle = 'Add New Category';
    this.category = new InventoryCategoryDO();
    this.addEditCategory = true;
    this.createCategorybool = true;
    this.inventoryService.createCategorybool = true;
  }

  editCategory(id: number) {
    this.popupTitle = 'Edit Category';

    this.category = this.categories.find((c) => c.categoryId === id);
    if (this.category.parentCategory === 0) {
      this.category.parentCategory = null;
    }
    this.addEditCategory = true;
    this.createCategorybool = false;
    this.inventoryService.createCategorybool = false;
  }

  cancel() {
    this.addEditCategory = false;
  }

  syncTreeViewSelection() {
    if (!this.treeView) { return; }

    if (!this.category.parentCategory) {
      this.treeView.instance.unselectAll();
    } else {
      this.treeView.instance.selectItem(this.category.parentCategory);
    }
  }

  getSelectedItemsKeys(items) {
    let result = [];
    const that = this;
    // let temp = 1;

    items.forEach((item) => {
      if (item.selected) {
        result.push(item.text);
        // temp = item.key;
      } if (item.items.length) {
        result = result.concat(that.getSelectedItemsKeys(item.items));
      }
    });
    return result;
  }

  getKeys(items) {
    let result = [];
    const that = this;
    // let temp = 1;

    items.forEach((item) => {
      if (item.selected) {
        result.push(item.key);
        // temp = item.key;
      }
      if (item.items.length) {
        result = result.concat(that.getKeys(item.items));
      }
    });
    return result;
  }

  TreeViewItemSelectionChanged(e) {
    let temp = '';
    const nodes = e.component.getNodes();
    this.treeBoxValue = this.getSelectedItemsKeys(nodes).join('');
    temp = this.getKeys(nodes).join('');
    this.category.parentCategory = parseInt(temp, 10);
  }
}
