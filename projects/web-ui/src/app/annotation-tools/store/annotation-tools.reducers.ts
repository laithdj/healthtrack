import * as AnnotationToolsActions from './annotation-tools.actions';
import { AnnotationToolDO } from '../../../../../../Generated/CoreAPIClient';

export interface AnnotationToolsState {
  annotationTools: AnnotationToolDO[];
}

const initialState: AnnotationToolsState = {
  annotationTools: []
};

export function annotationToolsReducers(state = initialState,
  action: AnnotationToolsActions.AnnotationToolsActions): AnnotationToolsState {
  switch (action.type) {

    case AnnotationToolsActions.FETCH_ANNOTATION_TOOLS_SUCCESS:
    case AnnotationToolsActions.SAVE_ANNOTATION_TOOLS_SUCCESS:
      return {
        ...state,
        annotationTools: [...action.payload]
      };

    default:
      return state;
  }
}
