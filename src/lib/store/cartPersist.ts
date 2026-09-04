import { clampQuantity } from "@/lib/cart/calculations";

/** localStorage key used by Zustand persist. */
export const CART_STORAGE_KEY = "objekt-cart";

/** One line in the bag — what we persist. */
export interface CartItem {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  category: string;
  quantity: number;
}

/**
 * Safely read/write cart JSON in localStorage.
 * Falls back to a no-op memory store if localStorage is unavailable.
 */
export function createCartStorage(): Storage {
  try {
    const key = "__objekt_cart_probe__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return window.localStorage;
  } catch {
    const memory = new Map<string, string>();
    return {
      get length() {
        return memory.size;
      },
      clear: () => memory.clear(),
      getItem: (k) => memory.get(k) ?? null,
      key: (i) => Array.from(memory.keys())[i] ?? null,
      removeItem: (k) => {
        memory.delete(k);
      },
      setItem: (k, v) => {
        memory.set(k, v);
      },
    };
  }
}

/** Validate and normalize one persisted cart line. Returns null if unusable. */
export function normalizeCartItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as Record<string, unknown>;
  const id = Number(item.id);
  if (!Number.isFinite(id)) return null;

  const title = typeof item.title === "string" ? item.title.trim() : "";
  const thumbnail = typeof item.thumbnail === "string" ? item.thumbnail.trim() : "";
  if (!title || !thumbnail) return null;

  const priceNum = Number(item.price);
  const price = Number.isFinite(priceNum) && priceNum >= 0 ? priceNum : 0;
  const category =
    typeof item.category === "string" && item.category.trim()
      ? item.category.trim()
      : "objects";

  return {
    id,
    title,
    thumbnail,
    category,
    price,
    quantity: clampQuantity(item.quantity),
  };
}

/**
 * Restore a cart list from persisted JSON.
 * Drops invalid rows, clamps qty to 1–5, and dedupes by product id.
 */
export function normalizePersistedCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];

  const byId = new Map<number, CartItem>();

  for (const entry of raw) {
    const item = normalizeCartItem(entry);
    if (!item) continue;
    byId.set(item.id, item);
  }

  return Array.from(byId.values());
}
