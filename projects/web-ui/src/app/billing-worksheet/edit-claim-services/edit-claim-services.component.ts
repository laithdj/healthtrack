/* eslint-disable prefer-destructuring */
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { DxDataGridComponent, DxSelectBoxComponent, DxTooltipComponent } from 'devextreme-angular';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import {
  BillItemHealthFundFee,
  BillWorksheetItem,
  WorksheetClaimStatus,
} from '../../../../../../Generated/CoreAPIClient';
import { GotoPatientAndArea } from '../../../../../../Generated/HMS.Interfaces';
import { SetError, AppUiActionTypes, CloseError } from '../../app-store/app-ui-state.actions';
import { StompService } from '../../shared/stomp/stomp.service';
import {
  AddNewServiceSubmit,
  BillingWorksheetActionTypes,
  DeleteServiceSubmit,
  DeleteWorkSheetClaim,
  GetAllCompaniesFetch,
  GetItemsForBookingSubmit,
  GetItemsForBookingSubmitSuccess,
  SaveClaimSubmit,
  ServicesListFetch,
  UpdateHealthFundSubmit,
  UpdateHealthFundSubmitSuccess,
} from '../store/billing-worksheet.actions';
import { BillingWorksheetAppState } from '../store/billing-worksheet.reducers';
import {
  selectCompanies,
  selectServicesListForFeeTable,
  selectStatuses,
  selectWorksheetItemsByClaimId,
} from '../store/billing-worksheet.selectors';

@Component({
  selector: 'app-edit-claim-services',
  templateUrl: './edit-claim-services.component.html',
  styleUrls: ['./edit-claim-services.component.css'],
})
export class EditClaimServicesComponent implements OnInit, OnDestroy {
  private _destroyed$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('servicesGrid') servicesGrid: DxDataGridComponent;
  @ViewChild('tooltip') tooltip: DxTooltipComponent;
  @ViewChild('billTooltip') billTooltip: DxTooltipComponent;
  @ViewChild('companySelectBox') companySelectBox: DxSelectBoxComponent;

  @Output() popupClosed: EventEmitter<void> = new EventEmitter();

  worksheetItems: BillWorksheetItem[] = [];
  editWorksheetItems: BillWorksheetItem[];
  insidePopup = true;
  resultsText = 'No service found that match this search';
  serviceCode: string = undefined;
  worksheetItems$ = this.store.pipe(select(selectWorksheetItemsByClaimId));
  showAuditInfo = false;
  companies$ = this.store.pipe(select(selectCompanies));
  statuses$ = this.store.pipe(select(selectStatuses), map((statuses) => statuses
    .filter((a) => a.status !== WorksheetClaimStatus.Unknown)));
  claimStatusItems = [{ id: 'Not Specified', name: 'No Action' },
    { id: 'Automatic Email', name: 'Automatic Email' },
    { id: 'Email', name: 'Manual Email' },
    { id: 'Portal', name: 'Manual Capture In Portal' }];
  worksheetStatus = WorksheetClaimStatus;
  selectedClaimOption: string;
  message: boolean;
  servicesList$ = this.store.pipe(select(selectServicesListForFeeTable()));
  searchFields = ['itemNumDisp', 'healthFundCode'];
  refreshMessage: boolean;
  patientMessage: boolean;
  auditMessage: boolean;
  applyMessage: boolean;
  applyMessage2: boolean;
  companiesMessage = false;
  refreshFromSave = false;
  showRemoveServiceConfirm = false;
  serviceToRemoveId: number;
  showDeleteWorksheetConfirm = false;
  claimIdToDelete: number;
  showNoChargePatientConfirm = false;
  showNoChargeInsurerConfirm = false;
  showBothNoChargeConfirm = false;
  showPatientNoChargeInvoiceInsurer = false;
  showInsurerNoChargeInvoicePatient = false;
  invoiceToOptions = ['Insurer', 'Third Party', 'Patient Only'];
  invoiceToSelection = this.invoiceToOptions[0];
  selectedCompanyId: number;

  constructor(private route: ActivatedRoute,
    private store: Store<BillingWorksheetAppState>,
    private stompService: StompService,
    private actions$: Actions,
    private titleService: Title) { }

