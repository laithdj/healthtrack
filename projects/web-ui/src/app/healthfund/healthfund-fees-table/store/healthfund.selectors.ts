import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as _ from 'lodash';
import { HealthFundState } from './healthfund.reducers';

export const selectHealthFundState = createFeatureSelector<HealthFundState>('healthFundState');


export const selectServices = createSelector(
    selectHealthFundState,
    appState => appState.billItems
);

