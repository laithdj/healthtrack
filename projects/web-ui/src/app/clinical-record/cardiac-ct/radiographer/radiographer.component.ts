import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import {
  ListClient,
  ListItemDefinition,
  GetAllListItems,
  ListToQuery,
  NormalisedResultsType,
} from '../../../../../../../Generated/CoreAPIClient';
import { selectShowReportBeside } from '../../store/clinical-record.selectors';
import { CardiacCTAppState } from '../store/cardiac-ct.reducers';
import {
  selectCardiacCTHospitalLocation,
  selectCardiacCTLocations,
  selectCardiacCTScannerList,
  selectCardiacCTNormalisedResults,
} from '../store/cardiac-ct.selectors';
import { CardiacCTHospitalSiteChange, CardiacCTUpdateNormalisedResult } from '../store/cardiac-ct.actions';

@Component({
  selector: 'app-radiographer',
  templateUrl: './radiographer.component.html',
  styleUrls: ['./radiographer.component.css'],
})
export class RadiographerComponent implements OnInit {
  hospitalLocations$ = this.store.pipe(select(selectCardiacCTLocations));
  scannerModels$ = this.store.pipe(select(selectCardiacCTScannerList));
  showReportBeside$ = this.store.pipe(select(selectShowReportBeside));
  calciumOptions = [
    { id: 1, name: 'Low dose modified Ca score' },
    { id: 2, name: 'Conventional Ca score' }];
  scanOptions = [
    { id: 1, name: 'Wide Volume' },
    { id: 2, name: 'Step & Shoot' },
    { id: 3, name: 'Turboflash' },
    { id: 4, name: 'Helical' }];
  cardiacRhythmOptions = [{ id: 1, name: 'SR' }, { id: 2, name: 'AF' }];
  hospitalSite: ListItemDefinition[] = [];
  scannerModel: ListItemDefinition[] = [];
  list: GetAllListItems = new GetAllListItems();
  listEnum = ListToQuery;
  selectedLocation$ = this.store.pipe(select(selectCardiacCTHospitalLocation));
  normalisedResults$ = this.store.pipe(select(selectCardiacCTNormalisedResults));

  constructor(private listClient: ListClient, private store: Store<CardiacCTAppState>) { }

  ngOnInit() {
  }

  onHospitalSiteChanged(e: any) {
    this.store.dispatch(new CardiacCTHospitalSiteChange(e.value));
  }

  updateTotalDLP() {
    this.normalisedResults$.pipe(take(1)).subscribe(
      (results) => {
        const result1 = results?.find((a) => a.hmsReferenceId === 17064)
          ? results?.find((a) => a.hmsReferenceId === 17064).result : 0;
        const result2 = results?.find((a) => a.hmsReferenceId === 17068)
          ? results?.find((a) => a.hmsReferenceId === 17068).result : 0;

        this.store.dispatch(new CardiacCTUpdateNormalisedResult({
          result: result1 + result2,
          referenceId: 17069,
          resultType: NormalisedResultsType.Number,
        }));
      });
  }
}
