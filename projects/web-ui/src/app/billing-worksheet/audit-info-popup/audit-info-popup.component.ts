import {
  Component, Input, Output, EventEmitter, OnInit, OnDestroy,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BillWorksheetAuditInfo, BillWorksheetClient } from '../../../../../../Generated/CoreAPIClient';
import { BillingWorksheetAppState } from '../store/billing-worksheet.reducers';
import { SetError } from '../../app-store/app-ui-state.actions';
import { selectSelectedClaimId } from '../store/billing-worksheet.selectors';
import { DateTimeHelperService } from '../../shared/helpers/date-time-helper.service';

@Component({
  selector: 'app-audit-info-popup',
  templateUrl: './audit-info-popup.component.html',
  styleUrls: ['./audit-info-popup.component.css'],
})
export class AuditInfoPopupComponent implements OnInit, OnDestroy {
  private _showPopup = false;
  private _billWorksheetAuditInfo = new Subject<BillWorksheetAuditInfo>();
  private _destroyed$ = new Subject<void>();

  @Input() set showPopup(show: boolean) {
    this._showPopup = show;
    if (show === true) {
      this.fetchAuditInfoForClaim(this.selectedClaimId);
    }
  }
  get showPopup(): boolean { return this._showPopup; }

  @Output() popupClosed: EventEmitter<void> = new EventEmitter();

  selectedClaimId: number;
  billWorksheetAuditInfo$ = this._billWorksheetAuditInfo.asObservable();
  selectedClaimId$ = this.store.pipe(select(selectSelectedClaimId));
  dateCreated: Date;
  timeout = null;

  constructor(private billWorksheetClient: BillWorksheetClient,
    private store: Store<BillingWorksheetAppState>,
    private dateService: DateTimeHelperService) { }

  ngOnInit() {
    this.selectedClaimId$.pipe(takeUntil(this._destroyed$)).subscribe((id: number) => {
      this.selectedClaimId = id;
    });
  }

  ngOnDestroy() {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  onPopupHiding() {
    this.popupClosed.emit();
  }

  fetchAuditInfoForClaim(claimId: number) {
    // block multiple request within short time period to stop multiple selection from data grid
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;

      this.billWorksheetClient.getAuditInfoForClaim(claimId).subscribe((result) => {
        if (result.errorMessage && result.errorMessage.trim().length > 0) {
          this.store.dispatch(new SetError({ errorMessages: [result.errorMessage] }));
        } else {
          this._billWorksheetAuditInfo.next(result.data);
          this.dateCreated = this.dateService.getDate(result.data.dateCreated);
        }
      });
    } else {
      this.timeout = setTimeout(() => { this.timeout = null; }, 400);
    }
  }
}
