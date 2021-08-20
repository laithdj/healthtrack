import * as _ from 'lodash';
import { AppUiActions, AppUiActionTypes } from './app-ui-state.actions';
import { AlertPopup } from '../shared/models/AlertPopup.model';

export interface AppUiState {
  // boolean if user is authenticated
  authenticated: boolean;
  // auth license user token
  token?: string;
  // requested url
  requestedUrl?: string;
  // error message
  alertPopup?: AlertPopup;
  // close error message
  closePopup?: boolean;
  // true when first loading
  loading: boolean;
  // user username User_ID
  username?: string;
  // user Guid User_PK_ID
  userPkId?: string;
  // user license user id / session id
  licenseUserId?: number;
  // user DM role Id
  roleId?: number;
  // user DoctorId
  doctorId?: number;
  // users formatted Doctor Name
  doctorDisplayName?: string;
  // the authenticated user last billing location Id
  lastBillingLocation?: number;
  // url used for image template uploader api
  baseHealthTrackApiUrl?: string;
  // boolean current edit mode
  editMode: boolean;
  // user's dashboard preference
  dashboardId?: number;
  // user's formatted name
  userDisplayName?: string;
  // user's role
  role?: number;
  // logs
  log?: string[];
  // user is in admin mode/god mode
  inAdminMode?: boolean;
}

export const initialAppUiState: AppUiState = {
  authenticated: false,
  loading: true,
  editMode: false,
  log: [],
};

export function appUiStateReducer(state = initialAppUiState, action: AppUiActions) {
  switch (action.type) {
    case AppUiActionTypes.Authenticate:
      return {
        ...state,
        authenticated: false,
        token: action.payload.token,
        requestedUrl: action.payload.requestedUrl,
        loading: true,
      };

    case AppUiActionTypes.Authenticated:
      return {
        ...state,
        authenticated: action.payload,
        loading: false,
      };

    case AppUiActionTypes.SetLog: {
      const logs = _.cloneDeep(state.log);
      logs.push(action.payload);

      return {
        ...state,
        log: [...logs],
      };
    }

    case AppUiActionTypes.ToggleEditModeAction:
      return {
        ...state,
        editMode: !state.editMode,
        error: null,
      };

    case AppUiActionTypes.SetEditMode:
      return {
        ...state,
        editMode: action.payload,
      };

    case AppUiActionTypes.SetUser:
      return {
        ...state,
        username: action.payload.username,
        userPkId: action.payload.userPkId,
        licenseUserId: action.payload.licenseUserId,
        roleId: action.payload.roleId,
        doctorId: action.payload.doctorId,
        doctorDisplayName: action.payload.doctorDisplayName,
        dashboardId: action.payload.userDashboardId,
        lastBillingLocation: action.payload.lastBillingLocation,
        baseHealthTrackApiUrl: action.payload.baseHealthTrackApiUrl,
        userDisplayName: action.payload.userDisplayName,
        inAdminMode: action.payload.inAdminMode,
      };

    case AppUiActionTypes.SetError:
      return {
        ...state,
        alertPopup: new AlertPopup(action.payload.errorMessages, action.payload.title),
      };

    case AppUiActionTypes.CloseError:
      return {
        ...state,
        closePopup: action.payload,
      };

    case AppUiActionTypes.SetLoading: {
      return {
        ...state,
        loading: action.payload,
      };
    }

    default:
      return state;
  }
}
