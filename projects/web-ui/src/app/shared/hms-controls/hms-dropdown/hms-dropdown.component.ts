import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'hms-dropdown',
  templateUrl: './hms-dropdown.component.html',
  styleUrls: ['./hms-dropdown.component.css']
})
export class HmsDropdownComponent implements OnInit {
  @Input() searchEnabled = false;
  @Input() displayExp: any;
  @Input() valueExp: any;
  @Input() class: string;
  @Input() value: any;
  @Input() items:any[];
  @Output() onValueChanged: EventEmitter<any> = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }
  onValueChangedClicked(e: any) {
    this.onValueChanged.emit(e);
  }
}
