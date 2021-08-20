/* eslint-disable max-classes-per-file */
import { Action } from '@ngrx/store';
import {
  WorkListDeviceDO,
  SelectedBookingTypeDO,
  SelectedRoomDO,
  AllLicensedFeatureDataDO,
  DicomWorklistItemDO,
  LicensedFeatureDO,
} from '../../../../../../Generated/CoreAPIClient';
import { FeatureVM } from '../view-models/feature.vm';

export const FETCH_LICENSEDFEATURES = 'FETCH_LICENSEDFEATURES';
export const SET_LICENSEDFEATURES = 'SET_LICENSEDFEATURES';
export const FETCH_LICENSEDFEATURE = 'FETCH_LICENSEDFEATURE';
export const SET_LICENSEDFEATURE = 'SET_LICENSEDFEATURE';
export const SET_WORKLISTDEVICES = 'SET_WORKLISTDEVICES';
export const SELECT_DEVICE = 'SELECT_DEVICE';
export const POST_EDIT_DEVICE = 'POST_EDIT_DEVICE';
export const RESET_EDITED_DEVICE = 'RESET_EDITED_DEVICE';
export const UPDATE_EDITINGDEVICE = 'UPDATE_EDITINGDEVICE';
export const UPDATE_WORKLISTDEVICE = 'UPDATE_WORKLISTDEVICE';
export const VALIDATE_WORKLISTDEVICE = 'VALIDATE_WORKLISTDEVICE';
export const SAVE_WORKLISTDEVICE = 'SAVE_WORKLISTDEVICE';
export const UPDATE_BOOKINGTYPES = 'UPDATE_BOOKINGTYPES';
export const UPDATE_LOCATIONROOMS = 'UPDATE_LOCATIONROOMS';
export const CLEAR_DEVICE_SETTINGS = 'CLEAR_DEVICE_SETTINGS';
export const CHECK_BOOKINGTYPES = 'CHECK_BOOKINGTYPES';
export const CHECK_LOCATIONROOMS = 'CHECK_LOCATIONROOMS';
export const SET_DEFAULTSETTING = 'SET_DEFAULTSETTING';
export const FETCH_DICOMWORKLIST = 'FETCH_DICOMWORKLIST';
export const SET_DICOMWORKLIST = 'SET_DICOMWORKLIST';
export const SET_SHOWWORKLIST = 'SET_SHOWWORKLIST';

export class FetchLicensedFeatures implements Action {
  readonly type = FETCH_LICENSEDFEATURES;
}

export class SetLicensedFeatures implements Action {
  readonly type = SET_LICENSEDFEATURES;
  constructor(public payload: AllLicensedFeatureDataDO) {}
}

export class FetchLicensedFeature implements Action {
  readonly type = FETCH_LICENSEDFEATURE;
  constructor(public payload: number) {}
}

export class SetLicensedFeature implements Action {
  readonly type = SET_LICENSEDFEATURE;
  constructor(public payload: LicensedFeatureDO) {}
}

export class SetWorkListDevices implements Action {
  readonly type = SET_WORKLISTDEVICES;
  constructor(public payload: LicensedFeatureDO) {}
}

export class SelectDevice implements Action {
  readonly type = SELECT_DEVICE;
  constructor(public payload: WorkListDeviceDO) {}
}

export class PostEditDevice implements Action {
  readonly type = POST_EDIT_DEVICE;
}

export class ResetEditedDevice implements Action {
  readonly type = RESET_EDITED_DEVICE;
}

export class UpdateEditingDevice implements Action {
  readonly type = UPDATE_EDITINGDEVICE;

  constructor(public payload: WorkListDeviceDO) { }
}

export class UpdateWorklistDevice implements Action {
  readonly type = UPDATE_WORKLISTDEVICE;

  constructor(public payload: WorkListDeviceDO) {}
}

export class ValidateWorklistDevice implements Action {
  readonly type = VALIDATE_WORKLISTDEVICE;

  constructor(public payload: WorkListDeviceDO) { }
}

export class SaveWorklistDevice implements Action {
  readonly type = SAVE_WORKLISTDEVICE;
}

export class UpdateBookingTypes implements Action {
  readonly type = UPDATE_BOOKINGTYPES;
  constructor(public payload: SelectedBookingTypeDO[]) {}
}

export class UpdateLocationRooms implements Action {
  readonly type = UPDATE_LOCATIONROOMS;
  constructor(public payload: SelectedRoomDO[]) {}
}

export class ClearDeviceSettings implements Action {
  readonly type = CLEAR_DEVICE_SETTINGS;
}

export class CheckBookingTypes implements Action {
  readonly type = CHECK_BOOKINGTYPES;
  constructor(public payload: boolean) {}
}

export class CheckLocationRooms implements Action {
  readonly type = CHECK_LOCATIONROOMS;
  constructor(public payload: boolean) {}
}

export class SetDefaultSettings implements Action {
  readonly type = SET_DEFAULTSETTING;
  constructor(public payload: { deviceMode, preloadDays}) {}
}

export class FetchDicomWorklist implements Action {
  readonly type = FETCH_DICOMWORKLIST;
  constructor(public payload: string) {}
}

export class SetDicomWorklist implements Action {
  readonly type = SET_DICOMWORKLIST;
  constructor(public payload: DicomWorklistItemDO[]) {}
}

export class SetShowWorklist implements Action {
  readonly type = SET_SHOWWORKLIST;
  constructor(public payload: boolean) {}
}

export type LicensedFeaturesActions = FetchLicensedFeatures |
SetLicensedFeatures |
FetchLicensedFeature |
SetLicensedFeature |
SetWorkListDevices |
SelectDevice |
ResetEditedDevice |
UpdateEditingDevice |
UpdateWorklistDevice |
ValidateWorklistDevice |
SaveWorklistDevice |
UpdateBookingTypes |
UpdateLocationRooms |
ClearDeviceSettings |
CheckBookingTypes |
CheckLocationRooms |
SetDefaultSettings |
FetchDicomWorklist |
SetDicomWorklist |
SetShowWorklist;
