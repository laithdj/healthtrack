import { OnInit, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CompanyClient, CompanyDO, APIResponseOfCompanyDOOf } from '../../../../../../Generated/CoreAPIClient';

@Injectable()
export class CompaniesService implements OnInit {
  private _companies: CompanyDO[] = [];
  private selectedCompany: CompanyDO;
  companyApi: string;

  constructor(private companyClient: CompanyClient) {}
  ngOnInit(): void {

  }
  public get currentCompany(): CompanyDO {
    return this.selectedCompany;
  }
  get companies(): Observable<CompanyDO[]> {
    return this.companyClient.getHealthFunds().pipe(map((companies: APIResponseOfCompanyDOOf) => {
        return companies.data;
    }));
   }
  selectCompany(company: CompanyDO) {
    this.selectedCompany = company;
  }
}
