import { Injectable } from '@angular/core';
import { Effect, Actions, ofType } from '@ngrx/effects';
import {
  switchMap,
  map,
  mergeMap,
  withLatestFrom,
} from 'rxjs/operators';
import * as _ from 'lodash';
import { Store } from '@ngrx/store';
import * as LicensedFeaturesActions from './licensedfeatures.actions';
import {
  LicencedFeatureClient,
  SelectedBookingTypeDO,
  SelectedRoomDO,
  LicensedFeatureDO,
} from '../../../../../../Generated/CoreAPIClient';
import {
  editingDeviceSelector,
  selectLicensedFeatureState,
  worklistDevicesSelector,
} from './licensedfeatures.selectors';
import { LicensedFeatureState } from './licensedfeatures.reducers';
import { SetError, ToggleEditMode } from '../../app-store/app-ui-state.actions';

@Injectable()
export class LicensedFeatureEffects {
  // initial fetch of All licensed feature data
  @Effect()
  fetchLicensedFeatures = this.actions$.pipe(ofType(LicensedFeaturesActions.FETCH_LICENSEDFEATURES),
    switchMap(() => this.licencedFeatureClient.getLicensedFeatures().pipe(
      map((response) => new LicensedFeaturesActions.SetLicensedFeatures(response.data)))));

  @Effect()
  fetchLicensedFeature$ = this.actions$.pipe(ofType(LicensedFeaturesActions.FETCH_LICENSEDFEATURE),
    // eslint-disable-next-line max-len
    switchMap((action: LicensedFeaturesActions.FetchLicensedFeature) => this.licencedFeatureClient.getLicensedFeature(action.payload)
      .pipe(mergeMap((response) => [
        {
          type: LicensedFeaturesActions.SET_WORKLISTDEVICES,
          payload: response.data ? response.data : new LicensedFeatureDO(),
        },
      ],
      ))));

  @Effect()
  validateDevice$ = this.actions$.pipe(
    ofType<LicensedFeaturesActions.ValidateWorklistDevice>(LicensedFeaturesActions.VALIDATE_WORKLISTDEVICE),
    withLatestFrom(this.store.select(worklistDevicesSelector), this.store.select(selectLicensedFeatureState)),
    map(([action, worklist, state]) => {
      const enabledCount = worklist.filter((wl) => wl.enabled === true).length;
      const originalDevice = worklist.find((wl) => wl.id === action.payload.id);
      if (action.payload.name?.length > 19) {
        return new SetError({ errorMessages: ['AE Title cannot be more than 19 characters in length.'] });
      }
      if (originalDevice?.enabled !== action.payload.enabled) {
        if ((action.payload.enabled) && (enabledCount === state.selectedFeature.quantity)) {
          // eslint-disable-next-line max-len
          return new SetError({ errorMessages: ['Please only enable the amount of devices that is set with your License.'], title: 'Exceeded Limit' });
        }
      }
      return new LicensedFeaturesActions.SaveWorklistDevice();
    },
    ));
/*
  @Effect()
  postEditWorklistDevice$ = this.actions$.pipe(ofType(LicensedFeaturesActions.POST_EDIT_DEVICE),
    withLatestFrom(this.store.select(selectLicensedFeatureState)),
    map(([, state]) => {
      /*
      if (state?.editingDevice?.hasSettings) {
        const newState = _.cloneDeep(state);

        const updateBookingTypes = newState.selectedBookingTypes.filter((bt) => bt.selected);
        const updateLocationRooms = newState.selectedLocationRooms.filter((bt) => bt.selected);
        return { updateBookingTypes: [...updateBookingTypes], updateLocationRooms: [...updateLocationRooms] };
      }
      return { updateBookingTypes: SelectedBookingTypeDO[0], updateLocationRooms: SelectedRoomDO[0] };
    }), map(() => new LicensedFeaturesActions.SaveWorklistDevice()),
  );
  */

  @Effect()
  updateWorklistDevice$ = this.actions$.pipe(ofType(LicensedFeaturesActions.SAVE_WORKLISTDEVICE),
    withLatestFrom(this.store.select(editingDeviceSelector)),
    switchMap(([, device]) => this.licencedFeatureClient.saveWorklistDevice(device).pipe(
      switchMap((response) => [
        new LicensedFeaturesActions.UpdateWorklistDevice(response.data),
        new LicensedFeaturesActions.SelectDevice(response.data),
        new ToggleEditMode(),
      ]))));

  @Effect()
  fetchDicomWorklist = this.actions$.pipe(ofType(LicensedFeaturesActions.FETCH_DICOMWORKLIST), switchMap(
    (action: LicensedFeaturesActions.FetchDicomWorklist) => this.licencedFeatureClient.getDicomWorklist(action.payload)
      .pipe(map((response) => new LicensedFeaturesActions.SetDicomWorklist(response.data)))));

  constructor(private actions$: Actions,
    private licencedFeatureClient: LicencedFeatureClient,
    private store: Store<LicensedFeatureState>) {
  }
}
