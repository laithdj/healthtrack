import {
  QuestionnaireTemplateDO, TemplateSubRecordTypesResponse,
} from '../../../../../../Generated/CoreAPIClient';
import { AppState } from '../../app-store/reducers';
import { QuestionnaireActions, QuestionnaireActionTypes } from './questionnaire.actions';

export interface QuestionnaireAppState extends AppState {
  // eslint-disable-next-line no-use-before-define
  'questionnaireState': QuestionnaireState;
}

export interface QuestionnaireState {
  questionnaireTemplates:QuestionnaireTemplateDO[]
  questionnaireTemplate:QuestionnaireTemplateDO
  recordSubcategory:TemplateSubRecordTypesResponse
}

const initialState: QuestionnaireState = {
  questionnaireTemplates: [],
  questionnaireTemplate: new QuestionnaireTemplateDO(),
  recordSubcategory: new TemplateSubRecordTypesResponse(),
};

export function questionnaireReducers(state = initialState, action: QuestionnaireActions): QuestionnaireState {
  switch (action.type) {
    case QuestionnaireActionTypes.InitFetchTemplatesSuccess: {
      let templates = [...action.payload];
      templates = templates.filter((a) => !a.deleted);

      return {
        ...state,
        questionnaireTemplates: [...templates],
      };
    }
    case QuestionnaireActionTypes.InitFetchTemplateSuccess: {
      return {
        ...state,
        questionnaireTemplate: action.payload,
      };
    }
    case QuestionnaireActionTypes.InitFetchRecordSubCategoryListSuccess: {
      return {
        ...state,
        recordSubcategory: action.payload,
      };
    }

    default:
      return state;
  }
}
