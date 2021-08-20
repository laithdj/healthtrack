import * as _ from 'lodash';
import { AppState } from '../../app-store/reducers';
import {
  DicomWorklistItemDO,
  LicensedFeatureDO,
  ModalityDO,
  SelectedBookingTypeDO,
  SelectedRoomDO,
  WorkListDeviceDO,
} from '../../../../../../Generated/CoreAPIClient';
import { alert } from 'devextreme/ui/dialog';
import { FeatureVM } from '../view-models/feature.vm';
import * as LicensedFeaturesActions from './licensedfeatures.actions';

export interface LicensedFeatureAppState extends AppState {
  // eslint-disable-next-line no-use-before-define
  'licensedFeatureState': LicensedFeatureState;
}

export interface LicensedFeatureState {
  features: LicensedFeatureDO[];
  selectedFeature: LicensedFeatureDO;
  worklistDevices: WorkListDeviceDO[];
  editingDevice: WorkListDeviceDO;
  modalityList: ModalityDO[];
  selectedBookingTypes: SelectedBookingTypeDO[];
  allBookingTypes: SelectedBookingTypeDO[];
  allLocationRooms: SelectedRoomDO[];
  selectedLocationRooms: SelectedRoomDO[];
  dicomWorklist: DicomWorklistItemDO[];
  showDicomWorklist: boolean;
  updatedDevice:boolean;
}

export const initialState: LicensedFeatureState = {
  features: [],
  selectedFeature: null,
  worklistDevices: [],
  editingDevice: null,
  modalityList: [],
  selectedBookingTypes: [],
  allBookingTypes: [],
  allLocationRooms: [],
  selectedLocationRooms: [],
  dicomWorklist: [],
  showDicomWorklist: false,
  updatedDevice: false
};

export function mapLicensedFeaturesToVMs(licensedfeatures: LicensedFeatureDO[]): FeatureVM[] {
  const licFeatures = _.cloneDeep(licensedfeatures);
  const featureViewModels = licFeatures.map<FeatureVM>((lf) => ({
    id: lf.featureKey,
    displayFeature: `${lf.featureName} (${lf.quantity})`,
    hasLocationRooms: lf.hasLocationRooms,
    hasSettings: lf.hasSettings,
    quantity: lf.quantity,
  }));

  return featureViewModels;
}

