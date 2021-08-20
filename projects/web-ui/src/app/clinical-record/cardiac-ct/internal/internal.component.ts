import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ClinicalRecordAppState } from '../../store/clinical-record.reducers';
import { selectShowReportBeside } from '../../store/clinical-record.selectors';
import { CardiacCTInternalNotesChanged } from '../store/cardiac-ct.actions';
import { selectCardiacCTTechnicianNotes } from '../store/cardiac-ct.selectors';

@Component({
  selector: 'app-internal',
  templateUrl: './internal.component.html',
  styleUrls: ['./internal.component.css']
})
export class InternalComponent implements OnInit {
  showReportBeside$ = this.store.pipe(select(selectShowReportBeside));
  notes$ = this.store.pipe(select(selectCardiacCTTechnicianNotes));

  constructor(private store: Store<ClinicalRecordAppState>) { }

  ngOnInit() { }

  onNotesChanged(e: any) {
    if (e && e.value) {
      this.store.dispatch(new CardiacCTInternalNotesChanged(e.value));
    }
  }
}
