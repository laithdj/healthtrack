import { PcProgramDetailComponent } from './pc-program-detail.component';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { ActionDO,
    PCProgramsClient,
    PCActionClient,
    InternalDoctorsClient,
    LocationClient,
    EffectedConnectsOnProgramDO,
    ProgramTypeDO,
} from '../../../../../Generated/CoreAPIClient';
import {
    DxTextBoxModule,
    DxValidatorModule,
    DxCheckBoxModule,
    DxNumberBoxModule,
    DxRadioGroupModule,
    DxButtonModule,
    DxValidationGroupModule,
    DxPopupModule,
    DxDataGridModule,
    DxFormModule,
    DxListModule,
    DxSelectBoxModule
} from 'devextreme-angular';
import { PcActionListComponent } from './pc-action-list/pc-action-list.component';
import { PcBookingtypesListComponent } from './pc-bookingtypes-list/pc-bookingtypes-list.component';
import { PcProgramWizardComponent } from './pc-program-wizard/pc-program-wizard.component';
import { PcProgramTimelineComponent } from './pc-program-timeline/pc-program-timeline.component';
import { PcPatientsOnProgramComponent } from './pc-patients-on-program/pc-patients-on-program.component';
import { PcActionDetailComponent } from './pc-action-detail/pc-action-detail.component';
import { PcActionChangedComponent } from './pc-action-changed/pc-action-changed.component';
import { PcProgramMoveComponent } from './pc-program-move/pc-program-move.component';
import { PcMovingStepSelectComponent } from './pc-program-move/pc-moving-step-select/pc-moving-step-select.component';
import { PatientConnectService } from '../../patientconnect.service';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { reducers, metaReducers } from '../../../app-store/reducers';

import { StoreModule } from '@ngrx/store';

describe('PC Program Detail Component', () => {
    let fixture: ComponentFixture<PcProgramDetailComponent>;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                PcProgramDetailComponent,
                PcActionListComponent,
                PcBookingtypesListComponent,
                PcProgramWizardComponent,
                PcProgramTimelineComponent,
                PcPatientsOnProgramComponent,
                PcActionDetailComponent,
                PcActionChangedComponent,
                PcProgramMoveComponent,
                PcMovingStepSelectComponent,
            ],
            imports: [
                DxTextBoxModule,
                DxValidatorModule,
                DxValidationGroupModule,
                DxCheckBoxModule,
                DxNumberBoxModule,
                DxRadioGroupModule,
                DxButtonModule,
                DxPopupModule,
                DxDataGridModule,
                DxFormModule,
                DxListModule,
                DxSelectBoxModule,
                StoreModule.forRoot(reducers, { metaReducers })
            ],
            providers: [
                PatientConnectService,
                PCProgramsClient,
                HttpClient,
                HttpHandler,
                PCActionClient,
                InternalDoctorsClient,
                LocationClient,
            ]
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(PcProgramDetailComponent);
            // component = fixture.componentInstance;
        });
    }));
    it('actionsHaveBeenChanged: should not be changed', () => {
        expect(fixture.componentInstance.actionsHaveBeenChanged([new ActionDO()], [new ActionDO()])).toBe(false);
    });
    it('actionsHaveBeenChanged: should be changed - more actions', () => {
        expect(fixture.componentInstance.actionsHaveBeenChanged([new ActionDO()], [new ActionDO()].concat([new ActionDO()]))).toBe(true);
    });
    it('actionsHaveBeenChanged: should be changed - changed steps', () => {
        const actionDO_1 = [new ActionDO().toJSON()];
        actionDO_1[0].step = 1;
        actionDO_1[0].action = 1;
        const actionDO_2 = [new ActionDO().toJSON()];
        actionDO_2[0].step = 2;
        actionDO_2[0].action = 2;
        expect(fixture.componentInstance.actionsHaveBeenChanged(actionDO_1, actionDO_2)).toBe(true);
    });
    it('getCountOfEffectedPatients: should not be changed', () => {
        const effected = new EffectedConnectsOnProgramDO().toJSON();
        effected.effectedConnectSteps = new Array(4).fill({ effectedCount: 1 });
        expect(fixture.componentInstance.getCountOfEffectedPatients(effected)).toBe(4);
    });
    it('programTypeForUI: should return Recall Type', () => {
        const pt = [new ProgramTypeDO().toJSON()];
        pt[0] = { id: 1, typeName: 'Recall' };
        expect(fixture.componentInstance.programTypeForUI(0, pt)).toBe(pt[0].typeName);
    });
});