  ngOnInit() {
    this.worksheetItems$.pipe(takeUntil(this._destroyed$)).subscribe((wis) => {
      if (this.refreshFromSave === true || this.worksheetItems?.length === 0
        || this.worksheetItems[0].claimId !== wis[0]?.claimId) {
      this.worksheetItems = _.cloneDeep(wis);
      this.editWorksheetItems = _.cloneDeep(this.worksheetItems.filter((i) => i.serviceId));

      if (this.worksheetItems && this.worksheetItems.length > 0) {
        if (this.worksheetItems[0].claimSent) {
          this.selectedClaimOption = this.worksheetItems[0].method;
        } else {
            this.selectedClaimOption = this.claimStatusItems[0].id; // No Action
        }

          switch (this.worksheetItems[0].invoiceTo) {
            case 'H':
              this.invoiceToSelection = this.invoiceToOptions[0];
              break;
            case 'C':
              this.invoiceToSelection = this.invoiceToOptions[1];
              break;
            case 'P':
              this.invoiceToSelection = this.invoiceToOptions[2];
              break;
            default:
              this.invoiceToSelection = this.invoiceToOptions[0];
              this.worksheetItems[0].invoiceTo = 'H';
              break;
          }

        this.serviceCode = undefined;
          this.servicesList$ = this.store.pipe(select(
            selectServicesListForFeeTable(this.worksheetItems[0].feeTableId)));
        this.servicesList$.pipe(takeUntil(this._destroyed$)).subscribe((list) => {
          if (!list || list.length === 0) {
            this.store.dispatch(new ServicesListFetch(this.worksheetItems[0].feeTableId));
          }
        });
      }
      } else if (this.worksheetItems?.length > 0) {
        const item = this.worksheetItems[0];

        const cloneList = _.cloneDeep(wis);
        if (cloneList?.length > 0) {
          cloneList[0].serviceReason = item.serviceReason;
          cloneList[0].claimNotes = item.claimNotes;
          cloneList[0].status = item.status;
          cloneList[0].accRelated = item.accRelated;
          cloneList[0].claimSent = item.claimSent;
          cloneList[0].applicationNumber = item.applicationNumber;
          cloneList[0].insurerDefaultCover = item.insurerDefaultCover;
          cloneList[0].excess = item.excess;

          if (cloneList[0].status !== item.status) {
            this.statuses$.pipe(take(1)).subscribe((statuses) => {
              const idx = statuses.findIndex((a) => a.status === item.status);

              if (idx > -1) {
                cloneList[0].status = item.status;
                cloneList[0].statusDisplayName = statuses[idx].statusDisplayName;
              }
    });
          }
        }

        this.worksheetItems = cloneList;
        this.editWorksheetItems = _.cloneDeep(this.worksheetItems);
      }

      this.refreshFromSave = false;
    });

    this.route.params.subscribe((params) => {
      const bookingId = +params.bookingId;
      if (bookingId && bookingId > 0) {
        this.getItemsForBookingId(bookingId);
      } else {
        // if (this.worksheetItems && this.worksheetItems.length > 0) {
        //   console.log('fee table id', this.worksheetItems[0].feeTableId);
        //   this.servicesList$ = this.store.pipe(
        //     select(selectServicesListForFeeTable(this.worksheetItems[0].feeTableId)));
        //   this.servicesList$.pipe(takeUntil(this._destroyed$)).subscribe(list => {
        //     if (list && list.length > 0) {
        //     } else {
        //       this.store.dispatch(new ServicesListFetch(this.worksheetItems[0].feeTableId));
        //       // fetch services for fee table id
        //     }
        //   });
        // } else {
        //   this.servicesList$ = this.store.pipe(select(selectServicesListForFeeTable()));
        // }
      }
    });

    if (!this.insidePopup) {
      this.titleService.setTitle('Edit Billing Details');
  }
  }

  ngOnDestroy() {
    this._destroyed$.next(true);
    this._destroyed$.unsubscribe();
  }

  refreshCompaniesList() {
    this.store.dispatch(new GetAllCompaniesFetch());
  }

  toggleToolTip(e: any) {
    if (e.rowType === 'header' && e.columnIndex === 8) {
      this.message = true;
      this.tooltip.target = e.cellElement;
    } else {
      this.message = false;
    }
  }

  getItemsForBookingId(bookingId: number) {
    this.insidePopup = false;
    this.refreshCompaniesList();
    this.store.dispatch(new GetItemsForBookingSubmit(bookingId));
    this.actions$.pipe(ofType(BillingWorksheetActionTypes.GetItemsForBookingSubmitSuccess), take(1))
      .subscribe((action: GetItemsForBookingSubmitSuccess) => {
        this.servicesList$ = this.store.pipe(select(selectServicesListForFeeTable(action.payload[0].feeTableId)));
      });
  }

