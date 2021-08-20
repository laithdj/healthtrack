import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RosterService } from '../../roster.service';
import { RosterBookingDO } from '../../../../../../../Generated/CoreAPIClient';
import { addMinutes, addHours } from 'date-fns';
import { Title } from '@angular/platform-browser';
import { alert } from 'devextreme/ui/dialog';
import { Store, select } from '@ngrx/store';
import { AppState } from '../../../app-store/reducers';
import { take } from 'rxjs/operators';
import { selectUserName } from '../../../app-store/app-ui.selectors';
import { DxCheckBoxComponent } from 'devextreme-angular';
import * as moment from 'moment';


@Component({
  selector: 'app-split-roster',
  templateUrl: './split-roster.component.html',
  styleUrls: ['./split-roster.component.css']
})
export class SplitRosterComponent implements OnInit {
  @ViewChild('push_box') push_box: DxCheckBoxComponent;
  duration = 30;
  roster: RosterBookingDO = new RosterBookingDO();
  roster_id: number;
  user: string;
  validation = false;
  doctor_array: string[] = new Array();
  new_array: string[] = new Array();
  part1_duration: string;
  part2_duration: string;
  startBreak = new Date();
  endBreak = new Date();
  startBreak_outcome: Date;
  start_break_display: Date;
  endBreak_outcome: Date;
  temp_endTime = new Date();
  temp_startTime: Date;
  temp_roster: RosterBookingDO = new RosterBookingDO();
  finish_time : Date;

  push_back_time = false;
  roster_outcome: RosterBookingDO = new RosterBookingDO();
  constructor(private route: ActivatedRoute, private rosterService: RosterService,
    private titleService: Title, private store: Store<AppState>) {
    this.titleService.setTitle('Split Staff Roster');
    this.store.pipe(take(1), select(selectUserName)).subscribe((uName: string) => this.user = uName);
    this.route.params.subscribe(params => {
      // unary operator + parse string from url param to number
      const rosterId = +params['rosterId'];
      if (rosterId) {
        this.getRoster(rosterId);
        this.roster_id = rosterId;
      }
    });
  }

  ngOnInit() {
  }

  getRoster(rosterID: number) {
    this.rosterService.getRoster(rosterID).subscribe(response => {
      this.roster = response.data;
      this.startBreak = new Date();
      this.startBreak = new Date(this.nearestMinutes(30, moment()).format()); // round to the nearest 30 minutes
      this.startBreak.setDate(this.roster.startTime.getDate());
      this.startBreak.setMonth(this.roster.startTime.getMonth());
      this.startBreak.setFullYear(this.roster.startTime.getFullYear());
      // tslint:disable-next-line: no-bitwise
      const m = (((this.startBreak.getMinutes() + 7.5) / 30 | 0) * 30) % 60;
      // tslint:disable-next-line: no-bitwise
      const h = ((((this.startBreak.getMinutes() / 105) + .5) | 0) + this.startBreak.getHours()) % 24;
      this.doctor_array.push(this.roster.doctor);
      this.new_array = this.doctor_array.concat(this.roster.staff);
      if (this.new_array[1] === undefined) {
        this.new_array.pop();
      }
      this.roster.staff = this.new_array;
      console.log(this.startBreak);
    });
  }

  nearestMinutes(interval, someMoment){
    const roundedMinutes = Math.round(someMoment.clone().minute() / interval) * interval;
    return someMoment.clone().minute(roundedMinutes).second(0);
  }

  splitRoster() {
    let errorString = '';
    const time_diff = Math.abs(this.roster.endTime.getTime() - this.startBreak.getTime()) / 36e5;
    if (time_diff > 24) {
      this.startBreak = addHours(this.startBreak, 24);
    }
    this.endBreak = addMinutes(this.startBreak, this.duration);
    if (this.startBreak < this.roster.startTime) {
      errorString = 'Break can not start before the shift.';
    }

    if (this.endBreak > this.roster.endTime) {
      errorString = 'Break exceeds shift.';
    }
    if (errorString === '') {
      this.finish_time = new Date();
      this.finish_time.setDate(this.roster.startTime.getDate());
      this.finish_time.setMonth(this.roster.startTime.getMonth());
      this.finish_time.setFullYear(this.roster.startTime.getFullYear());
      this.finish_time.setHours(this.roster.endTime.getHours(), this.roster.endTime.getMinutes()
      , this.roster.endTime.getSeconds(), this.roster.endTime.getMilliseconds());

      this.validation = true;
      this.roster_outcome = this.roster;
      this.endBreak_outcome = this.endBreak;
      this.startBreak_outcome = this.startBreak;
      this.start_break_display = this.startBreak;
      this.startBreak_outcome = addMinutes(this.startBreak, this.duration);
      console.log(this.startBreak);
      this.roster.startTime = new Date(this.nearestMinutes(1, moment(this.roster.startTime)).format()); // round to the nearest 30 minutes
      this.part1_duration = this.formatDuration(this.roster.startTime, this.startBreak);
      this.part2_duration = this.formatDuration(this.endBreak, this.roster.endTime);
      console.log(this.push_back_time);
      if (this.push_back_time) {
        console.log(this.finish_time);
        this.finish_time = addMinutes(this.finish_time, this.duration);
        if (this.endBreak) {
          this.part2_duration = this.formatDuration(this.endBreak, this.finish_time);
        }
      }
    } else {
      alert(errorString, 'Data Validation');
    }
  }

  saveRoster(newDuration: number) {
    if (this.validation === false) {
      alert('New Roster can not be empty ', 'Data Validation Error');
    } else {
      this.rosterService.splitRoster(this.roster_id, this.startBreak, newDuration, this.user, this.push_back_time).subscribe(response => {
        console.log(response.data);
        if (response.errorMessage === '') {
          window.close();
        } else {
          alert(response.errorMessage, 'Response Error');
        }
      });
    }
  }
  cancel() {
    window.close();

  }


  pushBackTime(e: any) {
    if (e && e.event) {
      this.push_back_time = e.value;
        }
      }


  formatDuration(date1: Date, date2: Date): string {
    let distance = Math.abs(date1.getTime() - date2.getTime());
    const hours = Math.floor(distance / 3600000);
    distance -= hours * 3600000;
    const minutes = Math.floor(distance / 60000);
    distance -= minutes * 60000;
    const seconds = Math.floor(distance / 1000);
    return `${hours}:${('0' + minutes).slice(-2)}`;

  }



}