export function licensedfeaturesReducers(state = initialState,
  action: LicensedFeaturesActions.LicensedFeaturesActions) {
  switch (action.type) {
    case LicensedFeaturesActions.SET_LICENSEDFEATURES: {
      const features = mapLicensedFeaturesToVMs(_.cloneDeep(action.payload.licensedFeatures));

      return {
        ...state,
        features: [...features],
        allBookingTypes: [...action.payload.allBookingTypes],
        allLocationRooms: [...action.payload.allLocationRooms],
        modalityList: [...action.payload.allModalities],
      };
    }

    case LicensedFeaturesActions.SET_LICENSEDFEATURE: {
      return {
        ...state,
        selectedFeature: action.payload,
      };
    }

    case LicensedFeaturesActions.SET_WORKLISTDEVICES: {
      let feature = action.payload;
      // eslint-disable-next-line max-len
      const selectedDevice = action.payload.featureData ? _.cloneDeep(action.payload.featureData[0]) : new WorkListDeviceDO();
      const selectedBookingTypes = _.cloneDeep(state.allBookingTypes);
      const selectedLocationRooms = _.cloneDeep(state.allLocationRooms);
      if (feature.quantity < 1) {
        // eslint-disable-next-line max-len
        alert('There is no license for this feature. Please check the license for this feature.', 'License Validation');
        feature = null;
      } else if (!feature.featureData) {
        alert('There is no data for this feature.', 'Validation');
        feature = null;
      }
      if (selectedDevice) {
        if (selectedDevice.selectedBookingTypes) {
          selectedDevice.selectedBookingTypes.forEach((bt) => {
            const bookingTypes = _.find(selectedBookingTypes, (s) => s.bookingType === bt.bookingType);
            if (bookingTypes) {
              bookingTypes.selected = true;
            }
          });
        }
        if (selectedDevice.selectedLocationRooms) {
          selectedDevice.selectedLocationRooms.forEach((bt) => {
            const selectedLocationRoomsKey = _.find(selectedLocationRooms, (s) => s.key === bt.key);
            if (selectedLocationRoomsKey) {
              selectedLocationRoomsKey.selected = true;
            }
          });
        }
      }

      return {
        ...state,
        editingDevice: selectedDevice,
        selectedFeature: feature,
        worklistDevices: action.payload.featureData ? [...action.payload.featureData] : [],
        selectedBookingTypes: [...selectedBookingTypes],
        selectedLocationRooms: [...selectedLocationRooms],
      };
    }

    case LicensedFeaturesActions.SELECT_DEVICE: {
      const editingIndex = state.worklistDevices.findIndex((d) => d.id === action.payload.id);
      const selectedDevice = _.cloneDeep(state.worklistDevices[editingIndex]);

      const selectedBookingTypes = _.cloneDeep(state.allBookingTypes);
      if (selectedDevice.selectedBookingTypes) {
        selectedDevice.selectedBookingTypes.forEach((bt) => {
          const selectedBookingType = _.find(selectedBookingTypes, (s) => s.bookingType === bt.bookingType);
          if (selectedBookingType) {
            selectedBookingType.selected = true;
          }
        });
      }

      const selectedLocationRooms = _.cloneDeep(state.allLocationRooms);
      if (selectedDevice.selectedLocationRooms) {
        selectedDevice.selectedLocationRooms.forEach((bt) => {
          const selectedLocationRoomsKey = _.find(selectedLocationRooms, (s) => s.key === bt.key);
          if (selectedLocationRoomsKey) {
            selectedLocationRoomsKey.selected = true;
          }
        });
      }

      return {
        ...state,
        editingDevice: selectedDevice,
        selectedBookingTypes: [...selectedBookingTypes],
        selectedLocationRooms: [...selectedLocationRooms],
      };
    }

    case LicensedFeaturesActions.RESET_EDITED_DEVICE: {
      const resetIndex = state.worklistDevices.findIndex((d) => d.id === state.editingDevice.id);
      const selectedDevice = new WorkListDeviceDO(state.worklistDevices[resetIndex]);

      const selectedBookingTypes = _.cloneDeep(state.allBookingTypes);
      if (selectedDevice.selectedBookingTypes) {
        selectedDevice.selectedBookingTypes.forEach((bt) => {
          const bookingType = _.find(selectedBookingTypes, (s) => s.bookingType === bt.bookingType);
          if (bookingType) {
            bookingType.selected = true;
          }
        });
      }

      const selectedLocationRooms = _.cloneDeep(state.allLocationRooms);
      if (selectedDevice.selectedLocationRooms) {
        selectedDevice.selectedLocationRooms.forEach((bt) => {
          const locationRoom = _.find(selectedLocationRooms, (s) => s.key === bt.key);
          if (locationRoom) {
            locationRoom.selected = true;
          }
        });
      }

      return {
        ...state,
        editingDevice: selectedDevice,
        selectedLocationRooms: [...selectedLocationRooms],
        selectedBookingTypes: [...selectedBookingTypes],
      };
    }

    case LicensedFeaturesActions.UPDATE_WORKLISTDEVICE: {
      const worklistdevices = _.cloneDeep(state.worklistDevices);
      const updateIndex = worklistdevices.findIndex((d) => d.id === state.editingDevice.id);
      worklistdevices[updateIndex] = _.cloneDeep(action.payload);
      const editingdevice = _.cloneDeep(action.payload);

      return {
        ...state,
        worklistDevices: [...worklistdevices],
        editingDevice: editingdevice,
      };
    }

    case LicensedFeaturesActions.UPDATE_EDITINGDEVICE: {
      return {
        ...state,
        updatedDevice : true,
        editingDevice: action.payload,
      };
    }

    case LicensedFeaturesActions.UPDATE_BOOKINGTYPES: {
      const editingdevice = _.cloneDeep(state.editingDevice);
      editingdevice.selectedBookingTypes = [...action.payload];

      return {
        ...state,
        editingDevice: editingdevice,
      };
    }

    case LicensedFeaturesActions.UPDATE_LOCATIONROOMS: {
      const updateRoomsState = _.cloneDeep(state.editingDevice);
      updateRoomsState.selectedLocationRooms = action.payload;

      return {
        ...state,
        editingDevice: updateRoomsState,
      };
    }

    case LicensedFeaturesActions.CLEAR_DEVICE_SETTINGS: {
      const clearedDevice = _.cloneDeep(state.editingDevice);
      clearedDevice.name = '';
      clearedDevice.enabled = false;
      clearedDevice.ipAddress = '';
      clearedDevice.port = 0;
      clearedDevice.make = '';
      clearedDevice.model = '';
      clearedDevice.serialNumber = '';
      clearedDevice.modality = 'US';
      clearedDevice.preloadDays = 0;
      clearedDevice.deviceMode = 0;
      clearedDevice.mrnPreference = 0;
      clearedDevice.mrnRequired = false;
      clearedDevice.selectedBookingStatus.forEach((s) => { s.selected = false; });
      clearedDevice.selectedBookingTypes = [];
      clearedDevice.selectedLocationRooms = [];

      const selectedBookingTypes = _.cloneDeep(state.allBookingTypes);
      if (clearedDevice.selectedBookingTypes) {
        clearedDevice.selectedBookingTypes.forEach((bt) => {
          const selectedBookingTypesKeys = _.find(state.selectedBookingTypes, (s) => s.bookingType === bt.bookingType);
          if (selectedBookingTypesKeys) {
            selectedBookingTypesKeys.selected = true;
          }
        });
      }

      const selectedLocationRooms = _.cloneDeep(state.allLocationRooms);
      if (clearedDevice.selectedLocationRooms) {
        clearedDevice.selectedLocationRooms.forEach((bt) => {
          const selectedRoomLocations = _.find(state.selectedLocationRooms, (s) => s.key === bt.key);
          if (selectedRoomLocations) {
            selectedRoomLocations.selected = true;
          }
        });
      }

      return {
        ...state,
        editingDevice: clearedDevice,
        selectedLocationRooms: [...selectedLocationRooms],
        selectedBookingTypes: [...selectedBookingTypes],
      };
    }

    case LicensedFeaturesActions.CHECK_BOOKINGTYPES: {
      const selectedbookingtypes = _.cloneDeep(state.selectedBookingTypes);
      const updatedDevice = _.cloneDeep(state.editingDevice);
      selectedbookingtypes.forEach((bt) => {
        bt.selected = action.payload;
      });
      if (action.payload) {
        updatedDevice.selectedBookingTypes = selectedbookingtypes;
      } else {
        updatedDevice.selectedBookingTypes = [];
      }
      return {
        ...state,
        editingDevice: updatedDevice,
        selectedBookingTypes: [...selectedbookingtypes],

      };
    }

    case LicensedFeaturesActions.CHECK_LOCATIONROOMS: {
      const selectedlocationrooms = _.cloneDeep(state.selectedLocationRooms);
      const updatedDevice = _.cloneDeep(state.editingDevice);

      selectedlocationrooms.forEach((r) => { r.selected = action.payload; });
      if (action.payload) {
        updatedDevice.selectedLocationRooms = selectedlocationrooms;
      } else {
        updatedDevice.selectedLocationRooms = [];
      }
      return {
        ...state,
        editingDevice: updatedDevice,
        selectedLocationRooms: [...selectedlocationrooms],
      };
    }

    case LicensedFeaturesActions.SET_DEFAULTSETTING: {
      const defaultSettingsDevice = _.cloneDeep(state.editingDevice);
      defaultSettingsDevice.deviceMode = action.payload.deviceMode;
      defaultSettingsDevice.preloadDays = action.payload.preloadDays;

      return {
        ...state,
        editingDevice: defaultSettingsDevice,
      };
    }

    case LicensedFeaturesActions.SET_DICOMWORKLIST: {
      return {
        ...state,
        dicomWorklist: [...action.payload],
        showDicomWorklist: true,
      };
    }

    case LicensedFeaturesActions.SET_SHOWWORKLIST: {
      return {
        ...state,
        showDicomWorklist: action.payload,
      };
    }

    default:
      return state;
  }
}