  onGoToPatient(patientID: number) {
    this.stompService.goToPatient(patientID, GotoPatientAndArea.Demographics);
  }

  updateHealthInsurer() {
    const { claimId } = this.worksheetItems[0];
    const { patientId } = this.worksheetItems[0];
    this.store.dispatch(new UpdateHealthFundSubmit({ claimId, patientId }));
    this.actions$.pipe(ofType(BillingWorksheetActionTypes.UpdateHealthFundSubmitSuccess), take(1))
      .subscribe((action: UpdateHealthFundSubmitSuccess) => {
        this.servicesList$ = this.store.pipe(select(selectServicesListForFeeTable(action.payload[0].feeTableId)));
        this.servicesList$.pipe(takeUntil(this._destroyed$)).subscribe((list) => {
          if (!list || list.length === 0) {
            this.store.dispatch(new ServicesListFetch(this.worksheetItems[0].feeTableId));
  }
        });
      });
  }

  onInvoiceToChanged() {
    this.worksheetItems[0].companyId = null;
    this.editWorksheetItems[0].companyId = null;
    const feeTableId = this.invoiceToSelection === this.invoiceToOptions[0]
      ? this.worksheetItems[0].feeTableId : 0;
    this.servicesList$ = this.store.pipe(select(selectServicesListForFeeTable(feeTableId)));

    // fetch services list from api is required
    this.servicesList$.pipe(takeUntil(this._destroyed$)).subscribe((list) => {
      if (!list || list.length === 0) {
        this.store.dispatch(new ServicesListFetch(feeTableId));
      }
    });

    if (this.invoiceToSelection === this.invoiceToOptions[0]) {
      // is insurer
      this.worksheetItems[0].invoiceTo = 'H';
      this.editWorksheetItems[0].invoiceTo = 'H';
      this.worksheetItems[0].companyId = null;
      this.editWorksheetItems[0].companyId = null;
    } else if (this.invoiceToSelection === this.invoiceToOptions[1]) {
      // is third party
      this.worksheetItems[0].invoiceTo = 'C';
      this.editWorksheetItems[0].invoiceTo = 'C';

      this.editWorksheetItems.forEach((item, index) => {
        this.setBillPracticeFee(index, true, true);
      });
    } else {
      // is patient
      this.worksheetItems[0].invoiceTo = 'P';
      this.editWorksheetItems[0].invoiceTo = 'P';
      this.worksheetItems[0].companyId = null;
      this.editWorksheetItems[0].companyId = null;

      this.editWorksheetItems.forEach((item, index) => {
        this.setBillPracticeFee(index, true, false);
      });
    }

    // update any existing services to use hi or practice fee as full fee, update cover % etc.
    if (this.editWorksheetItems.length === 1 && !this.editWorksheetItems[0].serviceId) {
      // do nothing
    } else if (this.invoiceToSelection === this.invoiceToOptions[0] && this.worksheetItems[0]?.feeTableId) {
      // is insurer, update all services to use insurer fee and codes
    } else {
      // is no insurer, update all services to use practice fees and codes
    }

    setTimeout(() => {
      this.worksheetItems[0].companyId = null;
    }, 150);

    setTimeout(() => {
      this.worksheetItems[0].companyId = null;
    }, 300);

    setTimeout(() => {
      this.worksheetItems[0].companyId = null;
    }, 450);
  }

  onClaimSent = () => {
    if (this.worksheetItems && this.worksheetItems[0] && this.worksheetItems[0].claimSent === false) {
      this.worksheetItems[0].claimSent = true;
    }
  }

  onClaimStatusChanged = (e: any) => {
    if (this.worksheetItems[0].claimSent === false) {
      if (e.value === 'Email' || e.value === 'Portal' || e.value === 'Automatic Email') {
        this.worksheetItems[0].claimSent = true;
        this.worksheetItems[0].method = e.value;
      }
    } else {
      if (e.value === 'Not Specified') {
        this.worksheetItems[0].claimSent = false;
      }
      this.worksheetItems[0].method = e.value;
    }
  }
  /*
  onClaimStatusChanged = (e: any) => {
    // 
      /*
      if (this.worksheetItems[0].claimSent === false) {
        if (e.value === 'Email' || e.value === 'Portal') {
          this.worksheetItems[0].claimSent = true;
          this.worksheetItems[0].calimStatus = e.value;
        }
      } else {
        if (e.value === 'Not Specified') {
          this.worksheetItems[0].claimSent = false;
        }
        this.worksheetItems[0].calimStatus = e.value;
      }
    }
*/

