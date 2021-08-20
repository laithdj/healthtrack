import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import * as _ from 'lodash';
import {
  ProgramDO,
  ProgramType,
  ProgramTypeDO,
} from '../../../../../../../Generated/CoreAPIClient';
import { NewPatientConnect } from './new-patient-connect.model';

@Component({
  selector: 'app-new-patient-connect',
  templateUrl: './new-patient-connect.component.html',
  styleUrls: ['./new-patient-connect.component.css'],
})
export class NewPatientConnectComponent implements OnInit {
  private _newPatientConnect: NewPatientConnect = { showPopup: false, defaultType: ProgramType.General };
  private _typesList: ProgramTypeDO[];
  private _programs: ProgramDO[];

  patientConnectTypesList: ProgramTypeDO[];
  filteredProgramsList: ProgramDO[];
  selectedProgram: ProgramDO;
  selectedRowKeys = [];
  loaded = false;

  @Input() referralId: number;
  @Input() set programs(progs: ProgramDO[]) {
    this._programs = _.cloneDeep(progs);
    this.onTypeChanged();
  }
  get programs(): ProgramDO[] {
    return this._programs;
  }
  @Input() selectedType: number = ProgramType.General;
  @Input() set newPatientConnect(newPatientConnect: NewPatientConnect) {
    this._newPatientConnect = _.cloneDeep(newPatientConnect);
    this.selectedType = newPatientConnect?.defaultType;

    const programsList = this.programs?.filter((a) => a.type === this.selectedType);
    if (programsList?.length > 0) {
      this.selectedRowKeys = [programsList[0].id];
    } else {
      this.selectedRowKeys = [];
    }

    this.onSelectionChanged();
  }
  get newPatientConnect(): NewPatientConnect {
    return this._newPatientConnect;
  }

  @Input() set patientConnectTypeList(types: ProgramTypeDO[]) {
    this._typesList = types;
    const typeList: ProgramTypeDO[] = [];

    types?.forEach((type: ProgramTypeDO) => {
      const item = new ProgramTypeDO();
      item.id = type.id;
      item.typeName = type.typeName ? type.typeName : '';
      typeList.push(item);
    });

    const idx = typeList?.findIndex((a) => a.id === ProgramType.General);
    const general = idx > -1 ? _.cloneDeep(typeList[idx]) : undefined;

    if (general) {
      typeList.splice(idx, 1);
      typeList.unshift(general);
    }

    const allType = new ProgramTypeDO();
    allType.id = 0;
    allType.typeName = 'All';
    typeList.unshift(allType);

    this.patientConnectTypesList = typeList;
  }
  get patientConnectTypeList(): ProgramTypeDO[] {
    return this._typesList;
  }

  @Output() newPatientConnectPopupClosed: EventEmitter<void> = new EventEmitter();
  @Output() addNewPatientConnect: EventEmitter<ProgramDO> = new EventEmitter();

  constructor() { }

  ngOnInit(): void { }

  onTypeChanged() {
    if (this.selectedType === 0) {
      this.filteredProgramsList = _.cloneDeep(this.programs);
    } else {
      this.filteredProgramsList = this.programs?.filter((a) => a.type === this.selectedType);
    }

    if (this.filteredProgramsList?.length > 0) {
      this.selectedRowKeys = [this.filteredProgramsList[0].id];
    }
  }

  onSelectionChanged() {
    if (this.selectedRowKeys?.length === 1 && this.programs?.length > 0) {
      const idx = this.programs.findIndex((a) => a.id === this.selectedRowKeys[0]);

      if (idx > -1) {
        this.selectedProgram = this.programs[idx];
      }
    }
  }

  onConfirmProgram() {
    this.addNewPatientConnect.emit(this.selectedProgram);
    this.popupClosed();
  }

  popupClosed() {
    this.newPatientConnectPopupClosed.emit();
    this.loaded = false;
  }
}
