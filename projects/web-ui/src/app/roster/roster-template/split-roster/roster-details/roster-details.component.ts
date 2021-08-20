import { Component, OnInit, Input } from '@angular/core';
import { RosterBookingDO } from '../../../../../../../../Generated/CoreAPIClient';

@Component({
  selector: 'app-roster-details',
  templateUrl: './roster-details.component.html',
  styleUrls: ['./roster-details.component.css']
})
export class RosterDetailsComponent implements OnInit {
widgets: String[] = ['fdf', 'SDf'];
combine: string;
private _roster: RosterBookingDO;

@Input() set roster(roster: RosterBookingDO) {
  this._roster = roster;
}
get roster(): RosterBookingDO {
  return this._roster;
}
  constructor() { }

  ngOnInit() {
  }
  comibineLocation(location: string, room: string): string {
    let combineText = '';
    if (room) {
      combineText = location + ' ' + '(' + room + ')';
      this.combine = combineText;
    } else {
      combineText = location;
      this.combine = combineText;
    }
    return combineText;
  }

}