  addService = () => {
    if (this.serviceCode && this.serviceCode.trim().length > 0) {
      const claim: number = this.worksheetItems[0]?.claimId;
      const feeTable: number = this.invoiceToSelection === this.invoiceToOptions[0]
        ? this.worksheetItems[0]?.feeTableId : 0;
      this.servicesGrid.instance.beginCustomLoading('Loading');
      const saveServiceCode = this.serviceCode;

      this.onSaveClicked();

      let coverPercent: number;
      switch (this.invoiceToSelection) {
        case this.invoiceToOptions[0]:
          coverPercent = this.worksheetItems[0].insurerDefaultCover;
          break;
        case this.invoiceToOptions[1]:
          coverPercent = 1;
          break;
        case this.invoiceToOptions[2]:
          coverPercent = 0;
          break;
        default:
          break;
      }

      this.actions$.pipe(ofType(BillingWorksheetActionTypes.SaveClaimSubmitSuccess), take(1)).subscribe(() => {
      this.store.dispatch(new AddNewServiceSubmit({
          serviceCode: saveServiceCode,
        claimId: claim,
        feeTableId: feeTable,
          coverPercentage: coverPercent,
      }));
      this.serviceCode = undefined;
      this.actions$.pipe(ofType(BillingWorksheetActionTypes.AddNewServiceSubmitSuccess,
        AppUiActionTypes.SetError), take(1)).subscribe(() => this.servicesGrid.instance.endCustomLoading());
      });
    } else {
      this.store.dispatch(new SetError({
        errorMessages: ['Please select one of the options from the Service dropdown'],
      }));
    }
  }

  focusOnItem(e: any) {
    this.actions$.pipe(ofType(AppUiActionTypes.CloseError), takeUntil(this._destroyed$))
      .subscribe((action: CloseError) => {
        if (action.payload) {
          setTimeout(() => {
            e.component.focus();
          }, 500);
        }
      });
  }

  onRemoveService(data: any) {
    if (data?.value > 0) {
      this.showRemoveServiceConfirm = true;
      this.serviceToRemoveId = data.value;
    }
  }

  confirmRemoveService() {
    if (this.serviceToRemoveId) {
      this.onSaveClicked();

      this.actions$.pipe(ofType(BillingWorksheetActionTypes.SaveClaimSubmitSuccess), take(1)).subscribe(() => {
        this.store.dispatch(new DeleteServiceSubmit({
          claimId: this.worksheetItems[0].claimId,
          serviceId: this.serviceToRemoveId,
        }));

      const idx = this.editWorksheetItems.findIndex((b) => b.serviceId === this.serviceToRemoveId);
          this.editWorksheetItems.splice(idx, 1);
      this.showRemoveServiceConfirm = false;
      });
        }
    }

  deleteWorkSheet(worksheet: BillWorksheetItem) {
    this.showDeleteWorksheetConfirm = true;
    this.claimIdToDelete = worksheet.claimId;
  }

  confirmDeleteWorksheet() {
    if (this.claimIdToDelete) {
      this.store.dispatch(new DeleteWorkSheetClaim(this.claimIdToDelete));
      this.showDeleteWorksheetConfirm = false;
        this.onCancelClicked();
      }
  }

  onZeroOverride(e: any, data: any) {
    const selectedItem = data?.data as BillWorksheetItem;
    const index = this.editWorksheetItems.findIndex((item) => item.serviceId === selectedItem.serviceId);
    this.editWorksheetItems[index].coPaymentOverride = 0;
  }

  onExcessChanged() {
    if (this.editWorksheetItems.some((a) => a.cover === null || a.cover === undefined || a.cover < 0)) {
      this.store.dispatch(new SetError({ errorMessages: ['Cover % is required for all Services'] }));
    } else if (this.worksheetItems[0].excess || this.worksheetItems[0].excess === 0) {
      let totalDue = 0;
      this.editWorksheetItems.forEach((item) => {
        const coverFee = Math.round(((item.fullFee * item.cover) * 100)) / 100;
        if (coverFee && (item.coPayment || item.coPayment === 0)) {
          totalDue += item.fullFee;
        }
      });

      if (this.worksheetItems[0].excess > totalDue) {
        this.worksheetItems[0].excess = totalDue;
      }

      this.applyExcessToServices();
    } else {
      // excess is null, clear all overrides
      this.editWorksheetItems.forEach((item) => {
        item.coPaymentOverride = null;
      });
    }
  }

