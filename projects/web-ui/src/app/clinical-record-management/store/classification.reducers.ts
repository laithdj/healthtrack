import { RecordClassification } from '../../../../../../Generated/CoreAPIClient';
import { ADD_CLASSIFICATIONS, ClassificationActions, REPLACE_CLASSIFICATIONS, POPULATE_USER_GROUPS, POPULATE_BILLING_GROUPS } from './classification.actions';


export interface RecordClassificationState {
  classifications: RecordClassification[];
  userGroups: string[];
  billingGroups: string[];
}

const initialState: RecordClassificationState = {
  classifications: [],
  userGroups: [],
  billingGroups: []
};

export function classificationReducers(state = initialState, action: ClassificationActions): RecordClassificationState {
  switch (action.type) {
    case ADD_CLASSIFICATIONS:
    return {
      ...state,
      classifications: [...state.classifications, ...action.payload]
    };

    case REPLACE_CLASSIFICATIONS:
    return {
      ...state,
      classifications: [...action.payload]
    };

    case POPULATE_USER_GROUPS:
    return {
      ...state,
      userGroups: [...action.payload]
    };

    case POPULATE_BILLING_GROUPS:
    return {
      ...state,
      billingGroups: [...action.payload]
    };
  }
  return state;
}
