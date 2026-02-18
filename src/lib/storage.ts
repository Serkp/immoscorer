import type { Property } from "./types";

const KEY = "immoscorer_properties";

function read(): Property[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(data: Property[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getProperties(): Property[] {
  return read();
}

export function addProperty(p: Property) {
  const list = read();
  list.unshift(p);
  write(list);
}

export function removeProperty(id: string) {
  write(read().filter((p) => p.id !== id));
}

export function toggleFavorite(id: string) {
  const list = read();
  const item = list.find((p) => p.id === id);
  if (item) item.favorite = !item.favorite;
  write(list);
}