  onExcessValueChanged(e: any) {
    if (e?.value === null) {
      this.editWorksheetItems.forEach((item) => {
        item.coPaymentOverride = null;
        // recalculate cover fee
        item.coverFee = Math.round(((item.fullFee * item.cover) * 100)) / 100;
        item.coPayment = item.fullFee - item.coverFee;
      });

      this.servicesGrid.instance.saveEditData();
    }
  }

  applyExcessToServices() {
    let excess = this.worksheetItems[0].excess;

    this.editWorksheetItems.forEach((item) => {
      if (excess > 0) {
        const excessBefore = excess;
        const coverFee = Math.round(((item.fullFee * item.cover) * 100)) / 100;

        if (coverFee) {
        excess -= item.fullFee;

        if (excess < 0) {
          excess = 0;
          item.coPaymentOverride = excessBefore;
          item.coverFee = item.fullFee - item.coPaymentOverride;
        } else {
          item.coPaymentOverride = item.fullFee;
          item.coverFee = 0;
        }
      } else {
        item.coPaymentOverride = 0;
      }
      } else if (excess === 0) {
        item.coPaymentOverride = 0;
      } else if (excess === null || excess === undefined ) {
        item.coPaymentOverride = null;
      }
    });

    this.servicesGrid.instance.saveEditData();
  }

  onInsurerDefaultCoverChanged() {
    if (this.worksheetItems[0].insurerDefaultCover || this.worksheetItems[0].insurerDefaultCover === 0) {
      this.editWorksheetItems.forEach((item) => {
        if (item.fullFee) {
        item.cover = this.worksheetItems[0].insurerDefaultCover;
        item.coverFee = Math.round(((item.fullFee * item.cover) * 100)) / 100;
        const copay = item.fullFee - item.coverFee;
        item.coPayment = (copay < 0) ? 0 : copay;
        } else {
          item.coverFee = 0;
          item.cover = 0;
          item.coPayment = 0;
        }
      });
    } else {
      // apply clear cover
      this.editWorksheetItems.forEach((item) => {
        if (item.fullFee === 0) {
          item.cover = 0;
          item.coPayment = 0;
          item.coverFee = 0;
        } else {
          item.cover = null;
          item.coPayment = null;
          item.coverFee = null;
        }
      });
    }

      this.servicesGrid.instance.saveEditData();
  }

  onBillPracticeFeeChanged(e: any, data: any) {
    data.setValue(e.value);
    const index = this.editWorksheetItems.findIndex((b) => b.serviceId === data?.data?.serviceId);

    this.setBillPracticeFee(index, e.value);
  }

  setBillPracticeFee(index: number, pfFee: boolean, billToCompany: boolean = false) {
    this.editWorksheetItems[index].billPracticeFee = pfFee;

    // find the fee in services list
    this.servicesList$.pipe(take(1)).subscribe((services) => {
      if (services && services.length > 0) {
        // eslint-disable-next-line max-len
        const serviceIdx = services[0].billItems.findIndex((a: BillItemHealthFundFee) => a.itemNumDisp === this.editWorksheetItems[index].serviceCode);

        if (serviceIdx > -1) {
          const service = services[0].billItems[serviceIdx];
          let fullFee = 0;

          if (this.editWorksheetItems[index]?.billPracticeFee === true) {
            fullFee = service.practiceFee ? service.practiceFee : 0;
    } else {
            fullFee = service.fullFee ? service.fullFee : 0;
            if (fullFee === 0) {
              // if hi fee is 0, use practice fee instead
              fullFee = service.practiceFee ? service.practiceFee : 0;
    }
          }

          this.editWorksheetItems[index].fullFee = fullFee;
          this.editWorksheetItems[index].cover = billToCompany && fullFee > 0 ? 1 : 0;
          this.editWorksheetItems[index].coverFee = billToCompany && fullFee > 0 ? fullFee : 0;
          this.editWorksheetItems[index].coPayment = billToCompany && fullFee > 0 ? 0 : fullFee;
          this.editWorksheetItems[index].coPaymentOverride = null;
  }
      } else {
        this.store.dispatch(new ServicesListFetch(this.worksheetItems[0].feeTableId));

        this.actions$.pipe(ofType(BillingWorksheetActionTypes.ServicesListFetchSuccess), take(1))
          .subscribe(() => {
            setTimeout(() => {
              this.setBillPracticeFee(index, pfFee, billToCompany);
            }, 500);
          });
        }
    });

    this.servicesGrid.instance.saveEditData();
  }

