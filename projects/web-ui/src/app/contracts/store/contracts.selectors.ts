import { createFeatureSelector } from "@ngrx/store";
import { ContractState } from "./contracts.reducers";

export const selectContractsState = createFeatureSelector<ContractState>('contractState');
