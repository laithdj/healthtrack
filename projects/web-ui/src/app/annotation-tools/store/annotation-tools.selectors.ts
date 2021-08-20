import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AnnotationToolsState } from './annotation-tools.reducers';

export const selectAnnotationToolsFeatureState = createFeatureSelector<AnnotationToolsState>('annotationToolsState');

export const selectAnnotationTools = createSelector(
  selectAnnotationToolsFeatureState,
  state => state.annotationTools
);