  onCoverChanged(e: any, data: any) {
    data.setValue(e.value);
    const index = this.editWorksheetItems.findIndex((b) => b.serviceId === data?.data?.serviceId);
    this.editWorksheetItems[index].cover = e.value;
    this.editWorksheetItems[index].coverFee = Math.round((
      (this.editWorksheetItems[index].fullFee * e.value) * 100)) / 100;
    const copay = this.editWorksheetItems[index].fullFee - this.editWorksheetItems[index].coverFee;
    this.editWorksheetItems[index].coPayment = (copay < 0) ? 0 : copay;
    this.servicesGrid.instance.saveEditData();
  }

  onOverrideChanged(e: any, data: any) {
    const index = this.editWorksheetItems.findIndex((b) => b.serviceId === data?.data?.serviceId);
    // if the override is lager than the full fee, set it to the full fee amount
    // it cannot exceed the full fee amount
    if (e.value > this.editWorksheetItems[index].fullFee) {
      this.editWorksheetItems[index].coPaymentOverride = this.editWorksheetItems[index].fullFee;
    } else {
    this.editWorksheetItems[index].coPaymentOverride = e.value;
  }

    // if the override is larger than the co payment amount, adjust the cover fee
    if (this.editWorksheetItems[index].coPaymentOverride > this.editWorksheetItems[index].coPayment) {
      // eslint-disable-next-line max-len
      this.editWorksheetItems[index].coverFee = this.editWorksheetItems[index].fullFee - this.editWorksheetItems[index].coPaymentOverride;
    }

    // eslint-disable-next-line max-len
    if (!this.editWorksheetItems[index].coPaymentOverride || this.editWorksheetItems[index].coPaymentOverride + this.editWorksheetItems[index].coverFee !== this.editWorksheetItems[index].fullFee) {
      // recalculate cover fee using percentage
      this.editWorksheetItems[index].coverFee = Math.round((
        (this.editWorksheetItems[index].fullFee * this.editWorksheetItems[index].cover) * 100)) / 100;
      // eslint-disable-next-line max-len
      this.editWorksheetItems[index].coPayment = this.editWorksheetItems[index].fullFee - this.editWorksheetItems[index].coverFee;
    }
  }

  onRowPrepared(e: any) {
    if (e.data && e.data.coPaymentOverride > e.data.coPayment && e?.cells[5]?.cellElement?.classList) {
      e.cells[5].cellElement.classList.add('percent-invalid');
    }
  }

  goToInvoice(type: string) {
    this.servicesGrid.instance.saveEditData();

    let patientTotal = 0;
    this.editWorksheetItems.forEach((item) => {
      if (item.coPaymentOverride || item.coPaymentOverride === 0) {
        patientTotal += item.coPaymentOverride;
      } else {
        patientTotal += item.coPayment;
  }
    });

    let hiTotal = 0;
    this.editWorksheetItems.forEach((item) => {
      hiTotal += item.coverFee;
    });

    if (type === 'P' && (patientTotal === 0 || patientTotal < 0)) {
      this.showNoChargePatientConfirm = true;
    } else if (type === 'H' && (hiTotal === 0 || hiTotal < 0)) {
      this.showNoChargeInsurerConfirm = true;
    } else if (type === 'B' && (patientTotal === 0 || patientTotal < 0) && (hiTotal === 0 || hiTotal < 0)) {
      // both are no charge
      this.showBothNoChargeConfirm = true;
    } else if (type === 'B' && (patientTotal === 0 || patientTotal < 0)) {
      // do something for patient no charge when invoicing both
      this.showPatientNoChargeInvoiceInsurer = true;
    } else if (type === 'B' && (hiTotal === 0 || hiTotal < 0)) {
      // do something for no charge insurer when invoicing both
      this.showInsurerNoChargeInvoicePatient = true;
    } else {
      this.onSaveClicked(false, false, false);
      this.actions$.pipe(ofType(BillingWorksheetActionTypes.SaveClaimSubmitSuccess), take(1))
        .subscribe(() => {
          const { claimId } = this.worksheetItems[0];
          this.stompService.goToInvoice(claimId, type);
        });
    }
  }

  confirmNoChargePatient() {
    this.onSaveClicked(false, true, false);
    this.showNoChargePatientConfirm = false;
  }

