import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupsClient, ItemFeesClient, GroupDO, FeeItemNumber, APIResponseOfFeeItemNumberOf } from '../../../../../../Generated/CoreAPIClient';
import { map } from 'rxjs/operators';

@Injectable()
export class ListsService {
    constructor(private billGroupClient: GroupsClient,
    private itemFeesClient: ItemFeesClient) {
  }
  getItemNumbers(catId: string) {
    return this.getItemFees(catId);
  }
  getBillGroups(): Observable<GroupDO[]> {
    return this.billGroupClient.getGroups();
  }

  private getItemFees(catId: string): Observable<FeeItemNumber[]> {
    return this.itemFeesClient.getCategoryItemNumbers(catId)
    .pipe(map((response: APIResponseOfFeeItemNumberOf) => {
      return response.data;
    }));
  }
}

export class FeeCategory {
  ID: string;
  Name: string;
  Description: string;
}

export class StayType {
  ID: string;
  Name: string;
}

export class EffectiveFromOption {
  ID: string;
  Name: string;
}
