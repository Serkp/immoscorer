import type { PropertyInput, ScoringResult } from "./scoring";

export interface SavedProperty {
  id: string;
  input: PropertyInput;
  result: ScoringResult;
  favorite: boolean;
  createdAt: string;
}

export interface SavedAnalysis {
  id: string;
  propertyId: string;
  input: PropertyInput;
  result: ScoringResult;
  createdAt: string;
}
