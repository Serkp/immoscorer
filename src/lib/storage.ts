import type { SavedProperty, SavedAnalysis } from "./types";
import type { PropertyInput, ScoringResult } from "./scoring";

const PROP_KEY = "immoscorer_properties";
const ANALYSIS_KEY = "immoscorer_analyses";

function readJSON<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
}

function writeJSON<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function saveProperty(input: PropertyInput, result: ScoringResult): SavedProperty {
  const list = readJSON<SavedProperty>(PROP_KEY);
  const item: SavedProperty = { id: crypto.randomUUID(), input, result, favorite: false, createdAt: new Date().toISOString() };
  list.unshift(item);
  writeJSON(PROP_KEY, list);
  return item;
}

export function getProperties(): SavedProperty[] {
  return readJSON<SavedProperty>(PROP_KEY);
}

export function deleteProperty(id: string) {
  writeJSON(PROP_KEY, readJSON<SavedProperty>(PROP_KEY).filter((p) => p.id !== id));
}

export function toggleFavorite(id: string) {
  const list = readJSON<SavedProperty>(PROP_KEY);
  const item = list.find((p) => p.id === id);
  if (item) item.favorite = !item.favorite;
  writeJSON(PROP_KEY, list);
}

export function saveAnalysis(propertyId: string, input: PropertyInput, result: ScoringResult): SavedAnalysis {
  const list = readJSON<SavedAnalysis>(ANALYSIS_KEY);
  const item: SavedAnalysis = { id: crypto.randomUUID(), propertyId, input, result, createdAt: new Date().toISOString() };
  list.unshift(item);
  writeJSON(ANALYSIS_KEY, list);
  return item;
}

export function getAnalyses(): SavedAnalysis[] {
  return readJSON<SavedAnalysis>(ANALYSIS_KEY);
}