  confirmNoChargeInsurer() {
    this.onSaveClicked(false, false, true);
    this.showNoChargeInsurerConfirm = false;
  }

  confirmNoChargeBoth() {
    this.worksheetItems[0].status = WorksheetClaimStatus.Complete;
    this.onSaveClicked(false, true, true);
    this.showBothNoChargeConfirm = false;
  }

  confirmNoChargeInsurerChargePatient() {
    this.onSaveClicked(false, false, true);
    this.showInsurerNoChargeInvoicePatient = false;
    this.actions$.pipe(ofType(BillingWorksheetActionTypes.SaveClaimSubmitSuccess), take(1))
      .subscribe(() => {
        const { claimId } = this.worksheetItems[0];
        this.stompService.goToInvoice(claimId, 'P');
      });
  }

  confirmNoChargePatientChargeInsurer() {
    this.onSaveClicked(false, true, false);
    this.showPatientNoChargeInvoiceInsurer = false;
    this.actions$.pipe(ofType(BillingWorksheetActionTypes.SaveClaimSubmitSuccess), take(1))
      .subscribe(() => {
        const { claimId } = this.worksheetItems[0];
        this.stompService.goToInvoice(claimId, 'H');
      });
  }

  viewInvoice(type: string) {
    this.stompService.viewInvoice(this.worksheetItems[0].claimId, type);
  }

  undoChanges() {
    this.serviceCode = undefined;
    this.servicesGrid.instance.cancelEditData();
    this.editWorksheetItems = _.cloneDeep(this.worksheetItems.filter((i) => i.serviceId));
  }

  onSaveClicked(printForm: boolean = false, patientNoCharge: boolean = false,
    insurerNoCharge: boolean = false) {
    this.servicesGrid.instance.saveEditData();

    this.refreshFromSave = true;
    if (this.worksheetItems.length > 0 && this.editWorksheetItems.length > 0) {
      for (let index = 0; index < this.editWorksheetItems.length; index++) {
        const item = _.cloneDeep(this.editWorksheetItems[index]);
        item.applicationNumber = this.worksheetItems[0].applicationNumber;
        item.status = this.worksheetItems[0].status;
        item.method = this.worksheetItems[0].method;
        item.claimSent = this.worksheetItems[0].claimSent;
        item.claimNotes = this.worksheetItems[0].claimNotes;
        item.serviceReason = this.worksheetItems[0].serviceReason;
        item.accRelated = this.worksheetItems[0].accRelated;
        item.excess = this.worksheetItems[0].excess;
        item.insurerDefaultCover = this.worksheetItems[0].insurerDefaultCover;
        item.companyId = this.worksheetItems[0].companyId;

        switch (this.invoiceToSelection) {
          case this.invoiceToOptions[0]:
            item.invoiceTo = 'H';
            break;
          case this.invoiceToOptions[1]:
            item.invoiceTo = 'C';
            break;
          case this.invoiceToOptions[2]:
            item.invoiceTo = 'P';
            break;
          default:
            item.invoiceTo = 'H';
            break;
        }

        this.editWorksheetItems[index] = item;
      }

      this.store.dispatch(new SaveClaimSubmit({
        items: this.editWorksheetItems,
        process: false,
        setPatientNoCharge: patientNoCharge,
        setInsurerNoCharge: insurerNoCharge,
      }));
    } else {
      const ws: BillWorksheetItem[] = [];
      ws.push(this.worksheetItems[0]);
      this.store.dispatch(new SaveClaimSubmit({
        items: ws,
        process: false,
        setPatientNoCharge: patientNoCharge,
        setInsurerNoCharge: insurerNoCharge,
      }));
    }

    if (printForm === true) {
      this.actions$.pipe(ofType(BillingWorksheetActionTypes.SaveClaimSubmitSuccess), take(1))
        .subscribe(() => {
          const { claimId } = this.worksheetItems[0];
          this.stompService.printPriorApprovalForm(claimId);
        });
  }
  }

  onCancelClicked() {
    this.popupClosed.emit();
    setTimeout(() => {
      this.undoChanges();
    }, 100);
  }

  allServicesAreValid(): boolean {
    return this.editWorksheetItems.every(
      (a) => a.cover != null); // .some(item => item.cover != null && !(item.cover < 0));
  }

  openAudit() {
    this.showAuditInfo = true;
  }

