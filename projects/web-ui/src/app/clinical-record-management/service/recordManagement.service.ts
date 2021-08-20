import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { RecordClassificationState } from '../store/classification.reducers';
import { ReplaceClassifications, PopulateUserGroups, PopulateBillingGroups } from '../store/classification.actions';

import { RecordClassificationsClient, APIResponseOfIEnumerableOfRecordClassification, RecordClassification,
  APIResponseOfRecordClassificationOf, APIResponseOfIEnumerableOfString } from '../../../../../../Generated/CoreAPIClient';

@Injectable()
export class RecordManagementService {

  constructor(private classificationsClient: RecordClassificationsClient,
    private store: Store<RecordClassificationState>) {
    this.refreshClassificationsStore();
    this.getGroupUsers();
    this.getBillingGroups();
  }

  refreshClassificationsStore() {
    this.classificationsClient.getRecordClassifications()
    .subscribe((response: APIResponseOfIEnumerableOfRecordClassification) => {
      this.store.dispatch(new ReplaceClassifications(response.data));
    });
  }

  updateClassifications(classifications: RecordClassification[]) {
    this.classificationsClient.updateRecordClassifications(classifications)
      .subscribe((response: APIResponseOfRecordClassificationOf) => {
         this.store.dispatch(new ReplaceClassifications(response.data));
      });
  }

  getGroupUsers() {
    this.classificationsClient.getGroupUsers().subscribe(
      (response: APIResponseOfIEnumerableOfString) => {
        this.store.dispatch(new PopulateUserGroups(response.data));
      });
  }

  getBillingGroups() {
    this.classificationsClient.getBillingGroups().subscribe(
      (response: APIResponseOfIEnumerableOfString) => {
        this.store.dispatch(new PopulateBillingGroups(response.data));
      });
  }
}
