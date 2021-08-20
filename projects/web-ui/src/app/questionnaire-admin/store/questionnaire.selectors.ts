import {
  createFeatureSelector,
  createSelector,
} from '@ngrx/store';
import { QuestionnaireState } from './questionnaire.reducers';

export const selectQuestionnaireFeatureState = createFeatureSelector<QuestionnaireState>('questionnaireState');

export const questionnaireState = createSelector(
  selectQuestionnaireFeatureState,
  (appState) => appState,
);
export const selectQuestionnaireTemplates = createSelector(
  selectQuestionnaireFeatureState,
  (appState) => appState.questionnaireTemplates,
);
export const selectQuestionnaireTemplate = createSelector(
  selectQuestionnaireFeatureState,
  (appState) => appState.questionnaireTemplate,
);
export const selectRecordSubCategory = createSelector(
  selectQuestionnaireFeatureState,
  (appState) => appState.recordSubcategory?.subRecordTypesDictionary,
);