  getSaveAsText(): string {
    switch (this.worksheetItems[0].status) {
      case WorksheetClaimStatus.Booking:
        return 'Save As Coded';
      case WorksheetClaimStatus.Coded:
        return 'Save As Waiting';
      case WorksheetClaimStatus.Waiting:
        return 'Save As Pending Invoice: Patient';
      case WorksheetClaimStatus.PendingPatientInvoice:
        return 'Save As Pending Invoice: Insurer';
      case WorksheetClaimStatus.PendingHealthInsurerInvoice:
        return 'Save As Complete';
      case WorksheetClaimStatus.Complete:
        return 'Save As Complete';
      default:
        return 'Save';
    }
  }

  saveAndProcess() {
    switch (this.worksheetItems[0].status) {
      case WorksheetClaimStatus.Booking:
        if (this.editWorksheetItems && this.editWorksheetItems.length > 0) {
          this.worksheetItems[0].status = WorksheetClaimStatus.Coded;
          if (this.worksheetItems[0].insurerDefaultMethod === 'Email' && (this.selectedClaimOption === 'Automatic Email'
            || this.selectedClaimOption === 'Not Specified')) {
            this.worksheetItems[0].method = 'Automatic Email';
            this.worksheetItems[0].claimSent = true;
          }
          this.onSaveClicked();
        } else {
          this.store.dispatch(new SetError({
            errorMessages: ['Unable to change status to Coded.<br><br>The claim has no services.'],
          }));
        }
        break;
      case WorksheetClaimStatus.Coded:
        if (this.worksheetItems[0].claimSent === true && (this.worksheetItems[0].method === 'Portal'
          || this.worksheetItems[0].method === 'Email' || this.worksheetItems[0].method === 'Automatic Email')) {
          this.worksheetItems[0].status = WorksheetClaimStatus.Waiting;
          this.onSaveClicked();
        } else {
          this.store.dispatch(new SetError({
            errorMessages: [
              'Unable to change status to Waiting.<br><br>The claim must be submitted via Email or Portal.'],
          }));
        }
        break;
      case WorksheetClaimStatus.Waiting:
        if (this.allServicesAreValid() === true) {
          this.worksheetItems[0].status = WorksheetClaimStatus.PendingPatientInvoice;
          this.onSaveClicked();
        } else {
          this.store.dispatch(new SetError({
            errorMessages: ['Unable to change status to Pending Invoice: Patient.<br>'
              + '<br>The Cover % for each service must be completed.'],
          }));
        }
        break;
      case WorksheetClaimStatus.PendingPatientInvoice:
        if (this.worksheetItems[0].patientNoCharge || (this.worksheetItems[0].invoiceNo_Patient
          && this.worksheetItems[0].invoiceNo_Patient > 0)) {
          this.worksheetItems[0].status = WorksheetClaimStatus.PendingHealthInsurerInvoice;
          this.onSaveClicked();
        } else {
          this.store.dispatch(new SetError({
            errorMessages: [
              'Unable to change status to Pending Invoice: Insurer.<br><br>The Patient must be Invoiced.'],
          }));
        }
        break;
      case WorksheetClaimStatus.PendingHealthInsurerInvoice:
        if ((this.worksheetItems[0].patientNoCharge || (this.worksheetItems[0].invoiceNo_Patient
          && this.worksheetItems[0].invoiceNo_Patient > 0)) && (this.worksheetItems[0].insurerNoCharge
          || (this.worksheetItems[0].invoiceNo_HealthInsurer && this.worksheetItems[0].invoiceNo_HealthInsurer > 0))) {
          this.worksheetItems[0].status = WorksheetClaimStatus.Complete;
          this.onSaveClicked();
        } else {
          this.store.dispatch(new SetError({
            errorMessages: [
              'Unable to change status to Complete.<br><br>The Patient AND Insurer must be Invoiced.'],
          }));
        }
        break;
      case WorksheetClaimStatus.Complete:
        this.worksheetItems[0].status = WorksheetClaimStatus.Complete;
        this.onSaveClicked();
        break;
      default:
        break;
    }
  }

  toggleRefresh(show: boolean) {
    this.refreshMessage = show;
  }

  togglePatientTip(show: boolean) {
    this.patientMessage = show;
  }

  toggleAuditTip(show: boolean) {
    this.auditMessage = show;
  }

  toggleApplyMessage(show: boolean) {
    this.applyMessage = show;
  }

  toggleApplyMessage2(show: boolean) {
    this.applyMessage2 = show;
  }

  toggleRefreshCompanies(show: boolean) {
    this.companiesMessage = show;
  }

  onPrintFormClicked() {
    this.onSaveClicked(true);
}
}
