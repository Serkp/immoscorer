import { Property, PropertyStore } from "./types";

const STORAGE_KEY = "immoscorer_properties";

function getStore(): PropertyStore {
  if (typeof window === "undefined") return { version: 1, properties: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, properties: [] };
    const parsed = JSON.parse(raw) as PropertyStore;
    if (parsed.version === 1 && Array.isArray(parsed.properties)) return parsed;
    return { version: 1, properties: [] };
  } catch {
    return { version: 1, properties: [] };
  }
}

function saveStore(store: PropertyStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getProperties(): Property[] {
  return getStore().properties;
}

export function addProperty(property: Property) {
  const store = getStore();
  store.properties.push(property);
  saveStore(store);
}

export function updateProperty(id: string, updates: Partial<Property>) {
  const store = getStore();
  const idx = store.properties.findIndex((p) => p.id === id);
  if (idx !== -1) {
    store.properties[idx] = { ...store.properties[idx], ...updates };
    saveStore(store);
  }
}

export function deleteProperty(id: string) {
  const store = getStore();
  store.properties = store.properties.filter((p) => p.id !== id);
  saveStore(store);
}

export function toggleFavorite(id: string) {
  const store = getStore();
  const idx = store.properties.findIndex((p) => p.id === id);
  if (idx !== -1) {
    store.properties[idx].favorite = !store.properties[idx].favorite;
    saveStore(store);
  }
}
